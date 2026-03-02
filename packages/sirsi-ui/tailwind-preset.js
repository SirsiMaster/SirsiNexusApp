/**
 * Sirsi UI — Tailwind CSS Preset
 * Swiss Neo-Deco Design System v1.0.0
 *
 * Consumed by sirsi-portal-app and any other Tailwind-based package.
 * Maps Tailwind theme values to Swiss Neo-Deco design tokens.
 *
 * @see docs/SWISS_NEO_DECO_STYLE_GUIDE.md
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary — Emerald (Sirsi Brand)
        primary: {
          DEFAULT: "#059669",
          light: "#10B981",
          dark: "#047857",
          bg: "#022c22",
        },
        // Accent — Gold (Neo-Deco)
        gold: {
          DEFAULT: "#C8A951",
          bright: "#E2C76B",
          dim: "#F0E6D2",
          dark: "#A08332",
        },
        // Semantic
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#022c22",
        },
        // Tenant palette (available on request)
        tenant: {
          blue: "#60A3D9",
          "blue-dark": "#0B1F41",
          "royal-blue": "#1E3A5F",
          "royal-bright": "#2563EB",
          yellow: "#FFD940",
          orange: "#ff5e00",
        },
      },
      fontFamily: {
        // Swiss Neo-Deco defaults
        heading: ["Cinzel", "serif"],
        body: ["Inter", "sans-serif"],
        // Tenant fonts (available on request)
        "tenant-sans": ["Geist Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Liberation Sans", "sans-serif"],
        "tenant-display": ["DM Serif Display", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
      fontSize: {
        "snd-3xl": ["2.25rem", { lineHeight: "1.15" }],     // 36px — hero stats
        "snd-2xl": ["1.75rem", { lineHeight: "1.2" }],      // 28px — page titles
        "snd-xl": ["1.375rem", { lineHeight: "1.3" }],      // 22px — card/modal titles
        "snd-lg": ["1.125rem", { lineHeight: "1.4" }],      // 18px — section headers
        "snd-md": ["1rem", { lineHeight: "1.5" }],           // 16px — sidebar links, buttons
        "snd-base": ["0.9375rem", { lineHeight: "1.6" }],   // 15px — body text
        "snd-sm": ["0.8125rem", { lineHeight: "1.5" }],     // 13px — captions
        "snd-xs": ["0.75rem", { lineHeight: "1.4" }],       // 12px — minimum
      },
      borderRadius: {
        "snd-sm": "4px",
        "snd-md": "8px",
        "snd-lg": "12px",
        "snd-xl": "16px",
      },
      boxShadow: {
        "snd-xs": "0 1px 2px rgba(0,0,0,0.04)",
        "snd-sm": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "snd-md": "0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)",
        "snd-lg": "0 12px 24px -4px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.04)",
        "snd-xl": "0 24px 48px -8px rgba(0,0,0,0.12)",
        "snd-focus": "0 0 0 3px rgba(5, 150, 105, 0.15)",
        card: "0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)",
      },
      zIndex: {
        dropdown: "100",
        sticky: "200",
        sidebar: "300",
        header: "400",
        overlay: "500",
        modal: "600",
        toast: "700",
        tooltip: "800",
      },
    },
  },
};
