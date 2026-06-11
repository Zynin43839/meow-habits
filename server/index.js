import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const OLLAMA_URL = 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = 'scb10x/typhoon2.5-qwen3-4b:latest'

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

app.post('/api/ai/insight', async (req, res) => {
  const { habits, logsSummary, question } = req.body

  if (!habits || !logsSummary) {
    return res.status(400).json({ error: 'habits and logsSummary required' })
  }

  const prompt = buildSystemPrompt(habits, logsSummary, question || null)

  let reply = await callOllama(prompt)

  if (!reply) {
    reply = question
      ? 'เหมียวขอโทษด้วยนะคะ 🙇 ตอนนี้แมวกำลังงีบอยู่ (AI offline) ลองกลับมาถามใหม่ทีหลังนะ~'
      : getFallbackInsight(logsSummary)
  }

  res.json({ reply })
})

function getFallbackInsight(logsSummary) {
  const total = logsSummary.totalDays || 30
  const done = logsSummary.totalDone || 0
  const rate = total > 0 ? Math.round((done / total) * 100) : 0

  if (rate >= 80) return `เก่งมาก ๆ 🎉 คุณทำได้ถึง ${rate}% ใน 30 วันที่ผ่านมา! เหมียวภูมิใจในตัวคุณสุด ๆ ~ เหมียวขอรางวัลเป็นปลาหน่อย~ 🐟`
  if (rate >= 50) return `ทำได้ดีเลยครับ! ${rate}% ในเดือนนี้ — มีวันหยุดไปบ้าง แต่ก็กลับมาทำต่อเนื่องได้ แบบนี้แหละคือการสร้างวินัยที่แท้จริง 💪`
  if (rate >= 30) return `เดือนนี้ ${rate}% — อาจจะยังไม่สม่ำเสมอ แต่อย่าลืมนะว่า "วันนี้เริ่มใหม่ก็ได้" 🐱 เหมียวเชื่อว่าพรุ่งนี้จะดีขึ้น!`
  return `เดือนนี้หนักหน่อยนะคะ ${rate}% — ไม่เป็นไรเลย ถ้ายังหายใจอยู่ก็ยังเริ่มใหม่ได้ทุกวัน 🌟 ลองตั้ง habit ที่เล็กลงอีก 1-2 อย่างดูไหม?`
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

app.listen(PORT, () => {
  console.log(`🐱 MeowHabits AI Server running on http://localhost:${PORT}`)
})
