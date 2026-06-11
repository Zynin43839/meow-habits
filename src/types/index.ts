export type HabitFrequency = 'daily' | 'weekly' | 'weekdays' | 'custom'

export interface Habit {
  id: string
  name: string
  emoji: string
  frequency: HabitFrequency
  customDays?: number[]
  targetTimesPerWeek?: number
  createdAt: number
  color: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
  timestamp: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  completionRate: number
}

export type ThemeMode = 'light' | 'dark'
export type Language = 'th' | 'en'

export interface UserSettings {
  theme: ThemeMode
  language: Language
  accentColor: string
  notificationsEnabled: boolean
  notificationTime: string
}

export interface FocusSession {
  id: string
  date: string
  task: string
  workMinutes: number
  breakMinutes: number
  completedWork: number
  completedBreak: number
  totalFocusMinutes: number
  sound: string
  timestamp: number
}

export interface Task {
  id: string
  title: string
  date: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
}

export interface JournalEntry {
  date: string
  mood: number
  note: string
  gratitude: string
  timestamp: number
}

export interface AIScheduleSuggestion {
  habitId: string
  habitName: string
  suggestedTime: string
  confidence: number
  reason: string
}

export interface LevelData {
  level: number
  xp: number
  xpToNext: number
}
