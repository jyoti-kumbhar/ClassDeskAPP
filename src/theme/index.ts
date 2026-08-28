// ============================================================================
// CLASSDESK - DESIGN SYSTEM THEME TOKENS (PHASE 1)
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  border: string;
  brand: string;
  brandDark: string;
  brandTint: string;
  accent: string;
  accentTint: string;
  danger: string;
  dangerTint: string;
  success: string;
  successTint: string;
  info: string;
}

export const lightColors: ThemeColors = {
  bg: '#F6F5FB',
  surface: '#FFFFFF',
  surface2: '#ECEAF7',
  ink: '#241F3D',
  inkSoft: '#6B6690',
  border: '#DAD5EF',
  brand: '#5B4FE0',
  brandDark: '#4438C2',
  brandTint: '#EDEAFC',
  accent: '#FF8A3D',
  accentTint: '#FFEEDD',
  danger: '#E14F63',
  dangerTint: '#FBE3E7',
  success: '#1E7A52',
  successTint: '#E1F5EA',
  info: '#2E9BC7',
};

export const darkColors: ThemeColors = {
  bg: '#141229',
  surface: '#1D1B38',
  surface2: '#262445',
  ink: '#EDEBFB',
  inkSoft: '#A29DC9',
  border: '#362F5C',
  brand: '#8B7FFF',
  brandDark: '#6F62E8',
  brandTint: '#2A2557',
  accent: '#FFA65C',
  accentTint: '#3A2A1C',
  danger: '#F27085',
  dangerTint: '#3A222A',
  success: '#6FE0A8',
  successTint: '#17352A',
  info: '#5FBEE0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 9,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  h4: { fontSize: 15, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11.5, fontWeight: '600' as const, letterSpacing: 0.4 },
  code: { fontSize: 13, fontWeight: '600' as const },
};

export const shadows = {
  sm: {
    shadowColor: '#241F3D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#241F3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#241F3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
