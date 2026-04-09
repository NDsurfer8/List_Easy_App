/**
 * Design tokens – bright, friendly palette (sky + warm accent)
 */
export const theme = {
  colors: {
    // Primary – vivid sky blue (headers, key actions)
    primary: '#0284c7',
    primaryLight: '#0ea5e9',
    primaryMuted: '#38bdf8',
    // Accent – warm coral for CTAs and highlights
    accent: '#f97316',
    accentHover: '#ea580c',
    accentMuted: '#fdba74',
    // Surfaces – airy, light backgrounds
    background: '#f0f9ff',
    surface: '#ffffff',
    surfaceMuted: '#e0f2fe',
    // Text – readable without harsh black
    text: '#0c4a6e',
    textSecondary: '#0369a1',
    textMuted: '#64748b',
    textOnPrimary: '#ffffff',
    /** Subtitle / secondary on primary-colored headers */
    textOnPrimaryMuted: 'rgba(255,255,255,0.88)',
    textOnAccent: '#ffffff',
    // Status
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef9c3',
    error: '#e11d48',
    errorBg: '#ffe4e6',
    // Borders – soft sky tint
    border: '#bae6fd',
    borderLight: '#e0f2fe',
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
      shadowColor: '#0369a1',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#0369a1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#0369a1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 5,
    },
  },
};
