import AsyncStorage from '@react-native-async-storage/async-storage'

const HABITS_KEY = 'meowhabits_habits'
const LOGS_KEY = 'meowhabits_logs'
const SETTINGS_KEY = 'meowhabits_settings'

async function getData<T>(key: string, defaultVal: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultVal
  } catch {
    return defaultVal
  }
}

async function setData(key: string, data: any): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data))
}

export async function getHabits(): Promise<any[]> {
  return await getData<any[]>(HABITS_KEY, [])
}

export async function addHabit(habit: any): Promise<void> {
  const habits = await getHabits()
  habits.push(habit)
  await setData(HABITS_KEY, habits)
}

export async function updateHabit(id: string, updates: any): Promise<void> {
  const habits = await getHabits()
  const idx = habits.findIndex((h: any) => h.id === id)
  if (idx !== -1) {
    habits[idx] = { ...habits[idx], ...updates }
    await setData(HABITS_KEY, habits)
  }
}

export async function deleteHabit(id: string): Promise<void> {
  const habits = await getHabits()
  await setData(HABITS_KEY, habits.filter((h: any) => h.id !== id))
  const logs = await getData<any[]>(LOGS_KEY, [])
  await setData(LOGS_KEY, logs.filter((l: any) => l.habitId !== id))
}

export async function getLogsForDate(date: string): Promise<any[]> {
  const logs = await getData<any[]>(LOGS_KEY, [])
  const habits = await getHabits()
  return logs
    .filter((l: any) => l.date === date)
    .map((l: any) => {
      const habit = habits.find((h: any) => h.id === l.habitId)
      return { ...l, name: habit?.name || '', emoji: habit?.emoji || '', color: habit?.color || '#FF8BA7' }
    })
}

export async function getLogsForDateRange(startDate: string, endDate: string): Promise<any[]> {
  const logs = await getData<any[]>(LOGS_KEY, [])
  const habits = await getHabits()
  return logs
    .filter((l: any) => l.date >= startDate && l.date <= endDate)
    .map((l: any) => {
      const habit = habits.find((h: any) => h.id === l.habitId)
      return { ...l, name: habit?.name || '', emoji: habit?.emoji || '', color: habit?.color || '#FF8BA7' }
    })
}

export async function logHabit(habitId: string, date: string, completed: boolean): Promise<void> {
  const logs = await getData<any[]>(LOGS_KEY, [])
  const existing = logs.findIndex((l: any) => l.habitId === habitId && l.date === date)
  if (existing !== -1) {
    logs[existing] = { ...logs[existing], completed, timestamp: Date.now() }
  } else {
    logs.push({
      id: `log_${habitId}_${date}`,
      habitId,
      date,
      completed,
      timestamp: Date.now(),
    })
  }
  await setData(LOGS_KEY, logs)
}

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getData<Record<string, string>>(SETTINGS_KEY, {})
  return settings[key] || null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const settings = await getData<Record<string, string>>(SETTINGS_KEY, {})
  settings[key] = value
  await setData(SETTINGS_KEY, settings)
}
