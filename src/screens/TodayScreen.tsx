import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize } from '../theme/spacing'
import { CatMascot } from '../components/CatMascot'
import { HabitCard } from '../components/HabitCard'
import { getHabits, getLogsForDate, logHabit } from '../db'

export function TodayScreen() {
  const { t } = useTranslation()
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [habits, setHabits] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [xp, setXp] = useState(0)
  const today = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async () => {
    const allHabits = await getHabits()
    const todayLogs = await getLogsForDate(today)
    setHabits(allHabits)
    setLogs(todayLogs)
    const doneCount = todayLogs.filter((l: any) => l.completed).length
    const totalDone = todayLogs.length > 0 ? todayLogs.filter((l: any) => l.completed).length : 0
    setXp(totalDone * 10)
  }, [today])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleHabit = async (habitId: string, currentCompleted: boolean) => {
    await logHabit(habitId, today, !currentCompleted)
    loadData()
  }

  const getStreak = (habitId: string) => {
    const habitLogs = logs.filter((l: any) => l.habitId === habitId && l.habitId)
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

  const doneCount = logs.filter((l: any) => l.completed).length
  const totalCount = habits.length
  const greeting = new Date().getHours() < 12 ? t('today.goodMorning') : new Date().getHours() < 18 ? t('today.goodAfternoon') : t('today.goodEvening')

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{t('today.title')}</Text>
        </View>
        <CatMascot level={Math.floor(xp / 100) + 1} xp={xp % 100} xpToNext={100} size={48} />
      </View>

      <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {doneCount}/{totalCount} {t('today.done')}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%', backgroundColor: colors.success }]} />
        </View>
      </View>

      {doneCount === totalCount && totalCount > 0 ? (
        <View style={styles.allDone}>
          <Text style={[styles.allDoneText, { color: colors.text }]}>{t('today.allDone')}</Text>
        </View>
      ) : (
        <FlatList
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
              />
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: { fontSize: fontSize.sm },
  title: { fontSize: fontSize.xl, fontWeight: '700' },
  progressCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  progressText: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  list: { paddingBottom: 100 },
  allDone: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  allDoneText: { fontSize: fontSize.lg, fontWeight: '700' },
})
