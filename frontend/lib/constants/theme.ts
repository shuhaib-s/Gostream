/**
 * Theme Constants
 * Design system colors, spacing, and style definitions
 */

export const COLORS = {
  // Primary Brand Colors - Dark Green/Emerald gradient theme
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Secondary Accent Colors
  accent: {
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    lime: '#84cc16',
    green: '#22c55e',
    yellow: '#f59e0b',
    red: '#ef4444',
  },

  // Dark Mode Colors - Black with Green accents
  dark: {
    bg: {
      primary: '#0a0f0a',
      secondary: '#0f140f',
      tertiary: '#141a14',
      card: '#1a201a',
      elevated: '#1f251f',
    },
    text: {
      primary: '#f0fdf4',
      secondary: '#d1fae5',
      tertiary: '#a7f3d0',
      muted: '#6ee7b7',
    },
    border: {
      primary: '#1f2e1f',
      secondary: '#2a3a2a',
      accent: '#10b981',
    },
  },

  // Light Mode Colors (for future light mode support)
  light: {
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      tertiary: '#64748b',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
    },
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    live: '#ef4444',
  },
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  emerald: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  green: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  hero: 'linear-gradient(135deg, #000000 0%, #0a0f0a 30%, #0f1a0f 70%, #000000 100%)',
  card: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(16, 185, 129, 0.3)',
  glowLg: '0 0 40px rgba(16, 185, 129, 0.4)',
};

export const ANIMATIONS = {
  transition: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

export const BORDER_RADIUS = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

