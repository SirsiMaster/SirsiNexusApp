# Pitch Deck Revert & Enhancement - Continuation Prompt
**Session Date:** February 4, 2026  
**Conversation ID:** f1186789-7be5-415f-9412-57aee1fdeed9

---

## 🎯 Primary Objective

**Revert the pitch deck to its original, premium visual format while updating it with new financial data and COMPLETELY REBUILDING the "By The Numbers" slide to match the reference image EXACTLY.**

---

## ⚠️ CRITICAL: "BY THE NUMBERS" SLIDE MUST BE REBUILT

**THE CURRENT SLIDE 12 DOES NOT MATCH THE REFERENCE AT ALL.**

The previous session only changed colors from black to green. This is NOT what the user wants.  
The slide must be **COMPLETELY REWRITTEN** to match the reference image structure and content.

### Reference Image Location:
`/Users/thekryptodragon/.gemini/antigravity/brain/f1186789-7be5-415f-9412-57aee1fdeed9/uploaded_media_1770234269304.png`

**YOU MUST VIEW THIS IMAGE BEFORE STARTING WORK.**

---

## 📐 EXACT SPECIFICATION: "By The Numbers" Slide

The reference image shows a **dense, professional, table-based layout** with GREEN headers and WHITE backgrounds. Here is the EXACT structure to implement:

### Header
- **Title**: "BY THE NUMBERS" (large, bold, green text, centered)
- **Subtitle**: "$21M for 39.9% Across 3 Funding Rounds" (green background banner, white text, centered)
- **Vision Statement**: Small italic text describing the commercialization goal

### Layout: 3-Column Grid

#### LEFT COLUMN: Fundraising Roadmap

**Table with GREEN header row:**
| Round | Amount | Pre-Money | Equity | Timeline |
|-------|--------|-----------|--------|----------|
| Pre-Seed | $1.5M | $12.0M | 11.1% | Q2 2025 |
| Seed | $4.5M | $30.0M | 13.0% | Q1 2026 |
| Series A | $15.0M | $80.0M | 15.8% | Q4 2026 |

**Current Ask Box** (green left border):
- Raising: $1.5M
- Valuation: $12.0M pre-money

**Key Stats Row** (4 large numbers in boxes):
| $13.5M | 2 | $500M+ | +43% |
|--------|---|--------|------|
| Post-Money Valuation | Patents Pending | Target Exit Value | ROI with QSBS |

**Tax-Efficient Investment (QSBS) Box**:
- Our C-Corp structure qualifies for QSBS tax benefits:
- $1.5M pre-seed investment
- Projected exit return ($21M)
- Standard: $14.7M after tax
- **With QSBS: $21M (tax-free)**

#### MIDDLE COLUMN: Use of Funds

**Header**: "Use of Funds" (green background, white text)

Bullet list:
- Core AI technology development
- Key technical hires (2-3 engineers)
- Initial product validation
- Early revenue generation

**Additional Info Box** (green left border):
- Equity: 11.1% of the company
- IP Advantage: Two patents pending

#### RIGHT COLUMN: Projected Equity & Investor Benefits

**Projected Equity After Series A Table:**
| Stakeholder | Ownership |
|-------------|-----------|
| Founders | 51.2% |
| Pre-Seed Investors | 9.1% |
| Seed Investors | 13.0% |
| Series A Investors | 15.8% |
| Employee Option Pool | 11.1% |

**Founder Retention Box**: 51.2% After Series A

**Total Funding Box**: $21M Through Series A

**Capital Efficiency Strategy** (bullet list):
- Lean Operations: Optimize burn rate
- Early Revenue: Initial customers by month 9
- Strategic Hiring: Focus on essential roles
- IP Advantage: Leverage patents for positioning

**QSBS Benefits for Investors Table:**
| Return Type | Value |
|-------------|-------|
| Standard Return (After Tax) | $14.7M |
| QSBS Return (Tax-Free) | $21M |
| Tax Savings | $6.3M |

