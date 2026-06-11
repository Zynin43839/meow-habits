import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase | null = null

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('meowhabits.db')
    await initTables()
  }
  return db
}

async function initTables() {
  if (!db) return
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '⭐',
      frequency TEXT NOT NULL DEFAULT 'daily',
      customDays TEXT,
      targetTimesPerWeek INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      color TEXT NOT NULL DEFAULT '#FF8BA7'
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_logs_date ON habit_logs(date);
    CREATE INDEX IF NOT EXISTS idx_logs_habit ON habit_logs(habitId);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}

export async function getHabits(): Promise<any[]> {
  const d = await getDb()
  return await d.getAllAsync('SELECT * FROM habits ORDER BY createdAt DESC')
}

export async function addHabit(habit: any): Promise<void> {
  const d = await getDb()
  await d.runAsync(
    'INSERT INTO habits (id, name, emoji, frequency, customDays, targetTimesPerWeek, createdAt, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [habit.id, habit.name, habit.emoji, habit.frequency, JSON.stringify(habit.customDays || []), habit.targetTimesPerWeek || 0, habit.createdAt, habit.color]
  )
}

export async function updateHabit(id: string, habit: any): Promise<void> {
  const d = await getDb()
  await d.runAsync(
    'UPDATE habits SET name = ?, emoji = ?, frequency = ?, customDays = ?, targetTimesPerWeek = ?, color = ? WHERE id = ?',
    [habit.name, habit.emoji, habit.frequency, JSON.stringify(habit.customDays || []), habit.targetTimesPerWeek || 0, habit.color, id]
  )
}

export async function deleteHabit(id: string): Promise<void> {
  const d = await getDb()
  await d.runAsync('DELETE FROM habit_logs WHERE habitId = ?', [id])
  await d.runAsync('DELETE FROM habits WHERE id = ?', [id])
}

export async function getLogsForDate(date: string): Promise<any[]> {
  const d = await getDb()
  return await d.getAllAsync(
    'SELECT hl.*, h.name, h.emoji, h.color FROM habit_logs hl JOIN habits h ON hl.habitId = h.id WHERE hl.date = ? ORDER BY hl.timestamp',
    [date]
  )
}

export async function getLogsForDateRange(startDate: string, endDate: string): Promise<any[]> {
  const d = await getDb()
  return await d.getAllAsync(
    'SELECT hl.*, h.name, h.emoji, h.color FROM habit_logs hl JOIN habits h ON hl.habitId = h.id WHERE hl.date >= ? AND hl.date <= ? ORDER BY hl.date, hl.timestamp',
    [startDate, endDate]
  )
}

export async function logHabit(habitId: string, date: string, completed: boolean): Promise<void> {
  const d = await getDb()
  const existing = await d.getAllAsync(
    'SELECT id FROM habit_logs WHERE habitId = ? AND date = ?',
    [habitId, date]
  )
  if (existing.length > 0) {
    await d.runAsync(
      'UPDATE habit_logs SET completed = ?, timestamp = ? WHERE habitId = ? AND date = ?',
      [completed ? 1 : 0, Date.now(), habitId, date]
    )
  } else {
    await d.runAsync(
      'INSERT INTO habit_logs (id, habitId, date, completed, timestamp) VALUES (?, ?, ?, ?, ?)',
      [`log_${habitId}_${date}`, habitId, date, completed ? 1 : 0, Date.now()]
    )
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const d = await getDb()
  const row = await d.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key])
  return row ? (row as any).value : null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const d = await getDb()
  const existing = await d.getFirstAsync('SELECT key FROM settings WHERE key = ?', [key])
  if (existing) {
    await d.runAsync('UPDATE settings SET value = ? WHERE key = ?', [value, key])
  } else {
    await d.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value])
  }
}
