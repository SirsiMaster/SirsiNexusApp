/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			/* ── Swiss Neo-Deco Color System ─────────────────────── */
			colors: {
				/* Sirsi brand colors (direct use) */
				sirsi: {
					gold: '#C8A951',
					dark: '#05100a',
					emerald: '#10B981',
					forest: '#0a2a1b',
				},
				/* shadcn/ui semantic tokens (CSS variable-driven) */
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
			},

			/* ── Typography ──────────────────────────────────────── */
			fontFamily: {
				heading: ['Cinzel', 'serif'],
				body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
			fontSize: {
				/* Swiss Neo-Deco Typography Scale */
				'snd-micro': ['0.625rem', { lineHeight: '1.3' }],      /* 10px — micro labels */
				'snd-xs': ['0.6875rem', { lineHeight: '1.3' }],        /* 11px — micro labels */
				'snd-sm': ['0.8125rem', { lineHeight: '1.5' }],        /* 13px — small text */
				'snd-base': ['0.9375rem', { lineHeight: '1.6' }],      /* 15px — body text minimum */
				'snd-md': ['1rem', { lineHeight: '1.5' }],             /* 16px — subtitle */
				'snd-lg': ['1.125rem', { lineHeight: '1.3' }],         /* 18px — h3 */
				'snd-xl': ['1.25rem', { lineHeight: '1.3' }],          /* 20px — h2 */
				'snd-2xl': ['1.875rem', { lineHeight: '1.1' }],        /* 30px — page title */
			},

			/* ── Spacing & Layout ────────────────────────────────── */
			width: {
				'sidebar': '250px',
				'sidebar-mini': '60px',
			},
			height: {
				'header': '60px',
			},
			maxWidth: {
				'content': '1400px',
			},
			spacing: {
				'header-offset': '92px',  /* 60px header + 32px padding */
			},

			/* ── Backgrounds ─────────────────────────────────────── */
			backgroundImage: {
				'sirsi-gradient': 'linear-gradient(to bottom right, #05100a, #0a1a11, #064e3b)',
				'sirsi-dark': 'linear-gradient(135deg, #022c22, #000000)',
				'emerald-gradient': 'linear-gradient(135deg, #059669, #047857)',
			},

			/* ── Border Radius ───────────────────────────────────── */
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'snd-card': '12px',
				'snd-panel': '16px',
			},

			/* ── Shadows (Swiss Neo-Deco) ────────────────────────── */
			boxShadow: {
				'snd-card': '0 1px 2px rgba(0, 0, 0, 0.04)',
				'snd-card-hover': '0 4px 20px rgba(0, 0, 0, 0.06)',
				'snd-table': '0 1px 3px rgba(0, 0, 0, 0.05)',
				'snd-emerald': '0 4px 12px rgba(5, 150, 105, 0.25)',
				'snd-emerald-hover': '0 6px 20px rgba(5, 150, 105, 0.35)',
				'snd-focus': '0 0 0 3px rgba(5, 150, 105, 0.15)',
			},

			/* ── Transitions ─────────────────────────────────────── */
			transitionTimingFunction: {
				'snd': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},

			/* ── Animations ──────────────────────────────────────── */
			keyframes: {
				'admin-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.4' },
				},
			},
			animation: {
				'admin-pulse': 'admin-pulse 2s infinite',
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
