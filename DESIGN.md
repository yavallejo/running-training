# RunPlan Pro — Style Reference
> Velocity Command Center: A dark, athletic interface ignited by crimson accents, like a performance dashboard built for speed.

**Theme:** dark

RunPlan Pro delivers an intense, performance-driven dark-mode experience. A deep charcoal base creates an immersive canvas for training data, while layered surfaces build depth with precision. The signature Velocity Crimson (#FF3B30) cuts through the darkness like a finish line tape — marking every primary action, active state, and moment of achievement. Subtle crimson glows and gradients add energy without overwhelming the focused, data-first layout. Muted text colors (#8a8f98 for secondary, #62666d for tertiary) maintain readability against the dark backdrop, letting the crimson accent command attention where it matters most.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Pitch Black | `#08090a` | `--color-pitch-black` | Page background, primary surface for base elements |
| Graphite | `#0f1011` | `--color-graphite` | Elevated card backgrounds, slightly lighter than canvas |
| Deep Slate | `#161718` | `--color-deep-slate` | Secondary elevated surfaces, visual hierarchy layer |
| Charcoal Grey | `#23252a` | `--color-charcoal-grey` | Borders, dividers, and structural lines |
| Muted Ash | `#323334` | `--color-muted-ash` | Subtle borders and soft separations |
| Gunmetal | `#383b3f` | `--color-gunmetal` | Input backgrounds, tertiary functional elements |
| Porcelain | `#f7f8f8` | `--color-porcelain` | Primary text and icons, maximum contrast |
| Light Steel | `#d0d6e0` | `--color-light-steel` | Secondary text, less prominent information |
| Storm Cloud | `#8a8f98` | `--color-storm-cloud` | Tertiary text, labels, inactive states |
| Fog Grey | `#62666d` | `--color-fog-grey` | Metadata, timestamps, de-emphasized content |
| Alabaster | `#e5e5e6` | `--color-alabaster` | Informational borders, subtle fills |
| Velocity Crimson | `#FF3B30` | `--primary` | PRIMARY ACTION — buttons, active states, progress indicators, focus elements |
| Crimson Glow | `#FF6B6B` | `--color-crimson-glow` | Gradient endpoints, glow effects, hover states |
| Crimson Shadow | `#C62828` | `--color-crimson-shadow` | Dark crimson for pressed states, depth |
| Sprint Orange | `#FF8C42` | `--color-sprint-orange` | Secondary accent, non-destructive warnings |
| Forest Green | `#008d2c` | `--color-forest-green` | Positive status, success, completion |
| Emerald | `#27a644` | `--color-emerald` | Success states paired with green text |
| Warning Amber | `#F59E0B` | `--warning` | Caution, missed sessions, edit actions |
| Danger Red | `#EF4444` | `--danger` | Destructive actions, critical alerts |
| Info Cyan | `#02b8cc` | `--info` | Informational highlights, rescheduled states |
| Deep Violet | `#6366f1` | `--color-deep-violet` | Special content blocks, distinct categories |

## Tokens — Typography

### Urbanist — Primary display and headings typeface. Bold, geometric, with strong presence for athletic/performance branding. · `--font-urbanist`
- **Weights:** 400, 500, 600, 700, 800, 900
- **Role:** Headings, display text, stats, bold branding elements

### Open Sans — Primary body text typeface. Clean, highly legible, optimized for reading training data and instructions. · `--font-open-sans`
- **Weights:** 400, 500, 600, 700
- **Role:** Body text, descriptions, form labels, instructions

### Geist — System sans-serif fallback. · `--font-sans`
- **Role:** Fallback font, UI elements

### Type Scale

| Role | Size | Line Height | Letter Spacing | Font |
|------|------|-------------|----------------|------|
| caption | 10px | 1.4 | -0.1px | Urbanist / mono |
| body | 14px | 1.6 | normal | Open Sans |
| heading | 24px | 1.3 | -0.03em | Urbanist |
| heading-lg | 48px | 1.2 | -0.03em | Urbanist |
| display | clamp(2.5rem, 8vw, 6rem) | 0.95 | -0.03em | Urbanist |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** compact

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 28 | 28px | `--spacing-28` |
| 32 | 32px | `--spacing-32` |
| 36 | 36px | `--spacing-36` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 56 | 56px | `--spacing-56` |
| 64 | 64px | `--spacing-64` |
| 80 | 80px | `--spacing-80` |
| 96 | 96px | `--spacing-96` |
| 128 | 128px | `--spacing-128` |

### Border Radius

| Element | Value |
|---------|-------|
| pill | 9999px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| cards | 12px - 24px (varies by context) |
| buttons | 6px - 12px |
| inputs | 12px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| glow | `0 0 40px -12px var(--primary)` | `--shadow-glow` |
| glow-sm | `0 0 20px -6px var(--primary)` | `--shadow-glow-sm` |
| card | `0 4px 24px -4px rgba(0, 0, 0, 0.5)` | `--shadow-card` |
| crimson glow | `0 0 16px -4px rgba(255, 59, 48, 0.3)` | inline |
| crimson glow sm | `0 0 12px -3px rgba(255, 59, 48, 0.15)` | inline |

### Layout

- **Section gap:** 24px - 48px
- **Card padding:** 12px - 24px (varies)
- **Element gap:** 8px - 16px

## Components

### Primary Action Button
**Role:** Call to action button

Filled button with Velocity Crimson gradient background, white text, 12px-24px border-radius, and crimson glow shadow. Used for primary user actions (CTAs, submit buttons).

### Ghost Navigation Button
**Role:** Navigation and secondary actions

Ghost button with transparent background, foreground text, hover:bg-surface transition. Navigational links and menu items.

### Default Card
**Role:** Content container

Card with `--surface` background, `--border/50` border, 12px-24px border-radius. Padding varies by context (12px-24px).

### Elevated Card
**Role:** Prominent content container

Card with `--surface` background, `--border/50` border, backdrop-blur, and optional crimson glow shadow for emphasis.

### Input Field
**Role:** User input fields

Input field with `--background/50` background, `--border/50` border, 12px border-radius, focus:border-primary/50 transition.

### Badge
**Role:** Label or tag

Inline element with rounded-full shape, colored background (primary/success/warning/danger/info), and matching text color.

### Stat Card
**Role:** Dashboard statistics display

Card with `--surface` background, colored border hover, colored icon container, and expandable background circle on hover. Each stat type has its own color (primary=crimson, warning=amber, info=cyan, success=green).

### Session Card
**Role:** Training session display

Card with state-dependent styling:
- **Today:** Crimson border + glow, crimson badge
- **Completed:** Green border, green badge
- **Completed-over:** Green-to-warning gradient, green badge
- **Missed:** Warning amber dashed border, amber badge
- **Rescheduled:** Info cyan border, cyan badge
- **Blocked:** Danger red border with opacity

## Do's and Don'ts

### Do
- Use Velocity Crimson (#FF3B30) as the sole primary accent for actions, progress, and focus
- Apply crimson glow effects selectively on logos, CTAs, and active elements
- Create depth with layered dark surfaces (surface → surface-elevated → background)
- Use semantic colors consistently: success=green, warning=amber, danger=red, info=cyan
- Employ Urbanist for headings with tight letter-spacing (-0.03em) for athletic branding
- Use Open Sans for body text with generous line-height (1.6) for readability
- Apply glow shadows with rgba(255, 59, 48, ...) for crimson accents
- Use gradient blobs (from-primary/25 via-primary/8 to-transparent) for hero backgrounds

### Don't
- Do not introduce additional saturated colors beyond the defined palette
- Avoid using hardcoded Tailwind colors (green-500, red-500, etc.) — use semantic variables
- Do not deviate from Urbanist + Open Sans font pairing
- Refrain from strong, diffuse shadows — use contained glow effects
- Do not use generic AI aesthetics (Inter, Roboto, purple gradients)
- Avoid large amounts of white space — the design is compact and data-dense
- Do not use shadcn/ui components — the project uses native HTML + Tailwind + framer-motion

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Background Canvas | `oklch(0.145 0 0)` | Base page background |
| 1 | Surface Card | `#18181B` | Primary card surface |
| 2 | Surface Elevated | `#27272A` | Elevated surfaces, modals |
| 3 | Card Surface | `oklch(0.205 0 0)` | Card component background |

## Elevation

- **Crimson Glow (logo):** `0 0 16px -4px rgba(255, 59, 48, 0.3)`
- **Crimson Glow (stat card):** `0 0 12px -3px rgba(255, 59, 48, 0.15)`
- **Card Shadow:** `0 4px 24px -4px rgba(0, 0, 0, 0.5)`
- **Session Card (today):** `shadow-lg shadow-primary/15`
- **Session Card (completed-over):** `shadow-lg shadow-success/20`
- **Hero Blob:** `from-primary/25 via-primary/8 to-transparent blur-3xl`

## Imagery

The visual language is dominated by UI elements and training data displays. Abstract graphics are minimal — gradient blobs in crimson provide atmosphere in hero and CTA sections. Icons are inline SVGs, mono-color, adapting to context (crimson for primary, semantic colors for status). Grid patterns appear subtly as background textures (opacity 0.02-0.03). The overall density is low; imagery serves an explanatory or motivational role.

## Layout

The app uses a centered layout with max-width constraints (max-w-5xl for app, max-w-6xl for landing). The landing page features full-bleed sections with centered content, staggered scroll animations via framer-motion, and gradient blob backgrounds. The app interior uses a sticky header with border-bottom, content sections with consistent spacing, and responsive grid layouts for cards and stats. Navigation is top-bar based with mobile drawer support.

## Agent Prompt Guide

Quick Color Reference:
- text: `var(--foreground)` / `#f7f8f8` (Porcelain)
- background: `var(--background)` / `oklch(0.145 0 0)` (Pitch Black)
- surface: `#18181B` (Graphite)
- border: `var(--border)` / `oklch(1 0 0 / 10%)` (Charcoal Grey)
- primary action: `var(--primary)` / `oklch(0.65 0.22 25)` (Velocity Crimson)
- success: `#22C55E` (Forest Green)
- warning: `#F59E0B` (Warning Amber)
- danger: `#EF4444` (Danger Red)
- info: `#02b8cc` (Info Cyan)

3-5 Example Component Prompts:
- Create a call-to-action button: Velocity Crimson gradient background (`from-primary to-primary/80`), white text, Urbanist font weight 700, 16px-24px border-radius, crimson glow shadow (`shadow-[0_0_16px_-4px_rgba(255,59,48,0.3)]`), hover scale effect.
- Create a default card: `--surface` background, `--border/50` border, 16px-24px border-radius, subtle backdrop-blur. Inside, use Urbanist for headings with -0.03em letter-spacing, Open Sans for body text.
- Create a stat card: `--surface` background, `--border/50` border, hover:border-primary/30 transition. Icon container with `bg-primary/10 border border-primary/20 text-primary`. Background circle with `bg-primary/5` that scales on hover.
- Create a session card (today state): `border-primary/60 bg-gradient-to-br from-primary/12 to-primary/6 shadow-lg shadow-primary/15`. Badge with `bg-primary/25 text-primary`.
- Create a status badge: `rounded-full px-2.5 py-1 text-xs font-semibold` with semantic colors: `bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-danger/10 text-danger`, `bg-info/10 text-info`.

## Similar Brands

- **Strava** — Athletic intensity, orange/red accents on dark, performance metrics
- **Nike Run Club** — Bold crimson, performance-focused, motivational energy
- **Garmin Connect** — Data-dense dark dashboard, training metrics
- **TrainingPeaks** — Training analytics with clear status colors

## Quick Start

### CSS Custom Properties (actual implementation)

```css
:root {
  /* Colors — Light Mode */
  --surface: oklch(0.97 0 0);
  --surface-elevated: oklch(0.93 0 0);
  --primary: oklch(0.55 0.22 25);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --accent: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #02b8cc;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  /* Colors — Dark Mode */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --surface: #18181B;
  --surface-elevated: #27272A;
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.65 0.22 25);
  --primary-foreground: oklch(0.145 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.65 0.22 25);
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #02b8cc;
}

/* Gradients */
.gradient-primary {
  background: linear-gradient(135deg, var(--primary) 0%, oklch(0.70 0.20 25) 100%);
}

.text-gradient-primary {
  background: linear-gradient(135deg, var(--primary) 0%, oklch(0.75 0.18 25) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Shadows */
--shadow-glow: 0 0 40px -12px var(--primary);
--shadow-glow-sm: 0 0 20px -6px var(--primary);
--shadow-card: 0 4px 24px -4px rgba(0, 0, 0, 0.5);
```

### Tailwind v4 Theme Mapping

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-surface: var(--surface);
  --color-surface-elevated: var(--surface-elevated);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-border: var(--border);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-info: var(--info);
  --font-display: var(--font-urbanist);
  --font-body: var(--font-open-sans);
  --font-heading: var(--font-sans);
  --font-sans: var(--font-sans);
}
```

## Technical Stack

- **Framework:** Next.js 16.2.4 (App Router)
- **Styling:** Tailwind CSS v4 + CSS Custom Properties
- **Animations:** framer-motion
- **Icons:** Inline SVGs (no icon library)
- **Fonts:** Urbanist (headings) + Open Sans (body) + Geist (fallback)
- **UI Components:** Native HTML + Tailwind (NO shadcn/ui)
- **State Management:** React hooks (useState, useEffect, useCallback)
- **Database:** Supabase

## Changelog

### 2026-05-04 — Velocity Crimson Redesign
- Replaced grayscale `--primary` with Velocity Crimson (`oklch(0.65 0.22 25)`)
- Added `--info` color variable (`#02b8cc`) for informational states
- Removed all shadcn/ui dead code (16 components, 5 dependencies, 265 packages)
- Replaced hardcoded colors (green-500, red-500, yellow-500, blue-500) with semantic variables
- Enhanced landing page with crimson gradient blobs and glow effects
- Improved admin stat cards with warning (principiante) and info (intermedio) colors
- Refined SessionCard state hierarchy with distinct visual treatments
- Added crimson glow shadows to headers, avatars, and stat cards
- Fixed light mode `--surface` bug (was hardcoded to dark values)
- Updated all gradients to use CSS variables instead of hardcoded hex values
