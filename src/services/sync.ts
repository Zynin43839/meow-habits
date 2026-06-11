const SERVER_URL = 'http://localhost:3001'

let syncTimer: ReturnType<typeof setInterval> | null = null
let lastSync = 0

async function getState() {
  const { getHabits, getLogsForDateRange, getTasks, getJournalEntries, getFocusSessions, getXp } = await import('../db')

  const end = new Date().toISOString().split('T')[0]
  const start = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const [habits, logs, tasks, journal, focusSessions, xp] = await Promise.all([
    getHabits(),
    getLogsForDateRange(start, end),
    getTasks(),
    getJournalEntries(),
    getFocusSessions(),
    getXp(),
  ])

  return { habits, logs, tasks, journal, focusSessions, xp }
}

export async function syncToServer() {
  // Throttle to once per 30s
  if (Date.now() - lastSync < 30000) return
  lastSync = Date.now()

  try {
    const state = await getState()
    const res = await fetch(`${SERVER_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    if (!res.ok) throw new Error('Sync failed')
  } catch {
    // Server offline — skip
  }
}

export function startAutoSync() {
  if (syncTimer) return
  syncTimer = setInterval(syncToServer, 60000) // every 60s
  syncToServer() // initial sync
}

export function stopAutoSync() {
  if (syncTimer) { clearInterval(syncTimer); syncTimer = null }
}
