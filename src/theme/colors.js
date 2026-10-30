// Paleta "Moderno" (boho), vinda de outro projeto do Gabriel.
// Modo claro = paleta nova. Modo escuro = derivado dela (ver darkColors).

export const lightColors = {
  background: '#EFE8DB',
  card: '#FAF7F1',
  cardShadow: 'rgba(47, 42, 36, 0.08)',
  textPrimary: '#2F2A24',
  textSecondary: '#6A5E50',
  textMuted: '#7A6D5C',
  primary: '#43614A', // verde
  primaryPressed: '#344D3A',
  onPrimary: '#FFFFFF',
  accent: '#8F5F3B', // marrom
  success: '#43614A',
  warning: '#C2925D',
  tagBackground: '#DDD2C0',
  border: '#DDD2C0',
  danger: '#B8503A',
  header: '#EFE8DB',
  banner: '#E6DDCB',
  tabActive: '#43614A',
  tabInactive: '#7A6D5C',
  inputBackground: '#F8F4EC',
};

export const darkColors = {
  // Derivado da paleta Moderno: marrom bem escuro no fundo, verde mais claro como cor principal.
  background: '#1C1814',
  card: '#26211B',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
  textPrimary: '#EFE8DB',
  textSecondary: '#B8AC9A',
  textMuted: '#9A8E7C',
  primary: '#7FA687', // verde clareado para ter contraste sobre o fundo escuro
  primaryPressed: '#95B79C',
  onPrimary: '#1C1814', // texto/ícone sobre botões primários (branco não passaria no verde claro)
  accent: '#C9915F', // marrom clareado
  success: '#7FA687',
  warning: '#D4A373',
  tagBackground: '#3A322A',
  border: '#3A332B',
  danger: '#D4715A',
  header: '#1C1814',
  banner: '#33291F',
  tabActive: '#7FA687',
  tabInactive: '#9A8E7C',
  inputBackground: '#2E2720',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16 };
