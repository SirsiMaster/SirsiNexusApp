# ADR-020: Pitch Deck Visual Standard & Rubric

## Status
Accepted

## Context
The Sirsi Nexus Pitch Deck (`pitchdeck.html`) serves as the primary strategic medium for fundraising ($12.1M Seed). To ensure brand consistency and professional-grade institutional fidelity, a standardized visual rubric is required for all slides.

## Decision
We adopt the **Slide 3 (The Crisis)** rubric as the canonical design standard for the 16-slide pitch deck.

### 1. Structural Requirements
- **Slide Count**: Exactly 16 top-level slides.
- **Header**: Standard `slide-header` containing an `h3` (Uppercase, Tracking 0.3em) and an `h2` (Branding Title).
- **Footer**: Standardized `slide-footer` class (Weight 500, light grey, uppercase, letter-spacing 0.12em).
- **Content Wrap**: `max-width: 1400px` for ultra-wide screen locking.

### 2. Branding & Metaphor
- **Theme**: "Swiss Style Editorial" (High contrast, strict grid).
- **Metaphor**: Automotive performance—mapping infrastructure debt to a "Salvage Engine" and ambitious scaling to "F1 Velocity."
- **Visual Motif**: 24px dot-grids, glassmorphism panels (opacity based), and metallic gold accents.

### 3. Footer Rubric
Every slide must contain:
- Left: `SIRSI TECHNOLOGIES INC.`
- Right: `CONFIDENTIAL // [SLIDE NAME] // SLIDE [XX]`

## Consequences
- All future slide additions or modifications must adhere to this rubric.
- Any deviation in footer font-weight (700+) or color (pure black) is considered a design regression.
- Slide numbering must remain synchronized with the physical position in the HTML document.
