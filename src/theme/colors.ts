export const palette = {
  // Core
  primary: '#FF8BA7',
  primaryDark: '#E86A8A',
  secondary: '#C9A0DC',
  secondaryDark: '#A87DC4',

  // Accent (default)
  accent: '#FFB347',
  accentLight: '#FFD699',

  // Backgrounds
  bgLight: '#FFF5F7',
  bgDark: '#1A1A2E',
  cardLight: '#FFFFFF',
  cardDark: '#2D2D44',

  // Text
  textPrimaryLight: '#2D2D44',
  textPrimaryDark: '#F0F0F5',
  textSecondaryLight: '#7A7A8C',
  textSecondaryDark: '#B0B0C0',

  // Status
  success: '#6BCB77',
  warning: '#FFB347',
  danger: '#FF6B6B',
  info: '#74B9FF',

  // Streak
  streakHigh: '#FF8BA7',
  streakMedium: '#FFB347',
  streakLow: '#B0B0C0',

  // Calendar
  calendarDone: '#6BCB77',
  calendarMiss: '#FF6B6B',
  calendarFuture: '#E8E8F0',
  calendarToday: '#FF8BA7',

  // Misc
  border: '#E8E8F0',
  borderDark: '#3D3D54',
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
    calendarFuture: '#3D3D54',
    calendarToday: palette.primary,
    overlay: palette.overlay,
    white: palette.cardDark,
    black: palette.bgDark,
  },
}

export type AppTheme = typeof lightTheme
export type ThemeColors = typeof lightTheme['colors']
