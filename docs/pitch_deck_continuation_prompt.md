# Continuation Prompt: Pitch Deck Design Finalization (Phase 2)

## 1. Context & Objective
We have successfully standardized the structure and footers for the **Sirsi Nexus Pitch Deck** (`packages/sirsi-portal/pitchdeck.html`). The deck currently consists of **16 slides** with a unified "Slide 3 Footer Rubric" (Weight 500, Light Grey, standardized naming).

**Target File**: `/Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/pitchdeck.html`

## 2. The Design Standard
The "Blueprint" for the deck is **Slide 3 (The Crisis)**. It utilizes a blend of **Swiss Style Editorial** (high contrast, strict grid, extreme typography) and an **Automotive Performance Metaphor** (F1 velocity vs. Salvage reality).

### **Standard Visual Rules:**
- **Backgrounds**: White/Off-white with subtle 24px dot-grids (1px dots, ~5-8% opacity).
- **Secondary Colors**: Primary Green (`#059669`), Metallic Gold (`#C8A951`), and Alert Red (`#EF4444`) for crisis points.
- **Footers**: Standardized global `.slide-footer` class (Weight 500, 0.75rem, uppercase, 0.12em tracking).
- **Typography**: `Cinzel` for headings, `Inter` for body. Large, high-impact headers.

## 3. Next Steps: Slide-by-Slide Refinement
Your mission is to sweep through Slides 4-16 and bring them up to the same "F1 vs Salvage" design fidelity seen on Slide 3.

### **Priority 1: Slide 4 & 5 (The Solution & IP)**
- Infuse automotive "Precision Engineering" language.
- Ensure the "3 Patents" on Slide 5 feel like "Performance Upgrades" or "Aero-kits" in the metaphor.
- Tighten the grid layout to match the Swiss Style density.

### **Priority 2: Slide 7 & 8 (Hardware & Core)**
- These currently feature "Neural-Hashgraph" and "Nexus Core" Specs. 
- Ensure the imagery (assets/pod_top.png, assets/supercluster_mesh_8k.png) is contained properly within the panels (not full-bleed).
- Match the "Stat Box" styling on Slide 7 to the clean dashboard cards on Slide 3.

### **Priority 3: Slide 13 & 14 (Growth & Financials)**
- The charts (Revenue & User Growth) need to feel like "Telemetry Data."
- The "By The Numbers" matrix (Slide 14) needs perfectly aligned columns and high-impact "Efficiency Signals" (e.g., "1:1 ALPHA" ratio).

## 4. Verification Checkpoint
- Ensure all 16 slides maintain the footer sequence: `CONFIDENTIAL // [NAME] // SLIDE [01-16]`.
- Verify the progress bar at the top (`#progressBar`) still syncs correctly with the 16 slides.
- Do not introduce "phantom slides"—maintain the strict count of 16 top-level `.slide` divs.
- Deployment target: `firebase deploy --only hosting:sirsi-ai --project sirsi-nexus-live`.
