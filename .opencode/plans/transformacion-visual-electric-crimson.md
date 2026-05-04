# Transformación Visual: Electric Crimson

## Diagnóstico

**Problema raíz**: Todo el sistema de color es monocromático. `--primary` tiene `chroma: 0` en ambos modos (light/dark). No hay identidad de marca.

- Light: `--primary: oklch(0.205 0 0)` → gris oscuro puro
- Dark: `--primary: oklch(0.922 0 0)` → gris claro puro
- `--secondary` y `--accent` son idénticos entre sí
- Gradientes hardcodeados (`#FF6B6B`) desconectados del sistema

---

## 1. Sistema de Color: Electric Crimson

### Paleta principal

| Variable | Light Mode | Dark Mode | Visual |
|---|---|---|---|
| `--primary` | `oklch(0.65 0.25 25)` | `oklch(0.72 0.22 25)` | Electric Crimson |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.12 0.01 25)` | Blanco / Casi negro |
| `--secondary` | `oklch(0.72 0.18 220)` | `oklch(0.70 0.16 220)` | Electric Cyan |
| `--accent` | `oklch(0.78 0.18 50)` | `oklch(0.75 0.16 50)` | Warm Amber |
| `--surface` | `#0F0F10` | `#0F0F10` | Obsidian (siempre oscuro) |
| `--surface-elevated` | `#1A1A1D` | `#1A1A1D` | Dark Zinc |
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Blanco / Negro |

### Filosofía
- **Superficies siempre oscuras** (`#0F0F10`) incluso en light mode → cards dark sobre fondo claro = alto contraste dramático
- **Crimson como color dominante** → botones, títulos, glows, bordes, badges
- **Cyan como contraste frío** → stats secundarios, links, indicadores
- **Amber como acento cálido** → highlights especiales, warnings elegantes

---

## 2. globals.css - Cambios

### Nuevas animaciones CSS
```css
@keyframes energy-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 45, 45, 0.5); }
  50% { box-shadow: 0 0 30px 8px rgba(255, 45, 45, 0.15); }
}

@keyframes streak {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

@keyframes border-glow {
  0%, 100% { border-color: rgba(255, 45, 45, 0.2); }
  50% { border-color: rgba(255, 45, 45, 0.6); }
}

@keyframes text-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
  96% { opacity: 0.9; }
  97% { opacity: 1; }
}
```

### Nuevas clases utilitarias
- `.animate-energy-pulse` - glow pulsante rojo
- `.animate-streak` - efecto de luz que cruza (para CTAs)
- `.animate-border-glow` - borde que brilla
- `.animate-text-flicker` - efecto neón sutil
- `.bg-crimson-gradient` - gradiente crimson → crimson/60
- `.bg-energy-gradient` - gradiente crimson → amber diagonal
- `.text-crimson-gradient` - texto con gradiente crimson
- `.glow-crimson` - box-shadow rojo intenso
- `.border-crimson-glow` - borde con glow animado

### Gradientes corregidos
```css
.gradient-primary {
  background: linear-gradient(135deg, var(--primary) 0%, oklch(0.55 0.22 30) 100%);
}

.text-gradient-primary {
  background: linear-gradient(135deg, var(--primary) 0%, oklch(0.70 0.20 30) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 3. Landing Page (page.tsx) - Transformación

### Hero Section
- **Canvas de partículas**: Sistema de partículas rojas flotantes con conexiones (estilo red neuronal)
  - Partículas rojas (#FF2D2D) con opacidad variable
  - Líneas de conexión entre partículas cercanas
  - Movimiento orgánico lento
  - Se intensifica al hacer hover
- **Gradiente orbs**: Reemplazar los orbs actuales por:
  - Orbe principal: crimson con 30% opacidad, blur 120px
  - Orbe secundario: cyan con 15% opacidad, blur 100px
  - Orbe terciario: amber con 10% opacidad, blur 80px
- **Badge animado**: Border glow animado + ping más agresivo
- **Título**: 
  - "QUERÉS" con text-gradient-primary
  - Efecto flicker sutil al cargar
- **Stats card**: 
  - Borde con glow animado
  - Números con text-gradient-primary
  - Fondo con gradiente sutil

### Problem Section
- **Pain cards**:
  - Reemplazar emojis por iconos SVG con fondo crimson/10
  - Hover: borde crimson/40 + glow sutil
  - Número de card grande en background (01, 02, 03) con opacidad 0.05
  - Animación stagger con spring

### Solution Section
- **Solution cards**:
  - Iconos con gradientes (crimson → amber)
  - Hover: elevación + glow
  - Indicador lateral con gradiente
  - Animación slide-in desde izquierda con delay

### Steps Section
- **Step cards**:
  - Números gigantes con text-gradient-primary
  - Iconos circulares con borde glow
  - Líneas conectoras con gradiente crimson → transparent
  - Animación scale-in con delay

### CTA Section
- **Background**: Patrón SVG más denso + orbe crimson masivo
- **Título**: "Cada día" con text-gradient-primary
- **Botón**: 
  - Efecto streak (luz que cruza)
  - Glow crimson intenso
  - Hover: scale + glow más intenso
- **Subtexto**: "SIN TARJETA" con letras espaciadas y color muted

### Footer
- Logo con glow crimson
- Links con hover crimson
- Borde superior con gradiente

---

## 4. Admin Zone (admin/page.tsx) - Transformación

### Header
- Icono shield con fondo crimson/10 + borde crimson/20
- Título con text-gradient-primary sutil
- Botón logout con hover crimson

### Stats Cards
- Cada card con color distintivo:
  - Total: crimson
  - Principiante: cyan
  - Intermedio: amber
  - Pro: crimson + glow
- Background circle con color correspondiente
- Hover: scale + border glow

### Create User Form
- Labels con color muted-foreground
- Inputs con focus: border crimson/50 + glow sutil
- Botón "CREAR USUARIO" con gradiente crimson + efecto streak
- Mensajes de éxito/error con animación slide

### User List
- Avatares con gradiente crimson
- Hover: bg-background/30 → bg-background/50
- Botones de acción:
  - EDITAR: amber theme
  - PROGRESO: cyan theme
  - ELIMINAR: red theme
- Animación stagger al cargar

### Modals
- Backdrop con blur más intenso
- Entrada con scale + fade
- Headers con iconos coloreados
- Botones con hover states mejorados

---

## 5. PublicHeader - Actualización

- Logo: gradiente crimson en el icono
- Nav links: hover con underline crimson
- Botón "Iniciar Sesión": bg-primary con glow
- Mobile menu: items con hover crimson/10
- Scroll state: border-bottom con crimson/20

---

## Archivos a modificar

1. `/src/app/globals.css` - Sistema de color + animaciones nuevas
2. `/src/app/page.tsx` - Landing page completa con canvas particles
3. `/src/app/admin/page.tsx` - Admin zone con nuevos colores
4. `/src/components/PublicHeader.tsx` - Header con brand colors

---

## Dependencias

No se requieren nuevas dependencias. Todo se hace con:
- Framer Motion (ya instalado)
- Canvas API (nativa del browser)
- CSS animations (nativas)
- Tailwind CSS (ya configurado)
