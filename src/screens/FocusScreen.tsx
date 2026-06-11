import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { getTasks, addTask, updateTask, deleteTask, getTasksForDate, saveFocusSession, getFocusSessions, addXp, getXp } from '../db'
import { XP_SOURCES } from '../ranks'

const WORK_MINUTES = 25
const BREAK_MINUTES = 5

type TimerMode = 'idle' | 'work' | 'break'

export function FocusScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const today = new Date().toISOString().split('T')[0]

  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [mode, setMode] = useState<TimerMode>('idle')
  const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60)
  const [workSessions, setWorkSessions] = useState(0)
  const [todaySessions, setTodaySessions] = useState<any[]>([])
  const [xp, setXp] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadData = useCallback(async () => {
    setTasks(await getTasksForDate(today))
    const sessions = await getFocusSessions(today, today)
    setTodaySessions(sessions)
    setXp(await getXp())
  }, [today])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const startTimer = (durationSec: number) => {
    clearTimer()
    setTimeLeft(durationSec)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearTimer(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const startWork = () => {
    setMode('work')
    startTimer(WORK_MINUTES * 60)
  }

  const startBreak = () => {
    setMode('break')
    startTimer(BREAK_MINUTES * 60)
  }

  const completeSession = async () => {
    clearTimer()
    const newCount = workSessions + 1
    setWorkSessions(newCount)

    await saveFocusSession({
      id: `focus_${Date.now()}`,
      date: today,
      workMinutes: WORK_MINUTES,
      completedWork: 1,
      totalFocusMinutes: WORK_MINUTES,
      timestamp: Date.now(),
    })

    const totalXp = await addXp(XP_SOURCES.FOCUS_SESSION)
    setXp(totalXp)
    setMode('idle')
    loadData()
  }

  const skipBreak = () => {
    clearTimer()
    setMode('idle')
  }

  const addTaskHandler = async () => {
    if (!newTask.trim()) return
    await addTask({
      id: `task_${Date.now()}`,
      title: newTask.trim(),
      date: today,
      completed: false,
      priority: 'medium',
      createdAt: Date.now(),
    })
    setNewTask('')
    loadData()
  }

  const toggleTask = async (task: any) => {
    await updateTask(task.id, { completed: !task.completed })
    if (!task.completed) {
      const totalXp = await addXp(XP_SOURCES.TASK_COMPLETE)
      setXp(totalXp)
    }
    loadData()
  }

  const deleteTaskHandler = (id: string) => {
    Alert.alert(t('common.delete'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { deleteTask(id); loadData() } },
    ])
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const totalFocusMinutes = todaySessions.reduce((sum, s) => sum + (s.totalFocusMinutes || 0), 0)

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>⏱️ {t('focus.title')}</Text>

      <View style={[styles.timerCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.timer, { color: mode === 'break' ? colors.success : colors.primary }]}>
          {formatTime(timeLeft)}
        </Text>
        <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
          {mode === 'idle' ? t('focus.ready') : mode === 'work' ? t('focus.focusing') : t('focus.resting')}
        </Text>
        <Text style={[styles.sessionCount, { color: colors.textSecondary }]}>
          {t('focus.sessionsToday')}: {todaySessions.length} ({totalFocusMinutes}m)
        </Text>

        <View style={styles.timerActions}>
          {mode === 'idle' && (
            <TouchableOpacity onPress={startWork} style={[styles.timerBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.timerBtnText}>{t('focus.start')}</Text>
            </TouchableOpacity>
          )}
          {mode === 'work' && (
            <TouchableOpacity onPress={completeSession} style={[styles.timerBtn, { backgroundColor: colors.success }]}>
              <Text style={styles.timerBtnText}>{t('focus.done')} ✓</Text>
            </TouchableOpacity>
          )}
          {mode === 'break' && (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity onPress={startWork} style={[styles.timerBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.timerBtnText}>{t('focus.nextSession')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={skipBreak} style={[styles.timerBtn, { backgroundColor: colors.border }]}>
                <Text style={[styles.timerBtnText, { color: colors.text }]}>{t('focus.skip')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.taskSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: spacing.lg }]}>📋 {t('focus.tasks')}</Text>
        <View style={[styles.inputRow, { paddingHorizontal: spacing.lg }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={newTask}
            onChangeText={setNewTask}
            placeholder={t('focus.addTask')}
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={addTaskHandler}
          />
          <TouchableOpacity onPress={addTaskHandler} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleTask(item)}
              onLongPress={() => deleteTaskHandler(item.id)}
              style={[styles.taskItem, { backgroundColor: colors.card }]}
            >
              <View style={[styles.checkbox, { borderColor: item.completed ? colors.success : colors.border, backgroundColor: item.completed ? colors.success : 'transparent' }]}>
                <Text style={styles.checkmark}>{item.completed ? '✓' : ''}</Text>
              </View>
              <Text style={[styles.taskText, { color: item.completed ? colors.textSecondary : colors.text }, item.completed && { textDecorationLine: 'line-through' }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: '700', paddingVertical: spacing.md },
  timerCard: { marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.lg },
  timer: { fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: fontSize.sm, marginTop: spacing.sm },
  sessionCount: { fontSize: fontSize.xs, marginTop: spacing.xs },
  timerActions: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm },
  timerBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  timerBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
  taskSection: { flex: 1 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: { flex: 1, borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.sm },
  addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },
  taskList: { paddingBottom: 100 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.md, gap: spacing.md },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  taskText: { fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
})
