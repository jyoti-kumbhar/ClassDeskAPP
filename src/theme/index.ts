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
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  ink: '#0F172A',
  inkSoft: '#64748B',
  border: '#E2E8F0',
  brand: '#386AEB',
  brandDark: '#2551C9',
  brandTint: '#EBF2FE',
  accent: '#F97316',
  accentTint: '#FFEDD5',
  danger: '#EF4444',
  dangerTint: '#FEE2E2',
  success: '#10B981',
  successTint: '#DCFCE7',
  info: '#0284C7',
};

export const darkColors: ThemeColors = {
  bg: '#0B0F19',
  surface: '#111827',
  surface2: '#1E293B',
  ink: '#F8FAFC',
  inkSoft: '#94A3B8',
  border: '#1E293B',
  brand: '#4B82F6',
  brandDark: '#386AEB',
  brandTint: '#172554',
  accent: '#FB923C',
  accentTint: '#431407',
  danger: '#F87171',
  dangerTint: '#450A0A',
  success: '#34D399',
  successTint: '#064E3B',
  info: '#38BDF8',
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
