# Swiss Neo-Deco Design System — Sirsi Technologies
## The Canonical Style Guide

> **Version**: 1.0.0  
> **Authority**: This document is the single source of truth for all visual design across the Sirsi Nexus ecosystem.  
> **Scope**: `sirsi-ui`, `sirsi-portal`, `sirsi-portal-app`, `sirsi-sign`, and all tenant applications.  
> **Survives**: HTML → React/ShadCN migration, Desktop → Mobile responsive, Light → Dark mode.

---

## 1. Design Philosophy

**Swiss Neo-Deco** = Swiss Financial institutional clarity + Neo-Deco elegance.

| Principle | Meaning |
|:----------|:--------|
| **Institutional** | This is a financial platform. Every pixel must convey trust, competence, and precision. |
| **Legible** | No text below 12px on desktop. No gray-on-gray. Every element must be readable at arm's length. |
| **Purposeful** | Every color, shadow, and animation must serve a function. No decoration for decoration's sake. |
| **Consistent** | One size for body text. One size for section headers. One hover transition. Everywhere. |
| **Premium** | Glass effects, gold accents, Cinzel serif headings — elevated, never cheap. |

---

## 2. Design Tokens

### 2.1 Color Palette

#### Brand Colors (IMMUTABLE)

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-emerald` | `#059669` | Primary brand, active states, CTA borders |
| `--snd-emerald-light` | `#10B981` | Success indicators, progress bars, hover accents |
| `--snd-emerald-dark` | `#047857` | Pressed/active button states |
| `--snd-emerald-bg` | `#022c22` | Dark mode primary background |
| `--snd-gold` | `#C8A951` | Neo-Deco accent, premium highlights, table headers (dark) |
| `--snd-gold-bright` | `#E2C76B` | Hover state on gold elements |
| `--snd-gold-dim` | `#F0E6D2` | Gold tint backgrounds (light mode) |

> **TENANT PALETTE**: The following colors are preserved as `--snd-tenant-*` tokens and available for tenant-specific overrides. They are NOT the default for SirsiNexusApp:
> - `#60A3D9` (blue) → `--snd-tenant-blue`
> - `#FFD940` (yellow) → `--snd-tenant-yellow`
> - `#ff5e00` (orange) → `--snd-tenant-orange`
> - `#1E3A5F` / `#2563EB` (Royal Blue) → `--snd-tenant-royal-blue` / `--snd-tenant-royal-bright`

#### Semantic Colors

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-success` | `#10B981` | Success states, positive metrics |
| `--snd-danger` | `#dc2626` | Errors, destructive actions, negative metrics |
| `--snd-warning` | `#f59e0b` | Warnings, pending states |
| `--snd-info` | `#0284c7` | Informational callouts |

#### Light Theme (Default)

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-bg-primary` | `#fcfdfd` | Page background |
| `--snd-bg-secondary` | `#ffffff` | Card/panel background |
| `--snd-bg-tertiary` | `#f8fafc` | Alternating rows, input backgrounds |
| `--snd-bg-hover` | `#f1f5f9` | Hover state background |
| `--snd-bg-active` | `rgba(5, 150, 105, 0.06)` | Active/selected item background |
| `--snd-text-primary` | `#111827` | Page titles, primary content |
| `--snd-text-body` | `#334155` | Body text, descriptions |
| `--snd-text-muted` | `#64748b` | Secondary labels, captions, timestamps |
| `--snd-text-faint` | `#94a3b8` | Placeholders, disabled text |
| `--snd-text-inverse` | `#ffffff` | Text on dark/emerald backgrounds |
| `--snd-border` | `#e5e7eb` | Standard borders, dividers |
| `--snd-border-light` | `rgba(0, 0, 0, 0.06)` | Subtle card borders |
| `--snd-border-focus` | `#059669` | Focus ring color |

#### Dark Theme

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-bg-primary` | `#022c22` | Page background |
| `--snd-bg-secondary` | `#011a14` | Card/panel background |
| `--snd-bg-tertiary` | `#03382b` | Alternating rows, input backgrounds |
| `--snd-bg-hover` | `rgba(255, 255, 255, 0.08)` | Hover state background |
| `--snd-bg-active` | `rgba(16, 185, 129, 0.12)` | Active/selected item background |
| `--snd-text-primary` | `#ffffff` | Page titles, primary content |
| `--snd-text-body` | `rgba(255, 255, 255, 0.85)` | Body text |
| `--snd-text-muted` | `rgba(255, 255, 255, 0.6)` | Secondary labels |
| `--snd-text-faint` | `rgba(255, 255, 255, 0.4)` | Placeholders |
| `--snd-text-inverse` | `#022c22` | Text on light backgrounds |
| `--snd-border` | `rgba(255, 255, 255, 0.12)` | Standard borders |
| `--snd-border-light` | `rgba(255, 255, 255, 0.06)` | Subtle borders |
| `--snd-border-focus` | `#10B981` | Focus ring |

---

### 2.2 Typography

