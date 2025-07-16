'use client';

import { useEffect, useState } from 'react';

interface ThemeConfig {
  name: string;
  primary: string;
  accent: string;
  background: string;
  glass: {
    opacity: number;
    blur: number;
    saturation: number;
    hueShift: number;
  };
}

const themes: Record<string, ThemeConfig> = {
  default: {
    name: 'Default',
    primary: '#6366f1',
    accent: '#ec4899',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    glass: {
      opacity: 0.8,
      blur: 20,
      saturation: 180,
      hueShift: 0
    }
  },
  dawn: {
    name: 'Dawn',
    primary: '#f59e0b',
    accent: '#f97316',
    background: 'linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)',
    glass: {
      opacity: 0.75,
      blur: 24,
      saturation: 200,
      hueShift: 15
    }
  },
  dusk: {
    name: 'Dusk',
    primary: '#8b5cf6',
    accent: '#ec4899',
    background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    glass: {
      opacity: 0.85,
      blur: 18,
      saturation: 160,
      hueShift: -10
    }
  },
  midnight: {
    name: 'Midnight',
    primary: '#3b82f6',
    accent: '#06b6d4',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    glass: {
      opacity: 0.6,
      blur: 28,
      saturation: 150,
      hueShift: 5
    }
  },
  forest: {
    name: 'Forest',
    primary: '#10b981',
    accent: '#059669',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    glass: {
      opacity: 0.8,
      blur: 22,
      saturation: 170,
      hueShift: 8
    }
  },
  ocean: {
    name: 'Ocean',
    primary: '#0ea5e9',
    accent: '#06b6d4',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    glass: {
      opacity: 0.82,
      blur: 20,
      saturation: 190,
      hueShift: -5
    }
  }
};

interface TimeBasedTheme {
  hour: number;
  theme: string;
}

const timeBasedThemes: TimeBasedTheme[] = [
  { hour: 6, theme: 'dawn' },     // 6 AM - Dawn
  { hour: 9, theme: 'default' },  // 9 AM - Default
  { hour: 18, theme: 'dusk' },    // 6 PM - Dusk
  { hour: 22, theme: 'midnight' } // 10 PM - Midnight
];

export const useAdvancedTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isTimeBasedEnabled, setIsTimeBasedEnabled] = useState(false);
  const [customTheme, setCustomTheme] = useState<ThemeConfig | null>(null);

  // Get current time-based theme
  const getTimeBasedTheme = (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find the appropriate theme for current time
    for (let i = timeBasedThemes.length - 1; i >= 0; i--) {
      if (currentHour >= timeBasedThemes[i].hour) {
        return timeBasedThemes[i].theme;
      }
    }
    
    // Default to midnight theme for early hours
    return 'midnight';
  };

  // Apply theme to CSS variables
  const applyTheme = (themeName: string) => {
    const theme = themes[themeName] || themes.default;
    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-accent', theme.accent);
    
    // Apply glass morphism variables
    root.style.setProperty('--glass-adaptive-opacity', theme.glass.opacity.toString());
    root.style.setProperty('--glass-blur-intensity', `${theme.glass.blur}px`);
    root.style.setProperty('--glass-saturation', `${theme.glass.saturation}%`);
    root.style.setProperty('--glass-hue-shift', `${theme.glass.hueShift}deg`);

    // Apply background
    document.body.style.background = theme.background;
  };

  // Update theme based on time
  useEffect(() => {
    if (isTimeBasedEnabled) {
      const updateTheme = () => {
        const timeTheme = getTimeBasedTheme();
        setCurrentTheme(timeTheme);
        applyTheme(timeTheme);
      };

      updateTheme();
      
      // Update every minute
      const interval = setInterval(updateTheme, 60000);
      return () => clearInterval(interval);
    }
  }, [isTimeBasedEnabled]);

  // Apply theme when manually changed
  useEffect(() => {
    if (!isTimeBasedEnabled) {
      applyTheme(currentTheme);
    }
  }, [currentTheme, isTimeBasedEnabled]);

  // Detect system color scheme preference
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-adjust glass opacity based on ambient light
  const [ambientLight, setAmbientLight] = useState(1);

  useEffect(() => {
    // Simulate ambient light detection
    // In a real implementation, this could use the Ambient Light API
    const detectAmbientLight = () => {
      const hour = new Date().getHours();
      let lightLevel = 1;

      if (hour >= 6 && hour < 8) lightLevel = 0.7; // Dawn
      else if (hour >= 8 && hour < 18) lightLevel = 1; // Day
      else if (hour >= 18 && hour < 20) lightLevel = 0.8; // Dusk
      else lightLevel = 0.6; // Night

      setAmbientLight(lightLevel);
      document.documentElement.style.setProperty('--ambient-light', lightLevel.toString());
    };

    detectAmbientLight();
    const interval = setInterval(detectAmbientLight, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Create custom theme
  const createCustomTheme = (config: Partial<ThemeConfig>): string => {
    const customKey = `custom-${Date.now()}`;
    const newTheme: ThemeConfig = {
      name: config.name || 'Custom',
      primary: config.primary || themes.default.primary,
      accent: config.accent || themes.default.accent,
      background: config.background || themes.default.background,
      glass: {
        ...themes.default.glass,
        ...config.glass
      }
    };

    themes[customKey] = newTheme;
    setCustomTheme(newTheme);
    return customKey;
  };

  // Seasonal theme suggestions
  const getSeasonalTheme = (): string => {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) return 'forest'; // Spring
    if (month >= 5 && month <= 7) return 'ocean'; // Summer
    if (month >= 8 && month <= 10) return 'dawn'; // Autumn
    return 'midnight'; // Winter
  };

  // Accessibility helpers
  const adjustForAccessibility = (highContrast: boolean = false) => {
    const root = document.documentElement;
    
    if (highContrast) {
      root.style.setProperty('--glass-adaptive-opacity', '0.95');
      root.style.setProperty('--glass-blur-intensity', '0px');
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  // Performance optimization
  const enableReducedMotion = (enabled: boolean = true) => {
    const root = document.documentElement;
    
    if (enabled) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  return {
    // Current state
    currentTheme,
    themes,
    customTheme,
    isTimeBasedEnabled,
    prefersDark,
    ambientLight,

    // Actions
    setTheme: setCurrentTheme,
    enableTimeBased: setIsTimeBasedEnabled,
    createCustomTheme,
    applyTheme,

    // Utilities
    getTimeBasedTheme,
    getSeasonalTheme,
    adjustForAccessibility,
    enableReducedMotion,

    // Theme info
    getCurrentThemeConfig: () => themes[currentTheme] || themes.default,
    getAvailableThemes: () => Object.keys(themes),
    isCustomTheme: (themeName: string) => themeName.startsWith('custom-')
  };
};