### Design Requirements
- **Color Palette**: GREEN (#10B981 or similar) and WHITE only. NO BLACK BACKGROUNDS.
- **Table Headers**: Green background with white text
- **Borders**: Subtle gray borders on tables
- **Typography**: Clean, professional, sans-serif
- **Spacing**: Dense but readable (this is an information-rich slide)
- **Green Accent Bars**: Use green left borders for callout boxes

---

## 📁 Key Files & Locations

### Source Files (The "Good" Versions)
| File | Path | Details |
|------|------|---------|
| **Root Pitch Deck (CORRECT)** | `/Users/thekryptodragon/Development/SirsiNexusApp/pitch-deck.html` | 1688 lines, 14 slides |
| **Sirsi Logo** | `/Users/thekryptodragon/Development/SirsiNexusApp/docs/pitch-deck/assets/sirsi-logo.png` | Rainbow infinity logo |

### Deployment Target
| File | Path | Status |
|------|------|--------|
| **Portal Pitch Deck** | `/Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/pitchdeck.html` | NEEDS REPLACEMENT (still has old 12-slide version) |

---

## ✅ Completed Work (Previous Session)

1. ✅ Identified correct source file (`pitch-deck.html` at root)
2. ✅ Added logo to header (appears in upper left)
3. ✅ Updated some colors from black to green (but this is NOT enough)

---

## ❌ Outstanding Issues (MUST FIX)

### 1. **CRITICAL: "By The Numbers" Slide Needs Complete Rebuild**
- Current slide is NOTHING like the reference image
- Previous session only changed colors, not structure
- **Must completely rewrite slide 12 HTML to match reference exactly**

### 2. **File Copy Not Working**
- Terminal sandboxing is blocking file operations
- **Solution**: User will disable Terminal Sandboxing before restart

### 3. **Logo Path Issues**
- Logo works locally but path may not work when deployed
- Need to copy logo to portal assets folder and fix paths

---

## 🔧 Implementation Steps

### Step 1: View the Reference Image
```
View file: /Users/thekryptodragon/.gemini/antigravity/brain/f1186789-7be5-415f-9412-57aee1fdeed9/uploaded_media_1770234269304.png
```

### Step 2: Completely Rewrite Slide 12 HTML
Replace the existing slide 12 (lines ~1296-1496 in pitch-deck.html) with new HTML that:
- Implements the exact 3-column layout from the reference
- Uses only GREEN and WHITE colors (no black)
- Contains all tables and data from the specification above
- Uses dense, professional table styling

### Step 3: Copy Files to Portal
```bash
cp /Users/thekryptodragon/Development/SirsiNexusApp/pitch-deck.html /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/pitchdeck.html
mkdir -p /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/assets/pitch-deck/
cp /Users/thekryptodragon/Development/SirsiNexusApp/docs/pitch-deck/assets/sirsi-logo.png /Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/assets/pitch-deck/
```

### Step 4: Fix Logo Paths
Update both files to use a path that works in both environments.

### Step 5: Deploy
```bash
cd /Users/thekryptodragon/Development/SirsiNexusApp
git add .
git commit -m "Update pitch deck with redesigned By The Numbers slide"
git push
cd packages/sirsi-portal
firebase deploy --only hosting:sirsi-ai
```

---

## 📊 Current Financials (To Use in Slide)

**NOTE**: The reference image shows older numbers. The user may want to use these CURRENT numbers instead:

| Metric | Current Value |
|--------|---------------|
| Current Round | Seed |
| Raise Amount | $12.1M |
| Pre-Money Valuation | $28M |
| TEDCO Investment | $100K |
| Contracted Revenue | $147K |
| Patents Pending | 3 |

**ASK THE USER**: Should the "By The Numbers" slide use the reference image's numbers ($21M across 3 rounds) or the current numbers ($12.1M Seed)?

---

## 🛠️ Antigravity Settings to Enable

Before starting, ensure these settings in Antigravity:

| Setting | Value |
|---------|-------|
| **Terminal Sandboxing** | **DISABLED** |
| Sandbox Allow Network | Enabled |
| Agent Mode | Planning Mode |

Access via: **Cmd + ,** or **Settings > Open Antigravity User Settings**

---

## 🏁 Success Criteria

The task is complete when:

1. ✅ Slide 12 ("By The Numbers") visually matches the reference image
2. ✅ Uses only green and white colors (no black backgrounds)
3. ✅ Contains all tables: Fundraising Roadmap, Use of Funds, Projected Equity, QSBS Benefits
4. ✅ Logo appears correctly in header on all slides
5. ✅ File successfully copied to sirsi-portal directory
6. ✅ Deployed to sirsi.ai/pitchdeck

---

**End of Continuation Prompt**
