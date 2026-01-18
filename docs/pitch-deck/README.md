# Sirsi Investor Pitch Deck

A beautiful, modern web-based pitch deck for Sirsi - The World's First Generative AI Infrastructure Assistant.

## Features

- 🎨 **Modern Design**: Built with Tailwind CSS and shadcn UI components
- 🌙 **Dark Theme**: Professional dark theme perfect for presentations
- ⌨️ **Keyboard Navigation**: Use arrow keys, Home, End, or number keys (1-9) to navigate
- 📱 **Touch Support**: Swipe gestures for mobile devices
- 🖱️ **Mouse Wheel**: Scroll to navigate between slides
- 📊 **Interactive Charts**: Dynamic revenue projections visualization
- ✨ **Smooth Animations**: Professional transitions and content reveals
- 📐 **Responsive**: Works on all screen sizes
- 🖼️ **Fullscreen Mode**: Click the maximize button for presentation mode

## Quick Start

### Option 1: Using Python (Recommended)
```bash
cd ~/sirsi-pitch-deck
python3 serve.py
```
This will automatically open the deck in your default browser.

### Option 2: Direct File Access
Open `sirsi-pitch-deck.html` directly in your browser:
```bash
open ~/sirsi-pitch-deck/sirsi-pitch-deck.html
```

### Option 3: Using any HTTP server
```bash
cd ~/sirsi-pitch-deck
# Using Node.js
npx http-server -p 8000
# Using Python
python3 -m http.server 8000
```

## Navigation Controls

- **Arrow Keys**: Left/Right to navigate
- **Home/End**: Jump to first/last slide
- **Number Keys**: Press 1-9 to jump to specific slides
- **Mouse/Trackpad**: Click navigation buttons or scroll
- **Touch**: Swipe left/right on mobile devices
- **Fullscreen**: Click the maximize button (top right)

## Slide Overview

1. **Title Slide**: Eye-catching introduction
2. **Executive Summary**: One-page overview for quick scanning
3. **The Problem**: Market pain points with compelling statistics
4. **The Solution**: Sirsi's unique value proposition
5. **How It Works**: Simple 4-step process
6. **Technology Architecture**: Technical credibility
7. **Demo Results**: Real customer success stories
8. **Market Opportunity**: TAM/SAM/SOM analysis
9. **Business Model**: Revenue streams and pricing
10. **Financial Projections**: 5-year growth trajectory
11. **Go-to-Market Strategy**: Customer acquisition plan
12. **The Team**: Leadership credentials
13. **Competitive Advantage**: Market positioning
14. **The Ask**: Funding details and use of funds
15. **Vision**: Inspiring future and call to action

## Development Workflow

### Files
- **`sirsi-pitch-deck.html`** (deck): Canonical production file.
- **`sirsipitchdecknov.html`** (nov): Active working file for development and testing.

### Process
1. Make changes and test in `nov`.
2. Once approved, port changes to `deck`.
3. Document all material decisions in `CHANGELOG.md`.
4. Keep `warp.md` and `claude.md` synchronized as principles evolve.

## Customization

### Updating Content
Edit `sirsipitchdecknov.html` (nov) to propose changes. The structure is straightforward HTML with inline CSS.

Once approved, the same edits are applied to `sirsi-pitch-deck.html` (deck).

### Changing Colors
The color scheme is defined in the Tailwind config within the HTML file:
```javascript
sirsi: {
    blue: '#007BFF',
    dark: '#14142B',
    accent: '#00FF88',
    light: '#F0F8FF',
    gray: '#6B7280'
}
```

### Adding Slides
1. Add a new `<div class="slide">` section in the HTML
2. Update `totalSlides` in `deck.js`
3. Follow the existing slide structure

## Export Options

### PDF Export
1. Open the deck in Chrome/Edge
2. Press `Ctrl/Cmd + P` to print
3. Select "Save as PDF"
4. Choose landscape orientation
5. Set margins to "None"
6. Enable "Background graphics"

### Screenshots
Use the fullscreen mode and capture individual slides for use in other presentations.

## Technical Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first styling
- **JavaScript**: Vanilla JS for navigation
- **Lucide Icons**: Beautiful open-source icons
- **Canvas API**: For chart rendering

## Browser Support

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Tips for Presenting

1. Use fullscreen mode for the best experience
2. Test navigation before presenting
3. Keep a backup PDF version
4. Ensure good internet connection (for CDN resources)
5. Use a presenter remote that sends arrow key signals

## Two-Deck Strategy

Sirsi maintains two distinct pitch decks for different audiences:

### Mass Market Deck (`sirsipitchdecknov.html` + `sirsi-pitch-deck.html`)
- Audience: Developers, startups, SMBs, early-stage angels
- Narrative: "Build, host, and scale apps without infrastructure complexity"
- Focus: Democratization, ease of use, developer experience
- 14 slides

### Institutional Deck (`sirsi-pitch-deck-infrastructure.html`)
- Audience: Family offices, datacenters, enterprises, infrastructure investors
- Narrative: "AI infrastructure optimization engine for datacenters and enterprises"
- Focus: Cost reduction (25-40%), margin improvement, network effects, defensible moat
- 12 slides
- Target: Regional/edge datacenters, co-location providers, universities/enterprises ("conversions") monetizing idle capacity

## File Structure
```
sirsi-pitch-deck/
├── sirsi-pitch-deck.html              # Canonical deck (mass market, production)
├── sirsipitchdecknov.html             # Working file (mass market, development)
├── sirsi-pitch-deck-infrastructure.html # Institutional deck (datacenters/FOs, production)
├── warp.md                            # Implementation guidelines and principles
├── claude.md                          # AI assistance guidance
├── CHANGELOG.md                       # Decision log
├── serve.py                           # Python server for local viewing
├── README.md                          # This file
├── assets/                            # Images and media
├── css/
│   └── styles.css                     # Custom animations and styles
└── js/
    └── deck.js                        # Navigation and interaction logic
```

## License

Copyright © 2025 Sirsi. All rights reserved. Confidential and proprietary.
