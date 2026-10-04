export const palette = {
  indigo50: '#F2F4FF', indigo100: '#E4E8FF', indigo400: '#7D89F8', indigo600: '#5154D2', indigo700: '#4445AC',
  teal50: '#ECFDF9', teal500: '#14A88A', teal600: '#0D8D74', amber50: '#FFF8E8', amber600: '#C58B22', red50: '#FFF1F1', red600: '#C44747',
} as const;

export const lightColors = {
  background: '#F7F8FA', surface: '#FFFFFF', surfaceSecondary: '#F1F3F6', surfaceElevated: '#FFFFFF', border: '#E5E7EC', borderStrong: '#D5D9E0',
  textPrimary: '#17191F', textSecondary: '#5C6270', textTertiary: '#8A909C', disabled: '#B8BCC5', actionPrimary: palette.indigo600,
  actionPrimaryPressed: palette.indigo700, actionSoft: palette.indigo50, safe: '#14866D', safeSoft: palette.teal50, upcoming: '#4F6FD9',
  upcomingSoft: palette.indigo50, attention: palette.amber600, attentionSoft: palette.amber50, overdue: palette.red600, overdueSoft: palette.red50,
  overlay: 'rgba(23, 25, 31, 0.42)',
} as const;

export const darkColors = {
  background: '#0C0D11', surface: '#14161B', surfaceSecondary: '#1B1E24', surfaceElevated: '#20242B', border: '#292D35', borderStrong: '#373C46',
  textPrimary: '#F4F5F7', textSecondary: '#B1B6C0', textTertiary: '#7D838E', disabled: '#626872', actionPrimary: '#858BF4',
  actionPrimaryPressed: '#7378DE', actionSoft: '#26283E', safe: '#52C7A8', safeSoft: '#152D29', upcoming: '#8198F5', upcomingSoft: '#22283D',
  attention: '#E4B45A', attentionSoft: '#30291B', overdue: '#E57373', overdueSoft: '#352020', overlay: 'rgba(0, 0, 0, 0.62)',
} as const;

export const spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const radii = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 999 } as const;
export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const }, h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const }, h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  title: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const }, bodyLarge: { fontSize: 17, lineHeight: 26, fontWeight: '400' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const }, bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const }, caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;
