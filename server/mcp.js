import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const API_BASE = 'http://localhost:3001'

const server = new Server(
  { name: 'meow-habits', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API_BASE}${path}`, opts)
  return res.json()
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'get_tasks', description: 'Get tasks for a specific date (YYYY-MM-DD)', inputSchema: { type: 'object', properties: { date: { type: 'string', description: 'Date in YYYY-MM-DD. Defaults to today' } } } },
    { name: 'add_task', description: 'Add a task', inputSchema: { type: 'object', properties: { title: { type: 'string', description: 'Task title' } }, required: ['title'] } },
    { name: 'complete_task', description: 'Mark a task as completed', inputSchema: { type: 'object', properties: { taskId: { type: 'string', description: 'Task ID' } }, required: ['taskId'] } },
    { name: 'get_habits', description: 'Get all habits', inputSchema: { type: 'object', properties: {} } },
    { name: 'add_habit', description: 'Add a new habit', inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Habit name' }, emoji: { type: 'string', description: 'Emoji icon' } }, required: ['name'] } },
    { name: 'log_habit', description: 'Mark a habit as done for today', inputSchema: { type: 'object', properties: { habitId: { type: 'string', description: 'Habit ID' } }, required: ['habitId'] } },
    { name: 'get_today_summary', description: "Get today's overview: habits, tasks, focus, XP", inputSchema: { type: 'object', properties: {} } },
    { name: 'get_rank', description: 'Get current secretary rank and XP', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_journal', description: 'Get journal entry for a date', inputSchema: { type: 'object', properties: { date: { type: 'string', description: 'Date in YYYY-MM-DD. Defaults to today' } } } },
    { name: 'save_journal', description: 'Save a journal entry for today', inputSchema: { type: 'object', properties: { note: { type: 'string', description: 'Journal text' }, mood: { type: 'number', description: 'Mood 1-5. Default: 3' }, gratitude: { type: 'string', description: 'Gratitude text' } }, required: ['note'] } },
    { name: 'ai_chat', description: 'Chat with the AI secretary', inputSchema: { type: 'object', properties: { message: { type: 'string', description: 'Your message or question' } }, required: ['message'] } },
    { name: 'log_focus', description: 'Log a completed focus session', inputSchema: { type: 'object', properties: { minutes: { type: 'number', description: 'Minutes focused. Default: 25' } } } },
    { name: 'get_focus_stats', description: 'Get focus stats for last N days', inputSchema: { type: 'object', properties: { days: { type: 'number', description: 'Days to look back. Default: 7' } } } },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const today = new Date().toISOString().split('T')[0]

  try {
    switch (name) {
      case 'get_tasks': {
        const date = args?.date || today
        const data = await api('GET', `/api/tasks?date=${date}`)
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
      case 'add_task': {
        const task = { id: `task_${Date.now()}`, title: args.title, date: today, completed: false, priority: 'medium', createdAt: Date.now() }
        await api('POST', '/api/tasks', task)
        return { content: [{ type: 'text', text: `✅ Added: "${task.title}"` }] }
      }
      case 'complete_task': {
        await api('POST', '/api/tasks/complete', { id: args.taskId })
        return { content: [{ type: 'text', text: '✅ Task done!' }] }
      }
      case 'get_habits': {
        const data = await api('GET', '/api/habits')
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
      case 'add_habit': {
        const habit = { id: `habit_${Date.now()}`, name: args.name, emoji: args?.emoji || '⭐', color: '#FF8BA7', frequency: 'daily', createdAt: Date.now() }
        await api('POST', '/api/habits', habit)
        return { content: [{ type: 'text', text: `✅ Habit added: "${habit.name}"` }] }
      }
      case 'log_habit': {
        await api('POST', '/api/habits/log', { habitId: args.habitId, date: today, completed: true })
        return { content: [{ type: 'text', text: '✅ Habit logged!' }] }
      }
      case 'get_today_summary': {
        const data = await api('GET', '/api/summary/today')
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
      case 'get_rank': {
        const data = await api('GET', '/api/rank')
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
      case 'get_journal': {
        const date = args?.date || today
        const data = await api('GET', `/api/journal/${date}`)
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
      case 'save_journal': {
        const entry = { date: today, mood: args?.mood ?? 3, note: args.note, gratitude: args?.gratitude || '' }
        await api('POST', '/api/journal', entry)
        return { content: [{ type: 'text', text: `✅ Journal saved for ${today}` }] }
      }
      case 'ai_chat': {
        const habits = await api('GET', '/api/habits')
        const summary = await api('GET', '/api/summary/today')
        const data = await api('POST', '/api/ai/insight', {
          habits: Array.isArray(habits) ? habits.map(h => ({ name: h.name, emoji: h.emoji })) : [],
          logsSummary: { totalDays: 30, totalDone: summary.doneHabits || 0, completionRate: summary.totalHabits ? Math.round((summary.doneHabits / summary.totalHabits) * 100) : 0 },
          question: args.message,
        })
        return { content: [{ type: 'text', text: data.reply || '🤖 No reply' }] }
      }
      case 'log_focus': {
        const session = { id: `focus_${Date.now()}`, date: today, workMinutes: args?.minutes || 25, completedWork: 1, totalFocusMinutes: args?.minutes || 25, timestamp: Date.now() }
        await api('POST', '/api/focus', session)
        return { content: [{ type: 'text', text: `✅ Focus: ${session.workMinutes}min` }] }
      }
      case 'get_focus_stats': {
        const days = args?.days || 7
        const data = await api('GET', `/api/focus/stats?days=${days}`)
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
console.error('🤖 MeowHabits MCP Server ready (stdio)')
