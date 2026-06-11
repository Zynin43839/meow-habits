export const palette = {
  primary: '#FF6B9D',
  primaryDark: '#E8537F',
  secondary: '#B388EB',
  accent: '#FFB74D',
  accentLight: '#FFE0B2',

  bgLight: '#FFF0F5',
  bgDark: '#1F1A2E',
  cardLight: '#FFFFFF',
  cardDark: '#2D2640',
  cardWarm: '#FFF8F0',

  textPrimaryLight: '#2D1B4E',
  textPrimaryDark: '#F0EBF5',
  textSecondaryLight: '#7A6B8A',
  textSecondaryDark: '#B0A3C0',

  success: '#66BB6A',
  warning: '#FFB74D',
  danger: '#EF5350',
  info: '#64B5F6',

  streakHigh: '#FF6B9D',
  streakMedium: '#FFB74D',
  streakLow: '#B0A3C0',

  calendarDone: '#66BB6A',
  calendarMiss: '#EF5350',
  calendarFuture: '#E8DDF5',
  calendarToday: '#FF6B9D',

  border: '#F0E6F0',
  borderDark: '#3D3354',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
}

export const lightTheme = {
  dark: false as const,
  colors: {
    background: palette.bgLight,
    card: palette.cardLight,
    text: palette.textPrimaryLight,
    textSecondary: palette.textSecondaryLight,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    info: palette.info,
    border: palette.border,
    streakHigh: palette.streakHigh,
    streakMedium: palette.streakMedium,
    streakLow: palette.streakLow,
    calendarDone: palette.calendarDone,
    calendarMiss: palette.calendarMiss,
    calendarFuture: palette.calendarFuture,
    calendarToday: palette.calendarToday,
    overlay: palette.overlay,
    white: palette.white,
    black: palette.black,
    cardWarm: palette.cardWarm,
  },
}

export const darkTheme = {
  dark: true as const,
  colors: {
    background: palette.bgDark,
    card: palette.cardDark,
    text: palette.textPrimaryDark,
    textSecondary: palette.textSecondaryDark,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    info: palette.info,
    border: palette.borderDark,
    streakHigh: palette.streakHigh,
    streakMedium: palette.streakMedium,
    streakLow: palette.streakLow,
    calendarDone: palette.calendarDone,
    calendarMiss: palette.calendarMiss,
    calendarFuture: '#3D3354',
    calendarToday: palette.primary,
    overlay: palette.overlay,
    white: palette.cardDark,
    black: palette.bgDark,
    cardWarm: palette.cardDark,
  },
}

export type AppTheme = typeof lightTheme
export type ThemeColors = typeof lightTheme['colors']
