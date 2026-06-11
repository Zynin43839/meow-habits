import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { getHabits, getLogsForDateRange } from '../db'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [habits, setHabits] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const loadData = useCallback(async () => {
    setHabits(await getHabits())
    setLogs(await getLogsForDateRange(startDate, endDate))
  }, [startDate, endDate])

  useEffect(() => { loadData() }, [loadData])

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const getDateStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayLogs = logs.filter((l: any) => l.date === dateStr)
    if (dayLogs.length === 0) return null
    const done = dayLogs.filter((l: any) => l.completed).length
    if (done === habits.length && habits.length > 0) return 'done'
    if (done > 0) return 'partial'
    return 'miss'
  }

  const isToday = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return d === today
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const selectedDayLogs = selectedDate ? logs.filter((l: any) => l.date === selectedDate) : []

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>{t('calendar.title')}</Text>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth}>
          <Text style={[styles.navArrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>
          {monthNames[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text style={[styles.navArrow, { color: colors.text }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.calendar, { backgroundColor: colors.card }]}>
        <View style={styles.weekRow}>
          {DAYS.map((d) => (
            <View key={d} style={styles.dayCell}>
              <Text style={[styles.dayName, { color: colors.textSecondary }]}>{d}</Text>
            </View>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const status = getDateStatus(day)
            const isSelected = selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                style={[styles.dayCell]}
              >
                <View style={[
                  styles.dayCircle,
                  isToday(day) && { borderColor: colors.primary, borderWidth: 2 },
                  status === 'done' && { backgroundColor: colors.calendarDone },
                  status === 'partial' && { backgroundColor: colors.accent },
                  status === 'miss' && { backgroundColor: colors.calendarMiss },
                  isSelected && !status && { backgroundColor: colors.border },
                ]}>
                  <Text style={[
                    styles.dayText,
                    { color: status ? '#fff' : colors.text },
                    isToday(day) && { color: colors.primary, fontWeight: '700' },
                  ]}>
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {selectedDate && (
        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          {selectedDayLogs.length === 0 ? (
            <Text style={[styles.noLogs, { color: colors.textSecondary }]}>No data for this day</Text>
          ) : (
            selectedDayLogs.map((log: any) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logEmoji}>{log.emoji}</Text>
                <Text style={[styles.logName, { color: colors.text }]}>{log.name}</Text>
                <Text style={{ color: log.completed ? colors.success : colors.danger }}>
                  {log.completed ? '✓' : '✗'}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.calendarDone }]} /><Text style={[styles.legendText, { color: colors.textSecondary }]}>All done</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.accent }]} /><Text style={[styles.legendText, { color: colors.textSecondary }]}>Partial</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.calendarMiss }]} /><Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed</Text></View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: '700', paddingVertical: spacing.md },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  navArrow: { fontSize: 36, fontWeight: '300', paddingHorizontal: spacing.md },
  monthText: { fontSize: fontSize.lg, fontWeight: '600' },
  calendar: { marginHorizontal: spacing.lg, borderRadius: borderRadius.lg, padding: spacing.md },
  weekRow: { flexDirection: 'row' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayName: { fontSize: fontSize.xs, fontWeight: '600' },
  dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: fontSize.sm },
  detailCard: { margin: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: 0 },
  detailTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm },
  noLogs: { fontSize: fontSize.sm, fontStyle: 'italic' },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  logEmoji: { fontSize: 18, marginRight: spacing.sm },
  logName: { flex: 1, fontSize: fontSize.sm },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, padding: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: fontSize.xs },
})
