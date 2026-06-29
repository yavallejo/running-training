# SEO Plan — RunPlan Pro

## Estado Actual

### Lo que YA está bien ✅

- Meta tags básicos (title, description, robots)
- Open Graph con locale correcto (`es_AR`)
- Twitter cards (`summary_large_image`)
- Sitemap con 17 rutas y prioridades
- Robots.txt bien configurado (disallow: /admin/, /api/, /login, /register, /onboarding)
- JSON-LD de Organization + Article en páginas de contenido
- Canonical URLs en páginas secundarias
- Security headers (X-Content-Type-Options, X-Frame-Options)
- Heading hierarchy correcto (h1 → h2 → h3)
- `metadataBase` configurado

---

## Issues encontrados

### 🔴 CRÍTICO

| # | Problema | Estado | Impacto |
|---|----------|--------|---------|
| 1 | **Sin `og:image`** | ✅ Arreglado | PNG 1200x630 integrado en metadata |
| 2 | **Sin `twitter:image`** | ✅ Arreglado | PNG 1200x630 integrado en metadata |
| 3 | **Sin canonical en root layout** | ✅ Arreglado | Potencial contenido duplicado |
| 4 | **`sameAs: []` vacío** | ⚠️ Placeholder | Codigo listo; necesita URLs de redes sociales |

### 🟡 IMPORTANTE

| # | Problema | Estado | Impacto |
|---|----------|--------|---------|
| 5 | `twitter:site` y `twitter:creator` faltantes | ⚠️ Placeholder | Codigo listo; necesita handles de Twitter |
| 6 | Manifest sin apple-touch-icon.png | ⚠️ Codigo listo | Necesita generar archivo 180x180px |
| 7 | Sitemap incluye `/profile`, `/admin` | ✅ Arreglado | Rutas privadas no deberían estar indexadas |
| 8 | Structured data limitado | ✅ Arreglado | Agregado schema SoftwareApplication |

### 🟢 MENOR

| # | Problema | Estado | Impacto |
|---|----------|--------|---------|
| 9 | Robots.txt sin `Host:` | ✅ Arreglado | Considerado buena práctica |
| 10 | Sin `og:image:width` / `og:image:height` | ✅ Arreglado | Recomendado para rendering |

---

## Acciones requeridas

### ACCIÓN 1 — Google Search Console (TU)

1. Ir a [Google Search Console](https://search.google.com/search-console)
2. Verificar propiedad del dominio
   - Recomendado: método DNS (crear registro TXT)
   - Alternativa: subir archivo HTML Provided by Google
3. Submitir sitemap:
   ```
   https://runplan-pro.vercel.app/sitemap.xml
   ```
   Ir a **Sitemaps** → ingresar la URL → click **Submit**
4. Esperar indexing (1-2 semanas)
5. Monitorear errores en **Cobertura**

### ACCIÓN 2 — Crear imagen OG (TU)

**Specs:**

- Tamaño: **1200x630px**
- Formato: PNG o JPG
- Contenido sugerido: logo, tagline, mockup del landing

**Esta imagen se muestra cuando alguien comparte:**

- WhatsApp
- Twitter/X
- Facebook
- LinkedIn
- Telegram

Guardar en: `public/og-image.png` (o `.jpg`)

### ACCIÓN 3 — Agregar redes sociales (TU)

Cuando tengas las cuentas de redes sociales:

- Twitter/X de la marca (@usuario)
- Instagram
- LinkedIn

Agregarlas a:

- `sameAs: []` en JSON-LD Organization
- `twitter:site: "@tuusuario"`
- `og:see_also` en metadata

### ACCIÓN 4 — Revisar rutas privadas (TU)

Confirmar que las siguientes rutas tengan `noindex` en su metadata:

- `/login`
- `/register`
- `/onboarding`

Y excluirlas del sitemap si no lo están ya.

---

## To-do: lo que voy a implementar (yo)

| Status | Tarea |
|--------|-------|
| ✅ Listo | `og:image` PNG 1200x630px en metadata |
| ✅ Listo | `twitter:image` en metadata |
| ✅ Listo | Canonical URL en root layout |
| ✅ Listo | Schema `SoftwareApplication` en landing |
| ✅ Listo | `og:image:width` y `og:image:height` |
| ✅ Listo | Excluir `/profile` y `/admin` del sitemap |
| ✅ Listo | `Host:` en robots.txt |
| ✅ Listo | `apple-touch-icon` en manifest y layout (codigo) |
| ⚠️ Listo (placeholder) | `sameAs` en Organization schema |
| ⚠️ Listo (placeholder) | `twitter:site` y `twitter:creator` |

## Acciones requeridas de tu parte (TU)

| Status | Tarea | Detalle |
|--------|-------|---------|
| ⬜ Pendiente | Google Search Console | Verificar propiedad + submitir sitemap |
| ✅ Listo | Imagen OG | Generada y en `public/og-image.png` |
| ⬜ Pendiente | Apple Touch Icon | Generar PNG 180x180px → `public/apple-touch-icon.png` |
| ⬜ Pendiente | Redes sociales | Proporcionar handles/URLs cuando estén listos |

---

## Checklist post-lanzamiento

### Semana 1

- [ ] Google Search Console verificado
- [ ] Sitemap enviado
- [ ] Imagen OG creada e integrada
- [ ] Revisar "Cobertura" por errores de crawling

### Semana 2-4

- [ ] Monitorear errores de indexing
- [ ] Verificar que Google indexe la homepage
- [ ] Probar con `site:runplan-pro.vercel.app` en Google
- [ ] Revisar performance en PageSpeed Insights

### Mes 1-3

- [ ] Integrar Google Business Profile (si aplica)
- [ ] Buscar oportunidades de backlinks (blogs de running)
- [ ] Agregar reseñas en Play Store / App Store
- [ ] Configurar Google Analytics 4

---

## Referencias

- [Google Search Central](https://developers.google.com/search)
- [Schema.org — SoftwareApplication](https://schema.org/SoftwareApplication)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
