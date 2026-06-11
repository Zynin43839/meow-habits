import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

const SERVER_URL = 'http://localhost:3001'
const POLL_INTERVAL = 300000 // 5 min

let pollTimer: ReturnType<typeof setInterval> | null = null
let onMessageCallback: ((msg: any) => void) | null = null

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export function setOnMessage(cb: (msg: any) => void) {
  onMessageCallback = cb
}

function showBrowserNotification(title: string, body: string) {
  if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  }
}

async function pollAgent() {
  try {
    const res = await fetch(`${SERVER_URL}/api/agent/messages`)
    if (!res.ok) return
    const data = await res.json()
    if (!data.messages?.length) return

    for (const msg of data.messages) {
      showBrowserNotification('🤖 Agent เหมียว', msg.text)
      onMessageCallback?.(msg)
    }

    // Mark as read
    const ids = data.messages.map((m: any) => m.id)
    await fetch(`${SERVER_URL}/api/agent/messages/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
  } catch {
    // Server offline — skip
  }
}

export function startPolling() {
  if (pollTimer) return
  pollTimer = setInterval(pollAgent, POLL_INTERVAL)
  pollAgent()
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}
