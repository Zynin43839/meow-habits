import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { getJournalEntry, saveJournalEntry, getHabits, getLogsForDateRange, addXp, getXp } from '../db'
import { XP_SOURCES, getRankProgress } from '../ranks'

const SERVER_URL = 'http://localhost:3001'

function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}

export function JournalScreen() {
  const { t } = useTranslation()
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const today = new Date().toISOString().split('T')[0]

  const [note, setNote] = useState('')
  const [mood, setMood] = useState(3)
  const [gratitude, setGratitude] = useState('')
  const [saved, setSaved] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [xp, setXp] = useState(0)

  const loadEntry = useCallback(async () => {
    const entry = await getJournalEntry(today)
    if (entry) {
      setNote(entry.note || '')
      setMood(entry.mood ?? 3)
      setGratitude(entry.gratitude || '')
      setSaved(true)
    }
    setXp(await getXp())
  }, [today])

  useEffect(() => { loadEntry() }, [loadEntry])

  const saveEntry = async () => {
    await saveJournalEntry({ date: today, mood, note: note.trim(), gratitude: gratitude.trim() })
    const newXp = await addXp(XP_SOURCES.JOURNAL_ENTRY)
    setXp(newXp)
    setSaved(true)
  }

  const moods = [
    { value: 1, emoji: '😢', label: t('journal.terrible') },
    { value: 2, emoji: '😕', label: t('journal.bad') },
    { value: 3, emoji: '😐', label: t('journal.okay') },
    { value: 4, emoji: '😊', label: t('journal.good') },
    { value: 5, emoji: '🤩', label: t('journal.amazing') },
  ]

  const askSecretary = async () => {
    if (!chatInput.trim()) return
    setChatLoading(true)
    setChatReply('')

    const habits = await getHabits()
    const { start, end } = getDateRange(30)
    const logs = await getLogsForDateRange(start, end)

    const totalCheckins = logs.filter((l: any) => l.completed).length
    const totalPossible = habits.length * 30
    const rate = totalPossible > 0 ? Math.round((totalCheckins / totalPossible) * 100) : 0

    try {
      const res = await fetch(`${SERVER_URL}/api/ai/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habits: habits.map((h: any) => ({ name: h.name, emoji: h.emoji, color: h.color })),
          logsSummary: { totalDays: 30, totalDone: totalCheckins, completionRate: rate },
          question: chatInput,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setChatReply(data.reply)
      } else {
        setChatReply(t('journal.aiError'))
      }
    } catch {
      setChatReply(t('journal.aiError'))
    }

    setChatLoading(false)
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>📓 {t('journal.title')}</Text>

        {/* Mood */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>{t('journal.howFeel')}</Text>
          <View style={styles.moodRow}>
            {moods.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setMood(m.value)}
                style={[styles.moodBtn, { backgroundColor: mood === m.value ? colors.primary + '20' : 'transparent', borderColor: mood === m.value ? colors.primary : colors.border }]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>{t('journal.note')}</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={note}
            onChangeText={(v) => { setNote(v); setSaved(false) }}
            placeholder={t('journal.notePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Gratitude */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>{t('journal.gratitude')}</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={gratitude}
            onChangeText={(v) => { setGratitude(v); setSaved(false) }}
            placeholder={t('journal.gratitudePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={saveEntry}
          style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary }]}
        >
          <Text style={styles.saveBtnText}>{saved ? '✓ ' + t('journal.saved') : t('journal.save')}</Text>
        </TouchableOpacity>

        {/* AI Secretary */}
        <View style={[styles.aiCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>🤖 {t('journal.askSecretary')}</Text>

          {chatLoading ? (
            <Text style={[styles.aiReply, { color: colors.textSecondary }]}>{t('journal.aiLoading')}</Text>
          ) : chatReply ? (
            <Text style={[styles.aiReply, { color: colors.text }]}>{chatReply}</Text>
          ) : null}

          <View style={styles.chatInputRow}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder={t('journal.chatPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={askSecretary}
            />
            <TouchableOpacity onPress={askSecretary} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rank */}
        <View style={[styles.rankCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>🏆 {t('journal.yourRank')}</Text>
          <Text style={[styles.rankDisplay, { color: colors.primary }]}>
            {getRankProgress(xp).currentRank.emoji} {getRankProgress(xp).currentRank.title} — {xp} XP
          </Text>
          <Text style={[styles.rankHint, { color: colors.textSecondary }]}>
            {t('journal.rankHint')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  title: { fontSize: fontSize.xl, fontWeight: '700', paddingVertical: spacing.md },
  card: { marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  cardLabel: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1 },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: fontSize.xs, marginTop: 2 },
  textArea: { borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.sm, minHeight: 80 },
  saveBtn: { marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.md },
  saveBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
  aiCard: { marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  aiReply: { fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.sm, fontStyle: 'italic' },
  chatInputRow: { flexDirection: 'row', gap: spacing.sm },
  chatInput: { flex: 1, borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.sm },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontSize: 18 },
  rankCard: { marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  rankDisplay: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  rankHint: { fontSize: fontSize.xs },
})
