"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface HeroSceneProps {
  theme: "light" | "dark";
}

const ROAD_WIDTH = 5;
const ROAD_LENGTH = 170;
const CHUNK_LENGTH = 45;
const CHUNKS_PER_SIDE = 3;
const SPEED = 13;
const TEXTURE_WORLD_LENGTH = 4;

/**
 * Normalizes any CSS color (including oklch custom properties) to sRGB bytes
 * by painting one pixel on a canvas and reading it back. THREE.Color cannot
 * parse oklch() strings directly, so we let the browser do the conversion.
 */
function parseCssColor(value: string, fallback: string): THREE.Color {
  const raw = value.trim() || fallback;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx) {
    try {
      ctx.fillStyle = raw;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return new THREE.Color(r / 255, g / 255, b / 255);
    } catch {
      return new THREE.Color(fallback);
    }
  }
  return new THREE.Color(fallback);
}

function toRgba(color: THREE.Color, alpha: number): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Deterministic hill profile shared by all terrain chunks. */
function terrainHeight(x: number, z: number): number {
  return (
    Math.sin(x * 0.35) * Math.cos(z * 0.22) * 1.6 +
    Math.sin(x * 0.12 + z * 0.3) * 2.2 +
    Math.cos(x * 0.05 - z * 0.08) * 3.0
  );
}

/** Flattens terrain near the road so hills rise only on the sides. */
function roadFalloff(x: number): number {
  const d = Math.max(0, Math.abs(x) - (ROAD_WIDTH / 2 + 1));
  return Math.min(1, d / 9);
}

function createRoadTexture(theme: "light" | "dark", primary: THREE.Color): THREE.CanvasTexture {
  const w = 128;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // asphalt wash
    ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.035)" : "rgba(20,20,24,0.07)";
    ctx.fillRect(0, 0, w, h);

    // crimson edge lines
    ctx.fillStyle = toRgba(primary, theme === "dark" ? 0.9 : 0.75);
    ctx.fillRect(4, 0, 3, h);
    ctx.fillRect(w - 7, 0, 3, h);

    // center dashes: 1.2u dash + 0.8u gap over 4u of road (256px)
    ctx.fillStyle = theme === "dark" ? "rgba(247,248,248,0.85)" : "rgba(35,37,42,0.6)";
    const dashW = 5;
    const dashH = 77;
    const gap = 51;
    for (let y = 0; y < h; y += dashH + gap) {
      ctx.fillRect(w / 2 - dashW / 2, y, dashW, dashH);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, ROAD_LENGTH / TEXTURE_WORLD_LENGTH);
  return texture;
}

function createGlowTexture(primary: THREE.Color): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, toRgba(primary, 0.9));
    gradient.addColorStop(0.45, toRgba(primary, 0.35));
    gradient.addColorStop(1, toRgba(primary, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export default function HeroScene({ theme }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const styles = getComputedStyle(document.documentElement);
    const primary = parseCssColor(
      styles.getPropertyValue("--primary"),
      theme === "dark" ? "#ff3b30" : "#c62828"
    );
    const background = parseCssColor(
      styles.getPropertyValue("--background"),
      theme === "dark" ? "#0a0a0b" : "#ffffff"
    );

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(background.clone(), 6, 52);

    const camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      220
    );
    camera.position.set(0, 1.6, 0);
    camera.lookAt(0, 1.1, -30);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // WebGL not available — hero keeps its static background
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    // --- Road ---
    const roadTexture = createRoadTexture(theme, primary);
    roadTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(roadTexture);

    const roadGeometry = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH);
    roadGeometry.rotateX(-Math.PI / 2);
    geometries.push(roadGeometry);
    const roadMaterial = new THREE.MeshBasicMaterial({
      map: roadTexture,
      transparent: true,
      fog: true,
    });
    materials.push(roadMaterial);
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.position.set(0, 0, -ROAD_LENGTH / 2 + 12);
    scene.add(road);

    // --- Side terrain chunks (cycled for infinite forward motion) ---
    const terrainMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: primary.clone(),
      transparent: true,
      opacity: theme === "dark" ? 0.1 : 0.14,
      fog: true,
    });
    materials.push(terrainMaterial);

    const chunks: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < CHUNKS_PER_SIDE; i++) {
        const geometry = new THREE.PlaneGeometry(42, CHUNK_LENGTH, 30, 32);
        geometry.rotateX(-Math.PI / 2);
        geometries.push(geometry);

        const mesh = new THREE.Mesh(geometry, terrainMaterial);
        const x = side * (ROAD_WIDTH / 2 + 21);
        const z = 12 - CHUNK_LENGTH / 2 - i * CHUNK_LENGTH;
        mesh.position.set(x, 0, z);

        // Bake hills using initial world coords; distant seams are hidden by fog
        const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let v = 0; v < pos.count; v++) {
          const wx = pos.getX(v) + x;
          const wz = pos.getZ(v) + z;
          pos.setY(v, terrainHeight(wx, wz) * roadFalloff(wx) - 0.15);
        }
        pos.needsUpdate = true;

        scene.add(mesh);
        chunks.push(mesh);
      }
    }

    // --- Dawn glow on the horizon (soft radial sprite) ---
    const glowTexture = createGlowTexture(primary);
    textures.push(glowTexture);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: theme === "dark" ? 0.55 : 0.35,
      blending: theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      fog: false,
    });
    materials.push(glowMaterial);
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(120, 60, 1);
    glow.position.set(0, 4, -95);
    scene.add(glow);

    let raf = 0;
    let inViewport = true;
    const clock = new THREE.Clock();
    const mouse = { x: 0, y: 0 };
    const camDrift = { x: 0, y: 0 };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!inViewport || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Road dashes rushing toward the camera
      roadTexture.offset.y += (SPEED * dt) / TEXTURE_WORLD_LENGTH;

      // Terrain chunks flowing forward, recycled past the camera
      for (const chunk of chunks) {
        chunk.position.z += SPEED * dt;
        if (chunk.position.z - CHUNK_LENGTH / 2 > 14) {
          chunk.position.z -= CHUNK_LENGTH * CHUNKS_PER_SIDE;
        }
      }

      // Subtle running cadence + mouse drift
      camDrift.x += (mouse.x * 0.6 - camDrift.x) * 0.04;
      camDrift.y += (-mouse.y * 0.25 - camDrift.y) * 0.04;
      camera.position.x = camDrift.x + Math.sin(t * 1.1) * 0.05;
      camera.position.y = 1.6 + camDrift.y + Math.sin(t * 2.2) * 0.035;
      camera.lookAt(camDrift.x * 0.6, 1.1, -30);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        if (inViewport) clock.getDelta();
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return <div ref={containerRef} className="absolute inset-0 [&>canvas]:block" />;
}
