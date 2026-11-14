---
name: Urban Sanity & Wayfinding
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e494b'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e797b'
  outline-variant: '#bdc9cb'
  surface-tint: '#006874'
  primary: '#006671'
  on-primary: '#ffffff'
  primary-container: '#00818e'
  on-primary-container: '#f7feff'
  inverse-primary: '#72d5e4'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#006948'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f1ff'
  primary-fixed-dim: '#72d5e4'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f57'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The brand persona is dependable, reassuring, hygienic, and hyper-efficient. Aimed at commuters, parents, elderly citizens, and tourists navigating urban Singapore, the interface delivers high-velocity clarity under urgent real-world constraints. The emotional response is one of immediate relief, trust, and frictionless wayfinding.

The design movement synthesizes **Minimalism** with **Modern Tactile Glassmorphism**. UI controls float cleanly over an desaturated cartographic canvas, utilizing soft ambient backdrops, crisp borders, and punchy status colors. It balances sterile cleanliness with warm civic approachability, prioritizing single-thumb ergonomics for one-handed outdoor mobile use under bright sunlight.

## Colors

The palette revolves around hygiene, water, and immediate navigational clarity:
- **Primary (`#0D8B99`)**: Fresh cyan-teal communicating sanitation, clarity, and rapid action. Used for primary focus pins, primary CTA buttons, and highlighted states.
- **Secondary (`#2563EB`)**: Crisp royal transit blue drawn directly from the Singapore geographic wayfinding markers. Used for navigational toggles, active geofence indicators, and directional paths.
- **Tertiary (`#059669`)**: Clean botanical emerald. Applied to verified clean ratings (4.5–5.0 stars) and low-crowd status signals.
- **Status Signals**:
  - *Crowd Low*: Emerald green (`#059669` / bg `#ECFDF5`)
  - *Crowd Moderate*: Amber gold (`#D97706` / bg `#FFFBEB`)
  - *Crowd Busy*: Vivid coral crimson (`#DC2626` / bg `#FEF2F2`)
- **Neutrals**: Crisp slate-based scale. High-contrast deep slate (`#0F172A`) ensures daylight legibility, while neutral surfaces maintain off-white hygienic purity (`#F8FAFC` to `#FFFFFF`).

## Typography

**Plus Jakarta Sans** provides a contemporary geometric look with friendly humanist touches. The rounded terminals mirror the soft hardware-like UI cards and pills, maintaining exceptional legibility at quick glances on mobile screens under direct tropical sunlight.

Font weights are strictly paired:
- **Bold / ExtraBold (700/800)**: Reserved for amenity facility titles, distance metrics, and brand wordmarks.
- **SemiBold (600)**: Used for status tags, ratings, and bottom sheet action buttons to guarantee immediate visual parsing.
- **Regular (400)**: Confined to secondary metadata, opening hours, level/location descriptions, and user feedback strings.

## Layout & Spacing

A mobile-first viewport architecture where the interactive map serves as the primary root canvas. Structural interface elements float over the canvas using strict ergonomic touch anchors:
- **Top Safe Zone (Header & Quick Filters)**: Floating pill capsules anchored with `margin-mobile` (`1rem`) offset from status bar boundaries.
- **Bottom Ergonomic Sheet (Facility Details & Directory)**: Detachable or draggable bottom sheet snapping to three states: Peek (72px), Half (42vh), and Full (88vh).
- **Desktop & Tablet Adaptations**: Centered map viewport with an anchored, floating left-side panel (380px fixed width) using `margin: 1.5rem` from canvas edges to preserve panoramic map interaction.

## Elevation & Depth

Visual hierarchy uses a refined multi-layered elevation model:
- **Level 0 (Map Canvas)**: Base level with high-contrast desaturated cartography.
- **Level 1 (Floating Controls & Search Pills)**: Pure white background with 92% opacity, `backdrop-filter: blur(12px)`, backed by a multi-stop ambient shadow: `0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`. Outlined with a sub-pixel border: `1px solid rgba(255, 255, 255, 0.8)`.
- **Level 2 (Interactive Bottom Sheet & Modal Drawers)**: High-altitude surface (`#FFFFFF`) with deep ambient vertical falloff: `0 -8px 24px -4px rgba(15, 23, 42, 0.12)`.
- **Level 3 (Action Prompts & Active Pins)**: Dynamic elevation with teal-tinted ambient glow (`0 8px 20px -4px rgba(13, 139, 153, 0.3)`) to command instant focal priority.

## Shapes

The design uses a **Pill-shaped (Level 3)** design geometry. This reflects the ergonomic, friendly nature of a civic public health utility:
- Top search bars, brand badges, and filter toggles feature complete capsule radii (`rounded-full` / `9999px`).
- Bottom sheets, facility detail cards, and preview popovers feature soft, pronounced radii (`1.5rem` to `2rem`).
- Micro status tags (Crowd level, Wheelchair, Nursery) use compact `rounded-full` silhouettes for instant cognitive chunking.

## Components

### 1. Header Bar & Filter Pills
- **Floating Brand Pill**: Compact white capsule holding the bold logotype alongside dynamic radius status indicator.
- **Nearby Toggle**: Segmented toggle housed in a capsule container with smooth sliding physical thumb switch, default accented in secondary transit blue (`#2563EB`).

### 2. Status Indicators & Badges
- **Live Crowd Density Pill**:
  - `Low`: Background `#ECFDF5`, text `#065F46`, pulsating emerald dot.
  - `Moderate`: Background `#FFFBEB`, text `#92400E`, steady amber dot.
  - `Busy`: Background `#FEF2F2`, text `#991B1B`, steady crimson dot.
- **Accessibility Badges**:
  - Monochromatic outline pill with subtle slate border and slate icon (Wheelchair, Baby Care, Nursing Station, Gender-neutral, Free Access).
- **Cleanliness Rating**:
  - Star score badge with amber star (`#F59E0B`) on subtle warm surface with bold numerical typography (`4.8 / 5.0`).

### 3. Bottom Sheet & Facility Cards
- **Drag Handle**: Centered 36px × 4px pill in muted slate (`#CBD5E1`).
- **Facility Card**: Features toilet title, walking distance/time badge (e.g. `120m • 2 min walk`), live status pill row, and two immediate action buttons: "Navigate" (Primary solid `#0D8B99`) and "Details" (Secondary outline).

### 4. Interactive Map Markers
- **Sanitary Pin**: Teardrop capsule housing a custom toilet icon; state varies dynamically:
  - Standard: White icon on `#0D8B99` circle with subtle pulse.
  - Selected: Expanded pill displaying name and rating.
  - Radius Ring: Translucent cyan/blue boundary stroke with soft area fill (`rgba(37, 99, 235, 0.08)`).