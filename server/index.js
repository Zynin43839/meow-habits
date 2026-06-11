import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const OLLAMA_URL = 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = 'scb10x/typhoon2.5-qwen3-4b:latest'

// ── Agent message queue ────────────────────
const agentMessages = []

const THAI_GREETINGS = [
  'สวัสดีตอนเช้าค่ะ! 🌞 วันนี้มี 3 ภารกิจรอคุณอยู่นะคะ เริ่มกันเลย!',
  'อรุณสวัสดิ์ค่า~ เช้านี้เหมียวมีพลังมาก! พร้อมจะจัดการวันนี้หรือยัง? 💪',
  'Good morning! ☕ ตื่นแล้วหรือยังคะ? มีกาแฟรออยู่นะ~ (เหมียวก็อยากกินปลาด้วย 🐟)',
]

const THAI_AFTERNOON = [
  'บ่ายแล้วค่า~ ยังเหลืออีก 2 ภารกิจนะคะ อย่าเพิ่งถอย! 🔥',
  'จะบ่ายแล้วนะครับ ~ ครึ่งวันที่เหลือ มาทำให้ดีที่สุดกัน! ⚡',
  'คุณทำได้ดีมากเลย! 💕 พักสัก 5 นาทีแล้วค่อยต่อนะคะ~',
]

const THAI_EVENING = [
  'เย็นแล้วค่ะ! 🌅 วันนี้เป็นยังไงบ้าง? อย่าลืมเขียน journal ก่อนนอนนะ~',
  'เก่งมาก ๆ วันนี้! 🎉 มาสรุปความสำเร็จกันหน่อยดีกว่า~',
  'วันนี้คุณทำงานหนักมากเลย 😊 รางวัลคือการพักผ่อนนะคะ อย่าลืม!',
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return THAI_GREETINGS[Math.floor(Math.random() * THAI_GREETINGS.length)]
  if (h < 18) return THAI_AFTERNOON[Math.floor(Math.random() * THAI_AFTERNOON.length)]
  return THAI_EVENING[Math.floor(Math.random() * THAI_EVENING.length)]
}

// Generate agent messages on schedule (every time poll happens, generate new one if queue empty)
function ensureMessage() {
  if (agentMessages.length > 0) return
  agentMessages.push({
    id: `agent_${Date.now()}`,
    text: getGreeting(),
    timestamp: Date.now(),
    read: false,
  })
}

// ── Ollama ────────────────────────────────
async function callOllama(prompt) {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7, max_tokens: 300 },
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.response?.trim() || null
  } catch {
    return null
  }
}

function buildSystemPrompt(habits, logsSummary, question) {
  const habitsList = habits.map((h) => `- ${h.emoji} ${h.name}`).join('\n')
  return `คุณคือ "เหมียว" (Mew) — AI Coach แมวน่ารักที่คอยให้กำลังใจและวิเคราะห์นิสัย

บุคลิก: น่ารัก, ใช้ภาษาไทยสบาย ๆ, มีมุกแมว, ใช้ emoji บ้าง, สั้น กระชับ (ไม่เกิน 3-4 ประโยค)
หน้าที่: ดูข้อมูล habits ของ user แล้ววิเคราะห์แนวโน้ม ให้กำลังใจ และตอบคำถาม

ข้อมูล habits ของ user:
${habitsList}

สถิติ 30 วันที่ผ่านมา:
${JSON.stringify(logsSummary, null, 2)}

${question ? `คำถามจาก user: "${question}"` : 'ไม่มีคำถามเฉพาะ — แสดง insight อัตโนมัติ'}

ตอบแบบน่ารัก ให้กำลังใจ กระชับ ใช้ภาษาไทย`
}

function getFallbackInsight(logsSummary) {
  const total = logsSummary.totalDays || 30
  const done = logsSummary.totalDone || 0
  const rate = total > 0 ? Math.round((done / total) * 100) : 0

  if (rate >= 80) return `เก่งมาก ๆ 🎉 คุณทำได้ถึง ${rate}% ใน 30 วันที่ผ่านมา! เหมียวภูมิใจในตัวคุณสุด ๆ ~`
  if (rate >= 50) return `ทำได้ดีเลยครับ! ${rate}% ในเดือนนี้ — มีวันหยุดไปบ้าง แต่ก็กลับมาทำต่อเนื่องได้ 💪`
  if (rate >= 30) return `เดือนนี้ ${rate}% — อย่าลืมนะคะ "วันนี้เริ่มใหม่ก็ได้" 🐱`
  return `เดือนนี้หนักหน่อยนะคะ ${rate}% — ไม่เป็นไรเลย ถ้ายังหายใจอยู่ก็เริ่มใหม่ได้ทุกวัน 🌟`
}