#### Font Families

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-font-heading` | `'Cinzel', serif` | Page titles, section headers, table headers (uppercase contexts) |
| `--snd-font-body` | `'Inter', sans-serif` | Everything else — body, labels, buttons, inputs, navigation |

> **TENANT FONTS**: `Geist Sans` and `DM Serif Display` are preserved as `--snd-tenant-font-geist` and `--snd-tenant-font-dm-serif` for tenant applications. Cinzel + Inter are the SirsiNexusApp defaults.

#### Type Scale (Desktop — 1440px+)

Every text element in the application MUST use one of these sizes. No ad-hoc sizes.

| Token | Size | Line Height | Weight | Usage |
|:------|:-----|:------------|:-------|:------|
| `--snd-text-3xl` | `2.25rem` (36px) | 1.15 | 700 | Dashboard hero statistics ($33M, 99.2%) |
| `--snd-text-2xl` | `1.75rem` (28px) | 1.2 | 600 | Page titles (KPI / UNIT METRICS) |
| `--snd-text-xl` | `1.375rem` (22px) | 1.3 | 600 | Card titles, modal titles |
| `--snd-text-lg` | `1.125rem` (18px) | 1.4 | 600 | Section headers (KEY PERFORMANCE INDICATORS) |
| `--snd-text-md` | `1rem` (16px) | 1.5 | 500 | Prominent body, sidebar links (expanded), button text |
| `--snd-text-base` | `0.9375rem` (15px) | 1.6 | 400 | Standard body text, table cells, form inputs |
| `--snd-text-sm` | `0.8125rem` (13px) | 1.5 | 500 | Captions, timestamps, badge text, breadcrumbs |
| `--snd-text-xs` | `0.75rem` (12px) | 1.4 | 600 | Sidebar group headers, overline labels, micro-badges |

> **MINIMUM**: No text smaller than `--snd-text-xs` (12px) anywhere in the application.

#### Type Scale (Tablet — 768px–1024px)

| Token | Desktop | Tablet |
|:------|:--------|:-------|
| `--snd-text-3xl` | 36px | 30px |
| `--snd-text-2xl` | 28px | 24px |
| `--snd-text-xl` | 22px | 20px |
| `--snd-text-lg` | 18px | 16px |
| All others | Same | Same |

#### Type Scale (Mobile — <768px)

| Token | Desktop | Mobile |
|:------|:--------|:-------|
| `--snd-text-3xl` | 36px | 28px |
| `--snd-text-2xl` | 28px | 22px |
| `--snd-text-xl` | 22px | 18px |
| `--snd-text-lg` | 18px | 16px |
| All others | Same | Same |

#### Heading Treatments

| Context | Font | Size | Weight | Transform | Tracking | Color |
|:--------|:-----|:-----|:-------|:----------|:---------|:------|
| **Page Title** | Cinzel | `--snd-text-2xl` | 600 | uppercase | `0.1em` | `--snd-text-primary` |
| **Page Subtitle** | Inter | `--snd-text-base` | 400 | none | normal | `--snd-text-muted` |
| **Section Header** | Cinzel | `--snd-text-lg` | 600 | uppercase | `0.08em` | `--snd-text-primary` |
| **Card Title** | Inter | `--snd-text-xl` | 600 | none | normal | `--snd-text-primary` |
| **Sidebar Group** | Inter | `--snd-text-xs` | 700 | uppercase | `0.12em` | `--snd-text-muted` |
| **Sidebar Link** | Inter | `--snd-text-md` | 500 | none | normal | `--snd-text-body` |
| **Table Header** | Cinzel | `--snd-text-xs` | 600 | uppercase | `0.08em` | `--snd-gold` (dark bg) or `--snd-text-muted` (light bg) |
| **Stat Value** | Inter | `--snd-text-3xl` | 700 | none | `-0.02em` | `--snd-text-primary` |
| **Stat Label** | Inter | `--snd-text-sm` | 500 | uppercase | `0.05em` | `--snd-text-muted` |
| **Modal Title** | Inter | `--snd-text-xl` | 600 | none | normal | `--snd-text-primary` |
| **Modal Body** | Inter | `--snd-text-base` | 400 | none | normal | `--snd-text-body` |
| **Footer Text** | Inter | `--snd-text-sm` | 400 | none | normal | `--snd-text-muted` |
| **Callout Title** | Inter | `--snd-text-md` | 600 | none | normal | Context-dependent |
| **Callout Body** | Inter | `--snd-text-sm` | 400 | none | normal | Context-dependent |
| **Badge** | Inter | `--snd-text-xs` | 600 | uppercase | `0.04em` | Context-dependent |
| **Button** | Inter | `--snd-text-sm` | 600 | uppercase | `0.04em` | Context-dependent |

---

### 2.3 Spacing Scale

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-space-0` | `0` | Reset |
| `--snd-space-1` | `0.25rem` (4px) | Micro gaps, icon padding |
| `--snd-space-2` | `0.5rem` (8px) | Tight component gaps |
| `--snd-space-3` | `0.75rem` (12px) | Button padding (vertical) |
| `--snd-space-4` | `1rem` (16px) | Standard component gaps, table cell padding |
| `--snd-space-5` | `1.25rem` (20px) | Sidebar link padding |
| `--snd-space-6` | `1.5rem` (24px) | Card padding, section gaps |
| `--snd-space-8` | `2rem` (32px) | Page section margins |
| `--snd-space-10` | `2.5rem` (40px) | Major section breaks |
| `--snd-space-12` | `3rem` (48px) | Page header to content gap |

