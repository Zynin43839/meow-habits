import AsyncStorage from '@react-native-async-storage/async-storage'

const HABITS_KEY = 'meowhabits_habits'
const LOGS_KEY = 'meowhabits_logs'
const SETTINGS_KEY = 'meowhabits_settings'
const TASKS_KEY = 'meowhabits_tasks'
const JOURNAL_KEY = 'meowhabits_journal'
const XP_KEY = 'meowhabits_xp'

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

const FOCUS_KEY = 'meowhabits_focus_sessions'

export async function getFocusSessions(startDate?: string, endDate?: string): Promise<any[]> {
  const sessions = await getData<any[]>(FOCUS_KEY, [])
  if (!startDate || !endDate) return sessions
  return sessions.filter((s: any) => s.date >= startDate && s.date <= endDate)
}

export async function saveFocusSession(session: any): Promise<void> {
  const sessions = await getData<any[]>(FOCUS_KEY, [])
  sessions.push({ ...session, timestamp: Date.now() })
  await setData(FOCUS_KEY, sessions)
}

export async function deleteOldFocusSessions(days: number = 90): Promise<void> {
  const sessions = await getData<any[]>(FOCUS_KEY, [])
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  const filtered = sessions.filter((s: any) => s.date >= cutoffStr)
  await setData(FOCUS_KEY, filtered)
}

// ── Tasks ─────────────────────────────────────

export async function getTasks(): Promise<any[]> {
  return await getData<any[]>(TASKS_KEY, [])
}

export async function addTask(task: any): Promise<void> {
  const tasks = await getTasks()
  tasks.push(task)
  await setData(TASKS_KEY, tasks)
}

export async function updateTask(id: string, updates: any): Promise<void> {
  const tasks = await getTasks()
  const idx = tasks.findIndex((t: any) => t.id === id)
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates }
    await setData(TASKS_KEY, tasks)
  }
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks()
  await setData(TASKS_KEY, tasks.filter((t: any) => t.id !== id))
}

export async function getTasksForDate(date: string): Promise<any[]> {
  const tasks = await getTasks()
  return tasks.filter((t: any) => t.date === date)
}

// ── Journal ───────────────────────────────────

export async function getJournalEntries(startDate?: string, endDate?: string): Promise<any[]> {
  const entries = await getData<any[]>(JOURNAL_KEY, [])
  if (!startDate || !endDate) return entries
  return entries.filter((e: any) => e.date >= startDate && e.date <= endDate)
}

export async function getJournalEntry(date: string): Promise<any | null> {
  const entries = await getData<any[]>(JOURNAL_KEY, [])
  return entries.find((e: any) => e.date === date) || null
}

export async function saveJournalEntry(entry: any): Promise<void> {
  const entries = await getData<any[]>(JOURNAL_KEY, [])
  const existing = entries.findIndex((e: any) => e.date === entry.date)
  if (existing !== -1) {
    entries[existing] = { ...entries[existing], ...entry, timestamp: Date.now() }
  } else {
    entries.push({ ...entry, timestamp: Date.now() })
  }
  await setData(JOURNAL_KEY, entries)
}

export async function deleteJournalEntry(date: string): Promise<void> {
  const entries = await getData<any[]>(JOURNAL_KEY, [])
  await setData(JOURNAL_KEY, entries.filter((e: any) => e.date !== date))
}

// ── XP ────────────────────────────────────────

export async function getXp(): Promise<number> {
  return await getData<number>(XP_KEY, 0)
}

export async function addXp(amount: number): Promise<number> {
  const current = await getXp()
  const total = current + amount
  await setData(XP_KEY, total)
  return total
}

export async function resetXp(): Promise<void> {
  await setData(XP_KEY, 0)
}