// ── In-memory store (synced from frontend) ──
const store = {
  habits: [],
  logs: [],
  tasks: [],
  journal: [],
  focusSessions: [],
  xp: 0,
}

// ── Sync endpoint ──────────────────────────
app.post('/api/sync', (req, res) => {
  const { habits, logs, tasks, journal, focusSessions, xp } = req.body
  if (habits) store.habits = habits
  if (logs) store.logs = logs
  if (tasks) store.tasks = tasks
  if (journal) store.journal = journal
  if (focusSessions) store.focusSessions = focusSessions
  if (xp !== undefined) store.xp = xp
  res.json({ ok: true })
})

// ── Tasks ──────────────────────────────────
app.get('/api/tasks', (req, res) => {
  const { date } = req.query
  if (date) return res.json(store.tasks.filter((t) => t.date === date))
  res.json(store.tasks)
})

app.post('/api/tasks', (req, res) => {
  store.tasks.push(req.body)
  res.json({ ok: true })
})

app.post('/api/tasks/complete', (req, res) => {
  const task = store.tasks.find((t) => t.id === req.body.id)
  if (task) task.completed = true
  res.json({ ok: true })
})

// ── Habits ─────────────────────────────────
app.get('/api/habits', (req, res) => {
  res.json(store.habits)
})

app.post('/api/habits', (req, res) => {
  store.habits.push(req.body)
  res.json({ ok: true })
})

app.post('/api/habits/log', (req, res) => {
  const { habitId, date, completed } = req.body
  const existing = store.logs.findIndex((l) => l.habitId === habitId && l.date === date)
  if (existing !== -1) {
    store.logs[existing].completed = completed
  } else {
    store.logs.push({ id: `log_${habitId}_${date}`, habitId, date, completed: completed ?? true, timestamp: Date.now() })
  }
  res.json({ ok: true })
})

// ── Journal ────────────────────────────────
app.get('/api/journal/:date', (req, res) => {
  const entry = store.journal.find((j) => j.date === req.params.date)
  res.json(entry || null)
})

app.post('/api/journal', (req, res) => {
  const existing = store.journal.findIndex((j) => j.date === req.body.date)
  if (existing !== -1) store.journal[existing] = req.body
  else store.journal.push(req.body)
  res.json({ ok: true })
})

// ── Focus ──────────────────────────────────
app.post('/api/focus', (req, res) => {
  store.focusSessions.push(req.body)
  res.json({ ok: true })
})

app.get('/api/focus/stats', (req, res) => {
  const days = parseInt(req.query.days) || 7
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  const recent = store.focusSessions.filter((s) => s.date >= cutoffStr)
  const totalMinutes = recent.reduce((sum, s) => sum + (s.totalFocusMinutes || s.workMinutes || 0), 0)
  res.json({ sessions: recent.length, totalMinutes, days })
})

// ── Summary ────────────────────────────────
app.get('/api/summary/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const doneHabits = store.logs.filter((l) => l.date === today && l.completed).length
  const totalHabits = store.habits.length
  const tasksToday = store.tasks.filter((t) => t.date === today)
  const focusToday = store.focusSessions.filter((s) => s.date === today)
  const journalToday = store.journal.find((j) => j.date === today)
  res.json({ date: today, doneHabits, totalHabits, tasks: tasksToday, focusSessions: focusToday, journal: journalToday || null, xp: store.xp })
})

// ── Rank ───────────────────────────────────
app.get('/api/rank', (req, res) => {
  res.json({ xp: store.xp })
})

// ── Agent messages ─────────────────────────
app.get('/api/agent/messages', (req, res) => {
  ensureMessage()
  const pending = agentMessages.filter((m) => !m.read)
  res.json({ messages: pending.slice(0, 5) })
})

app.post('/api/agent/messages/read', (req, res) => {
  const { ids } = req.body
  if (ids && Array.isArray(ids)) {
    ids.forEach((id) => {
      const msg = agentMessages.find((m) => m.id === id)
      if (msg) msg.read = true
    })
  }
  res.json({ ok: true })
})

// ── AI Insight ─────────────────────────────
app.post('/api/ai/insight', async (req, res) => {
  const { habits, logsSummary, question } = req.body

  if (!habits || !logsSummary) {
    return res.status(400).json({ error: 'habits and logsSummary required' })
  }

  const prompt = buildSystemPrompt(habits, logsSummary, question || null)

  let reply = await callOllama(prompt)

  if (!reply) {
    reply = question
      ? 'ขอโทษนะคะ 🙇 ตอนนี้เหมียวงีบอยู่ ลองกลับมาถามใหม่ทีหลังนะ~'
      : getFallbackInsight(logsSummary)
  }

  res.json({ reply })
})

// ── Health ─────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

app.listen(PORT, () => {
  console.log(`🤖 MeowHabits AI Agent running on http://localhost:${PORT}`)
})
