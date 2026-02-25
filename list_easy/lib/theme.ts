/**
 * Design tokens for a polished, sellable look
 */
export const theme = {
  colors: {
    // Primary brand – deep, trustworthy
    primary: '#0f172a',
    primaryLight: '#1e293b',
    primaryMuted: '#334155',
    // Accent – clear CTAs, links
    accent: '#0d9488',
    accentHover: '#0f766e',
    accentMuted: '#5eead4',
    // Surfaces
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceMuted: '#f1f5f9',
    // Text
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textOnPrimary: '#f8fafc',
    textOnAccent: '#ffffff',
    // Status
    success: '#059669',
    successBg: '#d1fae5',
    warning: '#d97706',
    warningBg: '#fef3c7',
    error: '#dc2626',
    errorBg: '#fef2f2',
    // Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  typography: {
    hero: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
    h1: { fontSize: 24, fontWeight: '700' as const },
    h2: { fontSize: 20, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 24 },
    bodySmall: { fontSize: 14, lineHeight: 20 },
    caption: { fontSize: 13, lineHeight: 18 },
    label: { fontSize: 12, fontWeight: '600' as const },
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    },
  },
};