---

### 2.4 Border Radius

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-radius-sm` | `4px` | Small elements: badges, chips, inline inputs |
| `--snd-radius-md` | `8px` | Standard: buttons, inputs, dropdowns |
| `--snd-radius-lg` | `12px` | Cards, panels, modals |
| `--snd-radius-xl` | `16px` | Hero cards, feature panels |
| `--snd-radius-full` | `9999px` | Avatars, pills, toggles |

---

### 2.5 Shadows

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle card lift |
| `--snd-shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default card shadow |
| `--snd-shadow-md` | `0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)` | Hover card shadow |
| `--snd-shadow-lg` | `0 12px 24px -4px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.04)` | Dropdown/popover shadow |
| `--snd-shadow-xl` | `0 24px 48px -8px rgba(0,0,0,0.12)` | Modal shadow |
| `--snd-shadow-focus` | `0 0 0 3px rgba(5, 150, 105, 0.15)` | Focus ring shadow |

---

### 2.6 Z-Index Scale

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-z-base` | `0` | Normal flow |
| `--snd-z-dropdown` | `100` | Dropdowns, popovers |
| `--snd-z-sticky` | `200` | Sticky headers |
| `--snd-z-sidebar` | `300` | Sidebar navigation |
| `--snd-z-header` | `400` | Fixed header |
| `--snd-z-overlay` | `500` | Backdrop overlays |
| `--snd-z-modal` | `600` | Modals, drawers |
| `--snd-z-toast` | `700` | Toast notifications |
| `--snd-z-tooltip` | `800` | Tooltips |

---

### 2.7 Transitions

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-transition-fast` | `100ms ease` | Micro-interactions (color, opacity) |
| `--snd-transition-base` | `150ms ease` | Standard interactions (hover, focus) |
| `--snd-transition-smooth` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` | Layout shifts (sidebar, panels) |
| `--snd-transition-modal` | `300ms cubic-bezier(0.16, 1, 0.3, 1)` | Modal/drawer entry |

> **RULE**: Every interactive element MUST have a transition. No instant state changes. 150ms minimum for hover/focus.

---

### 2.8 Icon Sizes

| Token | Value | Usage |
|:------|:------|:------|
| `--snd-icon-sm` | `16px` | Inline with small text (badges, breadcrumbs) |
| `--snd-icon-md` | `20px` | Sidebar navigation, table actions, button icons |
| `--snd-icon-lg` | `24px` | Card icons, stat card icons, modal close |
| `--snd-icon-xl` | `32px` | Empty state illustrations, feature icons |

> **RULE**: Sidebar icons are ALWAYS `--snd-icon-md` (20px). Never 16px.

---

## 3. Component Specifications

### 3.1 Buttons

#### Primary Button (Gold CTA)
```
Background:    --snd-gold
Color:         --snd-emerald-bg (#022c22, near-black)
Font:          Inter, --snd-text-sm, weight 600, uppercase, tracking 0.04em
Padding:       12px 24px
Radius:        --snd-radius-md (8px)
Shadow:        none
Hover:         background → --snd-gold-bright, translateY(-1px), shadow-sm
Active:        background → --snd-gold (darken 5%), translateY(0)
Disabled:      opacity 0.5, cursor not-allowed, no transform
Focus:         --snd-shadow-focus ring
Transition:    --snd-transition-base
```

#### Secondary Button (Emerald)
```
Background:    --snd-emerald
Color:         #ffffff
Font:          Inter, --snd-text-sm, weight 600, uppercase, tracking 0.04em
Padding:       12px 24px
Radius:        --snd-radius-md
Hover:         background → --snd-emerald-dark, translateY(-1px)
Active:        translateY(0)
Focus:         --snd-shadow-focus ring
```

#### Outline Button
```
Background:    transparent
Color:         --snd-text-body
Border:        1px solid --snd-border
Font:          Inter, --snd-text-sm, weight 600
Padding:       12px 24px
Radius:        --snd-radius-md
Hover:         background → --snd-bg-hover, border → --snd-emerald
Active:        background → --snd-bg-active
```

#### Ghost Button
```
Background:    transparent
Color:         --snd-text-body
Border:        none
Font:          Inter, --snd-text-sm, weight 500
Padding:       8px 16px
Radius:        --snd-radius-md
Hover:         background → --snd-bg-hover
Active:        background → --snd-bg-active
```

#### Destructive Button
```
Background:    --snd-danger
Color:         #ffffff
Hover:         background → #b91c1c
```

#### Button Sizes

| Size | Padding | Font Size | Icon Size |
|:-----|:--------|:----------|:----------|
| Small (`sm`) | `6px 12px` | `--snd-text-xs` | 14px |
| Medium (`md`) | `10px 20px` | `--snd-text-sm` | 16px |
| Large (`lg`) | `14px 28px` | `--snd-text-base` | 20px |

---

### 3.2 Inputs & Form Controls

#### Text Input
```
Width:         100%
Padding:       10px 14px
Font:          Inter, --snd-text-base (15px)
Color:         --snd-text-primary
Background:    --snd-bg-secondary
Border:        1px solid --snd-border
Radius:        --snd-radius-md (8px)
Transition:    --snd-transition-base
Placeholder:   color --snd-text-faint

Focus:
  Border:      --snd-border-focus (--snd-emerald)
  Shadow:      --snd-shadow-focus
  Background:  --snd-bg-secondary

Error:
  Border:      --snd-danger
  Shadow:      0 0 0 3px rgba(220, 38, 38, 0.12)

Disabled:
  Background:  --snd-bg-tertiary
  Color:       --snd-text-faint
  Cursor:      not-allowed
```

#### Label
```
Font:          Inter, --snd-text-sm (13px), weight 600
Color:         --snd-text-primary
Margin-bottom: 6px
```

#### Helper Text
```
Font:          Inter, --snd-text-xs (12px), weight 400
Color:         --snd-text-muted
Margin-top:    4px
```

#### Error Text
```
Font:          Inter, --snd-text-xs (12px), weight 500
Color:         --snd-danger
Margin-top:    4px
```

#### Select / Dropdown
```
Same as Text Input PLUS:
  Appearance:    none
  Padding-right: 36px (room for chevron)
  Background-image: chevron-down SVG in --snd-text-muted
  
Dropdown Panel:
  Background:  --snd-bg-secondary
  Border:      1px solid --snd-border
  Radius:      --snd-radius-md
  Shadow:      --snd-shadow-lg
  Z-index:     --snd-z-dropdown
  Max-height:  280px
  Overflow-y:  auto

Option:
  Padding:     8px 14px
  Font:        Inter, --snd-text-base
  Color:       --snd-text-body
  Hover:       background --snd-bg-hover
  Selected:    background --snd-bg-active, color --snd-emerald, font-weight 600
```

#### Textarea
```
Same as Text Input PLUS:
  Min-height:  100px
  Resize:      vertical
  Line-height: 1.6
```

#### Checkbox
```
Size:          18px × 18px
Border:        2px solid --snd-border
Radius:        --snd-radius-sm (4px)
Background:    --snd-bg-secondary
Transition:    --snd-transition-fast

Checked:
  Background:  --snd-emerald
  Border:      --snd-emerald
  Checkmark:   white SVG, 12px

Hover:
  Border:      --snd-emerald

Focus:
  Shadow:      --snd-shadow-focus

Disabled:
  Opacity:     0.5
```

#### Radio Button
```
Size:          18px × 18px
Border:        2px solid --snd-border
Radius:        --snd-radius-full (circle)
Background:    --snd-bg-secondary

Selected:
  Border:      --snd-emerald
  Inner dot:   8px, --snd-emerald, centered

Hover:
  Border:      --snd-emerald
```

#### Switch / Toggle
```
Track:
  Width:       44px
  Height:      24px
  Radius:      --snd-radius-full
  Background:  --snd-border (off), --snd-emerald (on)
  Transition:  --snd-transition-base

Thumb:
  Size:        20px × 20px
  Radius:      --snd-radius-full
  Background:  #ffffff
  Shadow:      --snd-shadow-xs
  Transform:   translateX(0) off, translateX(20px) on
  Transition:  --snd-transition-smooth

Disabled:
  Opacity:     0.5
```

#### Slider / Range Input
```
Track:
  Height:      6px
  Radius:      --snd-radius-full
  Background:  --snd-border (unfilled), --snd-emerald (filled)

Thumb:
  Size:        20px × 20px
  Radius:      --snd-radius-full
  Background:  #ffffff
  Border:      2px solid --snd-emerald
  Shadow:      --snd-shadow-sm
  Hover:       shadow → --snd-shadow-md, scale(1.1)
  Active:      scale(0.95)

Value Label:
  Font:        Inter, --snd-text-xs, weight 600
  Color:       --snd-text-primary
```

---

### 3.3 Modals

```
Backdrop:
  Background:  rgba(0, 0, 0, 0.60)
  Backdrop-filter: blur(4px)
  Z-index:     --snd-z-overlay
  Transition:  opacity --snd-transition-modal

Container:
  Background:  --snd-bg-secondary
  Border:      1px solid --snd-border
  Radius:      --snd-radius-lg (12px)
  Shadow:      --snd-shadow-xl
  Width:       min(560px, 92vw)
  Max-height:  85vh
  Overflow-y:  auto
  Z-index:     --snd-z-modal
  Animation:   scale(0.95) → scale(1), opacity 0 → 1, --snd-transition-modal

Header:
  Padding:     20px 24px
  Border-bottom: 1px solid --snd-border
  Font:        Inter, --snd-text-xl, weight 600
  Color:       --snd-text-primary

Body:
  Padding:     24px
  Font:        Inter, --snd-text-base
  Color:       --snd-text-body

Footer:
  Padding:     16px 24px
  Border-top:  1px solid --snd-border
  Display:     flex, gap 12px, justify-content flex-end

Close Button:
  Position:    absolute, top 16px, right 16px
  Size:        32px × 32px
  Radius:      --snd-radius-md
  Color:       --snd-text-muted
  Hover:       background --snd-bg-hover, color --snd-text-primary
```

---

### 3.4 Drawers (Side Panels)

```
Same structure as Modal PLUS:
  Position:    fixed, right 0 (or left 0)
  Height:      100vh
  Width:       min(480px, 85vw)
  Radius:      0 (flush against edge)
  Animation:   translateX(100%) → translateX(0)
```

---

### 3.5 Tabs

```
Tab Bar:
  Border-bottom: 2px solid --snd-border
  Gap:           0

Tab:
  Padding:       12px 20px
  Font:          Inter, --snd-text-sm, weight 600
  Color:         --snd-text-muted
  Background:    transparent
  Border:        none
  Border-bottom: 2px solid transparent
  Cursor:        pointer
  Transition:    --snd-transition-base

  Hover:
    Color:       --snd-text-primary

  Active:
    Color:       --snd-emerald
    Border-bottom: 2px solid --snd-emerald

Tab Panel:
  Padding:       20px 0
```

---

### 3.6 Dropdowns / Popovers

```
Container:
  Background:  --snd-bg-secondary
  Border:      1px solid --snd-border
  Radius:      --snd-radius-md
  Shadow:      --snd-shadow-lg
  Z-index:     --snd-z-dropdown
  Min-width:   200px
  Padding:     4px 0
  Animation:   translateY(-4px) → translateY(0), opacity, --snd-transition-base

Item:
  Padding:     8px 16px
  Font:        Inter, --snd-text-base
  Color:       --snd-text-body
  Cursor:      pointer
  Transition:  --snd-transition-fast

  Hover:
    Background: --snd-bg-hover

  Active:
    Background: --snd-bg-active
    Color:      --snd-emerald

Divider:
  Height:      1px
  Background:  --snd-border
  Margin:      4px 0

Section Label:
  Padding:     8px 16px 4px
  Font:        Inter, --snd-text-xs, weight 700, uppercase, tracking 0.08em
  Color:       --snd-text-faint
```

---

### 3.7 Tooltips

```
Background:    --snd-text-primary (inverse — dark on light, light on dark)
Color:         --snd-text-inverse
Font:          Inter, --snd-text-xs, weight 500
Padding:       6px 12px
Radius:        --snd-radius-sm
Shadow:        --snd-shadow-md
Z-index:       --snd-z-tooltip
Max-width:     280px
Animation:     fadeIn + translateY(4px→0), --snd-transition-fast
Arrow:         6px CSS triangle, same color as background
```

---

### 3.8 Badges / Tags

#### Status Badges

| Variant | Background | Text | Border |
|:--------|:-----------|:-----|:-------|
| **Success** | `rgba(16, 185, 129, 0.10)` | `#065f46` | `rgba(16, 185, 129, 0.25)` |
| **Warning** | `rgba(245, 158, 11, 0.10)` | `#92400e` | `rgba(245, 158, 11, 0.25)` |
| **Danger** | `rgba(220, 38, 38, 0.10)` | `#991b1b` | `rgba(220, 38, 38, 0.25)` |
| **Info** | `rgba(2, 132, 199, 0.10)` | `#075985` | `rgba(2, 132, 199, 0.25)` |
| **Neutral** | `rgba(100, 116, 139, 0.10)` | `#475569` | `rgba(100, 116, 139, 0.25)` |
| **Gold** | `rgba(200, 169, 81, 0.12)` | `#92400e` | `rgba(200, 169, 81, 0.30)` |

```
Common:
  Font:        Inter, --snd-text-xs, weight 600, uppercase, tracking 0.04em
  Padding:     4px 10px
  Radius:      --snd-radius-full
  Border:      1px solid (from table)
  Display:     inline-flex, align-items center, gap 4px
```

---

### 3.9 Toast Notifications

```
Container:
  Position:    fixed, top 20px, right 20px
  Z-index:     --snd-z-toast
  Min-width:   320px
  Max-width:   480px

Toast:
  Background:  --snd-bg-secondary
  Border:      1px solid --snd-border
  Border-left: 4px solid (variant color)
  Radius:      --snd-radius-md
  Shadow:      --snd-shadow-lg
  Padding:     16px 20px
  Animation:   slideInRight + fadeIn, --snd-transition-modal
  
  Title:       Inter, --snd-text-sm, weight 600, --snd-text-primary
  Body:        Inter, --snd-text-sm, weight 400, --snd-text-body

Auto-dismiss: 5s default, with progress bar at bottom
Close:        Ghost button, top-right, 24px × 24px
```

---

### 3.10 Progress Bars

```
Track:
  Height:      8px
  Radius:      --snd-radius-full
  Background:  --snd-bg-tertiary

Fill:
  Background:  linear-gradient(90deg, --snd-emerald, --snd-emerald-light)
  Radius:      --snd-radius-full
  Transition:  width --snd-transition-smooth
  
  Warning (>75%): background → --snd-warning gradient
  Danger (>90%):  background → --snd-danger gradient

Label:
  Font:        Inter, --snd-text-xs, weight 600
  Color:       --snd-text-muted
  Position:    right-aligned above bar
```

---

### 3.11 Cards

#### Standard Card
```
Background:    --snd-bg-secondary
Border:        1px solid --snd-border-light
Radius:        --snd-radius-lg (12px)
Padding:       24px
Shadow:        --snd-shadow-xs
Transition:    --snd-transition-base

Hover:
  Shadow:      --snd-shadow-md
  Transform:   translateY(-2px)
```

#### Stat / KPI Card
```
Same as Standard Card PLUS:
  Border-top:  3px solid --snd-emerald (or context color)

  Icon:
    Size:      --snd-icon-lg (24px)
    Container: 48px × 48px, radius --snd-radius-lg
    Background: linear-gradient(135deg, --snd-emerald, --snd-emerald-light)
    Color:     white

  Value:
    Font:      Inter, --snd-text-3xl (36px), weight 700
    Color:     --snd-text-primary
    Letter-spacing: -0.02em

  Label:
    Font:      Inter, --snd-text-sm (13px), weight 500
    Color:     --snd-text-muted
    Transform: uppercase
    Tracking:  0.05em

  Target:
    Font:      Inter, --snd-text-xs (12px), weight 400
    Color:     --snd-text-faint

  Progress bar:
    Height:    6px (smaller for in-card usage)
```

#### Glass Card (Dark Mode / Premium Contexts)
```
Background:    rgba(255, 255, 255, 0.05)
Border:        1px solid rgba(255, 255, 255, 0.10)
Backdrop-filter: blur(16px) saturate(180%)
Radius:        --snd-radius-lg
Shadow:        0 8px 32px rgba(0, 0, 0, 0.30)
```

---

### 3.12 Tables

```
Container:
  Radius:      --snd-radius-lg
  Border:      1px solid --snd-border
  Overflow:     hidden

Header Row:
  Background:  --snd-bg-tertiary
  
Header Cell (th):
  Font:        Cinzel, --snd-text-xs, weight 600, uppercase, tracking 0.08em
  Color:       --snd-text-muted
  Padding:     14px 16px
  Border-bottom: 2px solid --snd-emerald
  Text-align:  left

Body Cell (td):
  Font:        Inter, --snd-text-base (15px), weight 400
  Color:       --snd-text-body
  Padding:     14px 16px
  Border-bottom: 1px solid --snd-border-light

Row Hover:
  Background:  --snd-bg-hover
  Transition:  --snd-transition-fast

Alternating Rows (optional):
  Even rows:   --snd-bg-tertiary

Selected Row:
  Background:  --snd-bg-active
  Border-left: 3px solid --snd-emerald

Empty State:
  Padding:     48px
  Text-align:  center
  Icon:        --snd-icon-xl, --snd-text-faint
  Message:     Inter, --snd-text-md, --snd-text-muted
```

---

### 3.13 Breadcrumbs

```
Container:
  Display:     flex, align-items center, gap 8px

Item:
  Font:        Inter, --snd-text-sm, weight 500
  Color:       --snd-text-muted
  
  Link:
    Color:     --snd-text-muted
    Hover:     color --snd-text-primary
    Transition: --snd-transition-fast

  Current:
    Color:     --snd-text-primary
    Weight:    600

Separator:
  Content:     chevron-right SVG, 14px
  Color:       --snd-text-faint
```

---

### 3.14 Pagination

```
Container:
  Display:     flex, align-items center, gap 4px

Page Button:
  Size:        36px × 36px
  Font:        Inter, --snd-text-sm, weight 500
  Radius:      --snd-radius-md
  Color:       --snd-text-body
  Background:  transparent
  
  Hover:       background --snd-bg-hover
  Active page: background --snd-emerald, color white, weight 600
  Disabled:    opacity 0.4, cursor not-allowed

Page info text:
  Font:        Inter, --snd-text-sm
  Color:       --snd-text-muted
```

---

### 3.15 Avatars

```
Sizes:
  SM: 28px (sidebar, inline)  
  MD: 36px (header, lists)  
  LG: 48px (profile cards)  
  XL: 80px (profile pages)

Radius:     --snd-radius-full (circle)
Background: linear-gradient(135deg, --snd-gold, --snd-gold-bright)
Color:      #000000 (initials text)
Font:       Inter, weight 700
Font-size:  40% of container size
Border:     2px solid --snd-bg-secondary (creates ring effect)
```

---

### 3.16 Sidebar Navigation

```
Container:
  Width:       250px (expanded), 60px (collapsed)
  Background:  --snd-bg-secondary
  Border-right: 1px solid --snd-border
  Height:      100vh
  Position:    fixed
  Z-index:     --snd-z-sidebar
  Transition:  width --snd-transition-smooth
  Overflow:    hidden

Group Header:
  Font:        Inter, --snd-text-xs (12px), weight 700, uppercase, tracking 0.12em
  Color:       --snd-text-muted (default)
  Padding:     8px 20px
  Cursor:      pointer
  Transition:  --snd-transition-base

  Hover:       color --snd-text-body
  
  Active (contains current page):
    Background: --snd-emerald
    Color:      --snd-text-inverse (WHITE) ← CRITICAL FIX
    Radius:     --snd-radius-md
    Margin:     0 8px
    Padding:    8px 12px

  Collapsed mode:
    Display:    none (groups become thin divider lines)

Divider (between groups):
  Height:      1px
  Background:  --snd-border
  Margin:      4px 16px

Link:
  Font:        Inter, --snd-text-md (16px), weight 500
  Color:       --snd-text-body
  Padding:     10px 20px
  Gap:         12px (icon to text)
  Border-left: 3px solid transparent
  Transition:  --snd-transition-base
  
  Hover:
    Background: --snd-bg-hover
    Color:      --snd-emerald

  Active:
    Background: --snd-bg-active
    Color:      --snd-emerald
    Border-left: 3px solid --snd-emerald
    Weight:     600

  Collapsed mode:
    Justify:   center
    Padding:   10px
    No text, icon only
    Active indicator: 6px emerald dot below icon

Icon:
  Size:        --snd-icon-md (20px)
  Color:       inherit (matches text)

Toggle Button:
  Position:    top of sidebar, below logo
  Font:        Inter, --snd-text-md (16px), weight 500
  Color:       --snd-text-body
  Background:  transparent
  Padding:     10px 20px
  Hover:       background --snd-bg-hover, color --snd-emerald
  
  Collapsed mode:
    Background: --snd-emerald
    Color:      white
    Radius:     --snd-radius-md
    Width:      36px, height 36px, centered
    Icon:       expand-right, 20px

Footer (Settings, Sign Out):
  Same styles as Link
  Border-top:  1px solid --snd-border (expanded mode only)
  Collapsed:   No border, icons only
```

---

### 3.17 Header / App Bar

```
Height:        60px
Background:    --snd-bg-secondary
Border-bottom: 1px solid --snd-border
Position:      fixed, top 0, full width
Z-index:       --snd-z-header
Padding:       0 24px
Display:       flex, align-items center, justify-content space-between

Brand:
  Logo:        32px height
  Name:        Inter, --snd-text-base (15px), weight 600
  Subtitle:    Inter, --snd-text-xs (12px), uppercase, tracking 0.03em, --snd-text-muted

Status Indicator:
  Dot:         8px, --snd-success
  Label:       Inter, --snd-text-xs, weight 600, --snd-success

Search:
  Background:  --snd-bg-tertiary
  Border:      1px solid --snd-border
  Radius:      --snd-radius-md
  Padding:     8px 14px 8px 36px (room for icon)
  Font:        Inter, --snd-text-sm
  Max-width:   400px
  Focus:       border --snd-border-focus, shadow --snd-shadow-focus

Clock:
  Font:        monospace, --snd-text-sm, --snd-text-body
```

---

### 3.18 Callout / Alert Panels (In-Page)

| Variant | Border Left | Background | Icon Color |
|:--------|:------------|:-----------|:-----------|
| **Info** | `--snd-info` | `rgba(2, 132, 199, 0.06)` | `--snd-info` |
| **Success** | `--snd-success` | `rgba(16, 185, 129, 0.06)` | `--snd-success` |
| **Warning** | `--snd-warning` | `rgba(245, 158, 11, 0.06)` | `--snd-warning` |
| **Danger** | `--snd-danger` | `rgba(220, 38, 38, 0.06)` | `--snd-danger` |

```
Common:
  Border-left: 4px solid (variant color)
  Background:  (from table)
  Radius:      --snd-radius-md (right side only: 0 8px 8px 0)
  Padding:     16px 20px
  Display:     flex, gap 12px
  
  Title:       Inter, --snd-text-md (16px), weight 600, --snd-text-primary
  Body:        Inter, --snd-text-sm (13px), weight 400, --snd-text-body
  Icon:        --snd-icon-lg (24px), variant color
```

---

### 3.19 Skeleton Loaders

```
Background:    --snd-bg-tertiary
Radius:        --snd-radius-md (for text blocks), --snd-radius-full (for avatars)
Animation:     shimmer, 1.5s infinite ease-in-out

@keyframes shimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

Background:    linear-gradient(90deg, 
                 --snd-bg-tertiary 0%, 
                 rgba(255,255,255,0.6) 50%, 
                 --snd-bg-tertiary 100%)
Background-size: 200px 100%
```

---

### 3.20 Scrollbars

```
Width:         6px (thin, unobtrusive)
Track:         transparent
Thumb:         --snd-border (default), --snd-text-faint (hover)
Radius:        --snd-radius-full

Sidebar (collapsed mode): 
  Display:     none (hidden — prevents visible scrollbar bar)
  Scroll:      still functional via trackpad/wheel

Firefox:
  scrollbar-width: thin
  scrollbar-color: --snd-border transparent
```

---

### 3.21 Radial Gauges (Hypervisor Instruments — ADR-026)

```
Size:          80×80px (Standard), 60×60px (Compact). SVG element.
Track:         Circle, stroke-width 6px, color --snd-bg-tertiary (gray-100/200)
Fill:          Circle, stroke-width 6px, stroke-dasharray for percentage
               stroke-linecap: round
Fill Color:    Semantic ONLY:
               Green (#10b981) — value within normal range
               Amber (#f59e0b) — value in warning range
               Red   (#ef4444) — value in critical range
Center Value:  Inter, 18px, weight 600, --snd-text-primary
Center Label:  Inter, 10px, weight 600, uppercase, tracking 0.08em, --snd-text-muted
Animation:     stroke-dashoffset transition 800ms ease-out on mount
```

### 3.22 Sparklines (Hypervisor Instruments — ADR-026)

```
Dimensions:    120×24px inline SVG
Stroke:        1.5px, stroke-linecap round, stroke-linejoin round
Color:         Emerald (#10b981) default, or semantic per context
Fill:          Optional gradient from stroke color to transparent (opacity 0.1)
Curve:         Smooth bezier (catmull-rom or monotone interpolation)
Style:         No axes, no labels, no grid — pure trend visualization
Context:       Embedded within sirsi-table rows or inside MetricCards
Padding:       2px internal (prevents stroke clipping)
```

### 3.23 Status LEDs (Hypervisor Instruments — ADR-026)

```
Size:          8×8px circle (border-radius: 50%)
Colors:
  Emerald:     #10b981 — Operational / Healthy
  Amber:       #f59e0b — Degraded / Attention Required
  Red:         #ef4444 — Down / Critical Fault
  Gray:        #9ca3af — Unknown / Maintenance Mode

Animation:     animate-pulse ONLY when status is Critical (Red)
               No animation for other states.
               @keyframes led-pulse {
                 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
                 50%      { opacity: 0.8; box-shadow: 0 0 0 4px rgba(239,68,68,0); }
               }
Label:         Inter, 12px, weight 500, --snd-text-body, gap 8px from LED
```

### 3.24 Progress Gauges (Hypervisor Instruments — ADR-026)

```
Height:        6px
Width:         100% of container
Track:         --snd-bg-tertiary (faint gray), border-radius --snd-radius-full
Fill:          border-radius --snd-radius-full
               Default: linear-gradient(90deg, --snd-emerald-light, --snd-emerald)
               Warning (>80%): --snd-warning
               Critical (>90%): --snd-danger
Transition:    width 300ms ease, background-color 200ms ease
```

### 3.25 Instrument Tab Bar (Hypervisor — ADR-026)

```
Container:     border-bottom 2px solid --snd-border, overflow-x auto
Tab Trigger:   Inter, 12px, weight 600, uppercase, tracking 0.06em
               Color: --snd-text-muted (default)
               Padding: 12px 16px
               Border-bottom: 2px solid transparent
               Cursor: pointer
               Transition: --snd-transition-base

  Active:
    Color:       --snd-emerald
    Border-bottom: 2px solid --snd-emerald

  Hover:
    Color:       --snd-text-primary

Tab Panel:     padding-top 20px, min-height 400px
Scroll:        Horizontal scroll with hidden scrollbar for overflow on small screens
```

---

## 4. Layout System

### Content Regions

```
Sidebar:       250px fixed (expanded), 60px (collapsed)
Header:        60px fixed
Main Content:  margin-left: sidebar width, padding-top: 60px + 32px = 92px
Content Max:   1400px centered
Page Padding:  0 24px (desktop), 0 16px (mobile)
```

### Responsive Breakpoints

| Name | Width | Sidebar | Layout |
|:-----|:------|:--------|:-------|
| `desktop-xl` | ≥1440px | Full (250px) | 3-4 column grids |
| `desktop` | ≥1024px | Full or collapsed | 2-3 column grids |
| `tablet` | ≥768px | Collapsed (60px) or hidden | 2 column grids |
| `mobile` | <768px | Hidden (overlay) | 1 column, full width |

---

## 5. State Management

### Interactive States (ALL elements)

Every interactive element MUST implement these states:

| State | Visual Change |
|:------|:-------------|
| **Default** | Base appearance |
| **Hover** | Subtle background shift + color change. Always 150ms transition. |
| **Focus** | Emerald focus ring (`--snd-shadow-focus`). ALWAYS visible for keyboard users. |
| **Active/Pressed** | Slight scale-down or darkened bg. Quick (100ms). |
| **Disabled** | Opacity 0.5, cursor not-allowed, no pointer-events. |
| **Loading** | Spinner replaces icon/text. Opacity 0.8 on container. |
| **Selected** | Emerald accent (border, bg tint, or checkmark). |

---

## 6. Migration Map

### Files to Consolidate

| Current File | Status | Action |
|:-------------|:-------|:-------|
| `sirsi-ui/src/css/tokens.css` | ❌ Wrong tokens (blue, Geist) | **REPLACE** with Swiss Neo-Deco tokens |
| `sirsi-ui/src/css/components.css` | ❌ Wrong colors | **REWRITE** to use SND tokens |
| `sirsi-ui/styles/swiss-neo-deco.css` | ✅ Mostly correct | **PROMOTE** as the base, add missing tokens |
| `sirsi-ui/tailwind-preset.js` | ❌ Wrong colors (blue, DM Serif) | **REWRITE** with SND palette |
| `sirsi-portal/admin/assets/css/admin-styles.css` | ❌ Legacy orange theme | **DEPRECATE** entirely |
| `sirsi-portal/admin/assets/css/common-styles.css` | ⚠️ Good structure, bad sizes | **UPDATE** to consume SND tokens |
| `sirsi-portal/admin/assets/css/shared.css` | ⚠️ Duplicate component styles | **CONSOLIDATE** into SND system |
| `sirsi-portal-app/src/index.css` | ⚠️ Tailwind layer, needs token alignment | **UPDATE** Tailwind config |

### Token Namespace Strategy

All design tokens use the `--snd-` prefix (Swiss Neo-Deco) to:
1. Avoid collision with legacy `--sirsi-` tokens during migration
2. Be easily searchable and replaceable
3. Signal "this is the canonical design system"

Post-migration, `--snd-` remains the permanent namespace.

---

*This document is the canonical source of truth. No CSS may be written that contradicts it.*  
*Version 1.0.0 — March 2026*
