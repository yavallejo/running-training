"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="mt-8 rounded-xl border border-foreground/10 bg-background p-4 text-center">
      <h3 className="text-sm font-medium text-foreground">Instalar App</h3>
      <p className="mt-2 text-xs text-foreground/60">
        Instala Yadira Running en tu dispositivo para una experiencia de app nativa.
      </p>
      {isIOS && (
        <p className="mt-3 text-xs text-foreground/50">
          Para instalar en iOS: toca el botón compartir
          <span role="img" aria-label="share icon" className="mx-1">⎋</span>
          y luego "Agregar a la pantalla de inicio"
          <span role="img" aria-label="plus icon" className="ml-1">➕</span>
        </p>
      )}
      {!isIOS && (
        <button
          className="mt-3 text-xs text-primary hover:underline"
          onClick={() => {
            // Modern browsers show install prompt automatically when PWA criteria are met
            alert('Tu navegador mostrará la opción de instalación automáticamente cuando cumplas los criterios de PWA.');
          }}
        >
          Cómo instalar
        </button>
      )}
    </div>
  );
}
