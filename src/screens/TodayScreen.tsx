import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { Secretary } from '../components/Secretary'
import { HabitCard } from '../components/HabitCard'
import { Modal } from '../components/Modal'
import { EmptyState } from '../components/EmptyState'
import { getHabits, addHabit, updateHabit, deleteHabit, getLogsForDate, logHabit, getTasksForDate, addXp, getXp } from '../db'
import { XP_SOURCES } from '../ranks'
import { setOnMessage } from '../services/notifications'

export function TodayScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const today = new Date().toISOString().split('T')[0]

  const [habits, setHabits] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [xp, setXp] = useState(0)
  const [greeting, setGreeting] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [agentMessage, setAgentMessage] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [color, setColor] = useState('#FF8BA7')

  const loadData = useCallback(async () => {
    const allHabits = await getHabits()
    const todayLogs = await getLogsForDate(today)
    const todayTasks = await getTasksForDate(today)
    setHabits(allHabits)
    setLogs(todayLogs)
    setTasks(todayTasks)
    setXp(await getXp())

    const h = new Date().getHours()
    setGreeting(h < 12 ? t('today.goodMorning') : h < 18 ? t('today.goodAfternoon') : t('today.goodEvening'))
  }, [today, t])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    setOnMessage((msg) => setAgentMessage(msg.text))
  }, [])

  const toggleHabit = async (habitId: string, currentCompleted: boolean) => {
    await logHabit(habitId, today, !currentCompleted)
    if (!currentCompleted) {
      const newXp = await addXp(XP_SOURCES.HABIT_COMPLETE)
      setXp(newXp)
    }
    loadData()
  }

  const getStreak = (habitId: string) => {
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = d.toISOString().split('T')[0]
      const found = logs.find((l: any) => l.habitId === habitId && l.date === dateStr && l.completed)
      if (found) streak++
      else break
      d.setDate(d.getDate() - 1)
    }
    return streak
  }

  const openAdd = () => {
    setEditId(null); setName(''); setEmoji('⭐'); setColor('#FF8BA7')
    setModalVisible(true)
  }

  const openEdit = (habit: any) => {
    setEditId(habit.id); setName(habit.name); setEmoji(habit.emoji); setColor(habit.color)
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editId) {
      await updateHabit(editId, { name: name.trim(), emoji, color })
    } else {
      await addHabit({ id: `habit_${Date.now()}`, name: name.trim(), emoji, frequency: 'daily', customDays: [], createdAt: Date.now(), color })
    }
    setModalVisible(false)
    loadData()
  }

  const handleDelete = (id: string) => {
    Alert.alert('', '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteHabit(id); loadData() } },
    ])
  }

  const colors_palette = ['#FF8BA7', '#FFB347', '#6BCB77', '#74B9FF', '#C9A0DC', '#FF6B6B', '#A8E6CF', '#FFB5A7']

  const doneCount = logs.filter((l: any) => l.completed).length
  const totalCount = habits.length
  const incompleteTasks = tasks.filter((t: any) => !t.completed).length

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{t('today.title')}</Text>
        </View>
        <TouchableOpacity onPress={openAdd} style={[styles.addFab, { backgroundColor: colors.primary }]}>
          <Text style={styles.addFabText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={[styles.rankCard, { backgroundColor: colors.card }]}>
              <Secretary xp={xp} size={48} />
              <Text style={[styles.rankHint, { color: colors.textSecondary }]}>
                {incompleteTasks > 0 ? t('today.tasksDue', { count: incompleteTasks }) : t('today.noTasks')}
              </Text>
            </View>

            {agentMessage && (
              <TouchableOpacity
                onPress={() => setAgentMessage(null)}
                style={[styles.agentBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
              >
                <Text style={styles.agentEmoji}>🤖</Text>
                <Text style={[styles.agentText, { color: colors.text }]}>{agentMessage}</Text>
                <Text style={[styles.agentDismiss, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}

            <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {doneCount}/{totalCount} {t('today.done')}
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%', backgroundColor: colors.success }]} />
              </View>
            </View>
          </>
        }
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const log = logs.find((l: any) => l.habitId === item.id)
          const completed = log ? log.completed : false
          return (
            <HabitCard
              name={item.name}
              emoji={item.emoji}
              color={item.color}
              completed={completed}
              streak={getStreak(item.id)}
              onToggle={() => toggleHabit(item.id, completed)}
              onPress={() => openEdit(item)}
              onLongPress={() => handleDelete(item.id)}
            />
          )
        }}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editId ? t('habits.edit') : t('habits.add')}>
        <Text style={[styles.label, { color: colors.text }]}>{t('habits.name')}</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={name} onChangeText={setName} placeholder={t('habits.name')} placeholderTextColor={colors.textSecondary} />
        <Text style={[styles.label, { color: colors.text, marginTop: spacing.md }]}>{t('habits.emoji')}</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={emoji} onChangeText={setEmoji} maxLength={2} />
        <Text style={[styles.label, { color: colors.text, marginTop: spacing.md }]}>Color</Text>
        <View style={styles.colorRow}>
          {colors_palette.map((c) => (
            <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.text }]} />
          ))}
        </View>
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
            <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  greeting: { fontSize: fontSize.sm },
  title: { fontSize: fontSize.xl, fontWeight: '700' },
  addFab: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addFabText: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },
  rankCard: { alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginHorizontal: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.md },
  rankHint: { fontSize: fontSize.xs, marginTop: spacing.sm },
  agentBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, padding: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1,
    marginBottom: spacing.md, gap: spacing.sm,
  },
  agentEmoji: { fontSize: 20 },
  agentText: { flex: 1, fontSize: fontSize.sm, lineHeight: 18 },
  agentDismiss: { fontSize: 16, padding: spacing.xs },
  progressCard: { marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  progressText: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  list: { paddingBottom: 100 },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md },
  colorRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.lg },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  button: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  buttonText: { fontSize: fontSize.md, fontWeight: '600' },
})
