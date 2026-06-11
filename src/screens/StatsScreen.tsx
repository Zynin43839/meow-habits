import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { getHabits, getLogsForDateRange } from '../db'

function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function StatsScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [habits, setHabits] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  const { start, end } = getDateRange(30)
  const loadData = useCallback(async () => {
    setHabits(await getHabits())
    setLogs(await getLogsForDateRange(start, end))
  }, [start, end])

  useEffect(() => { loadData() }, [loadData])

  const totalCheckins = logs.filter((l: any) => l.completed).length
  const totalPossible = habits.length * 30
  const completionRate = totalPossible > 0 ? Math.round((totalCheckins / totalPossible) * 100) : 0

  const habitStats = habits.map((h) => {
    const habitLogs = logs.filter((l: any) => l.habitId === h.id)
    const done = habitLogs.filter((l: any) => l.completed).length
    const rate = habitLogs.length > 0 ? Math.round((done / habitLogs.length) * 100) : 0
    let streak = 0
    const d = new Date()
    for (let i = 0; i < 60; i++) {
      const dateStr = d.toISOString().split('T')[0]
      const found = logs.find((l: any) => l.habitId === h.id && l.date === dateStr && l.completed)
      if (found) streak++
      else break
      d.setDate(d.getDate() - 1)
    }
    return { ...h, done, rate, streak }
  })

  const bestHabit = habitStats.reduce((best, h) => h.rate > (best?.rate || 0) ? h : best, null as any)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>{t('stats.title')}</Text>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardValue, { color: colors.success }]}>{completionRate}%</Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('stats.completionRate')}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardValue, { color: colors.primary }]}>{totalCheckins}</Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('stats.totalCompletions')}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: spacing.lg }]}>Habit Breakdown</Text>
      {habitStats.map((h) => (
        <View key={h.id} style={[styles.habitRow, { backgroundColor: colors.card }]}>
          <Text style={styles.emoji}>{h.emoji}</Text>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitName, { color: colors.text }]}>{h.name}</Text>
            <View style={[styles.barBg, { backgroundColor: colors.border }]}>
              <View style={[styles.barFill, { width: `${h.rate}%`, backgroundColor: h.rate > 60 ? colors.success : h.rate > 30 ? colors.accent : colors.danger }]} />
            </View>
          </View>
          <View style={styles.habitStatsRight}>
            <Text style={[styles.habitRate, { color: colors.text }]}>{h.rate}%</Text>
            <Text style={[styles.habitStreak, { color: colors.textSecondary }]}>🔥{h.streak}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.aiCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 {t('stats.aiSchedule')}</Text>
        {logs.length < 7 ? (
          <Text style={[styles.aiText, { color: colors.textSecondary }]}>{t('stats.noData')}</Text>
        ) : (
          habitStats.filter((h) => h.done > 0).slice(0, 3).map((h) => (
            <View key={h.id} style={styles.aiRow}>
              <Text style={styles.aiEmoji}>{h.emoji}</Text>
              <Text style={[styles.aiSuggestion, { color: colors.text }]}>
                {t('stats.suggestion', { habit: h.name, time: 'morning (7-9 AM)' })}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: '700', paddingVertical: spacing.md },
  cardsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  card: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  cardValue: { fontSize: fontSize.xxl, fontWeight: '700' },
  cardLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm },
  habitRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.md },
  emoji: { fontSize: 24, marginRight: spacing.md },
  habitInfo: { flex: 1 },
  habitName: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  habitStatsRight: { alignItems: 'flex-end', marginLeft: spacing.md },
  habitRate: { fontSize: fontSize.md, fontWeight: '700' },
  habitStreak: { fontSize: fontSize.xs },
  aiCard: { margin: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: 100 },
  aiText: { fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },
  aiRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm },
  aiEmoji: { fontSize: 18, marginRight: spacing.sm },
  aiSuggestion: { flex: 1, fontSize: fontSize.sm, lineHeight: 20 },
})
