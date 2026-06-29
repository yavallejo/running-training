# Prompt para Imagen OG — RunPlan Pro

## Especificaciones técnicas
- **Tamaño**: 1200 x 630 píxeles (relación 1.91:1)
- **Formato**: PNG o JPG (PNG recomendado)
- **Peso máximo**: < 1MB (ideal < 500KB)
- **Profundidad de color**: 24 bits (RGB)
- **Compresión**: pérdida mínima

---

## Paleta de colores del landing

| Color | Hex | Uso |
|-------|-----|-----|
| Negro profundo | `#0D0D0F` | Fondo principal |
| Gris oscuro | `#18181B` | Superficies, cards |
| Gris medio | `#27272A` | Bordes, separadores |
| Gris texto | `#A1A1AA` | Texto secundario |
| Gris muted | `#71717A` | Texto terciario |
| Rojo primario | `#FF3B30` | Acentos, CTAs, flame |
| Naranja | `#FF6B35` | Gradiente flame |
| Amarillo dorado | `#FFB800` | Highlights, sparkles |
| Blanco | `#FFFFFF` | Texto principal |

---

## Tipografía
- **Display**: Urbanist (Google Fonts) — bold/black
- **Body**: Open Sans (Google Fonts)
- Si la herramienta no soporta Urbanist, usar:
  - **SF Pro Display** (iOS/macOS)
  - **Inter** (alternativa)
  - **Roboto** (Android)

---

## Elementos a incluir

### 1. Fondo
- Gradiente sutil de negro (#0D0D0F) a gris muy oscuro (#1a1a1f)
- Opcional: grilla muy sutil como textura de fondo (patrón de líneas finas)

### 2. Logo / Ícono
- Ícono de llama estilizada (flame) usando gradiente rojo→naranja→amarillo
- Posición: centro superior o lado izquierdo
- Glow sutil alrededor del ícono

### 3. Nombre de la app
- **"RunPlan Pro"** en blanco, tipografía bold/gruesa
- Tamaño prominente, legible incluso reducida

### 4. Tagline
- **"Tu plan de entrenamiento para correr"**
- En gris claro (#A1A1AA), más pequeño

### 5. Distancias (opcional pero suggestivo)
- Mostrar: **3K**, **5K**, **半 Maratón**, **Maratón** (o 42K)
- Con colores diferentes (rojo → naranja → amarillo para progresión)

### 6. CTA sutil
- **"ARRANCÁ HOY →"** en gris muted, muy discreto en la parte inferior

---

## Estilo visual
- **Minimalista y deportivo**
- Sensación de energía pero controlada
- Mucho espacio negativo (no saturar)
- El ícono de llama es el hero element
-aire profesional tipo app de fitness premium (como Nike Run Club, Strava)

---

## NO incluir
- ❌ Fotos de personas corriendo (derechos / inconsistentes)
- ❌ Texto excesivo
- ❌ Demasiados colores fuera de paleta
- ❌ Iconos genéricos de terceros
- ❌ Fondos con patrones complejos que distraigan

---

## Prompt completo (para ChatGPT, Midjourney, DALL-E, etc.)

```
Design a clean, modern Open Graph image for a running training app called "RunPlan Pro".

Specs: 1200x630px, PNG format, dark background (#0D0D0F to #1a1a1f gradient), professional fitness app aesthetic.

Content:
- A stylized flame icon with gradient from #FF3B30 (red) to #FF6B35 (orange) to #FFB800 (gold), centered upper area with subtle glow effect
- Title "RunPlan Pro" in white, bold/800 weight, large size (Urbanist or similar sans-serif)
- Tagline below: "Tu plan de entrenamiento para correr" in #A1A1AA gray
- Below tagline: distance markers "3K  5K  42K" in progressive colors (red, orange, gold)
- Very subtle grid pattern on background (low opacity)
- Small CTA at bottom: "ARRANCÁ HOY →" in muted gray

Style: Minimalist, sporty, premium fitness app feel. Lots of negative space. The flame is the hero element. Think Nike Run Club meets modern SaaS. Dark mode design. No photos, no clutter.

Colors:
- Background: #0D0D0F / #1a1a1f
- Primary accent: #FF3B30
- Secondary: #FF6B35
- Highlight: #FFB800
- Text: #FFFFFF / #A1A1AA / #71717A
```

---

## Post-generación
1. Guardar como `public/og-image.png`
2. Verificar que mida exactamente 1200x630
3. Subir al repo y deployar
4. Testear con [Facebook Debugger](https://developers.facebook.com/tools/debug/)
5. Testear con [Twitter Card Validator](https://cards-dev.twitter.com/validator)
