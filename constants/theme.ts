// ==============================================================================
// MYFARM - DESIGN SYSTEM & THEME TOKENS
// ==============================================================================

export const Colors = {
  primary: '#133E2B',       // Deep Forest Green
  primaryLight: '#235D43',  // Mid Agricultural Green
  primaryFaint: '#EAF3ED',  // Pale Mint Tint
  accent: '#D97706',        // Warm Harvest Amber
  accentGold: '#F59E0B',    // Golden Grain
  accentLight: '#FEF3C7',   // Cream Amber
  background: '#F8FAF7',    // Crisp Organic Off-White
  surface: '#FFFFFF',       // Clean White Card
  surfaceSubtle: '#F1F5F2', // Subtle Slate Green
  border: '#E2E8F0',        // Delicate Border Gray
  borderLight: '#EDF2EE',
  
  text: {
    primary: '#0F172A',     // Near Black
    secondary: '#475569',   // Slate Charcoal
    muted: '#94A3B8',       // Muted Gray
    inverse: '#FFFFFF',
    brand: '#133E2B',
  },
  
  status: {
    success: '#16A34A',
    successBg: '#DCFCE7',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    error: '#DC2626',
    errorBg: '#FEE2E2',
    info: '#2563EB',
    infoBg: '#DBEAFE',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  heading1: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  }
};
