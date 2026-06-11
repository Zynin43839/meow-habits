import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { HabitCard } from '../components/HabitCard'
import { Modal } from '../components/Modal'
import { EmptyState } from '../components/EmptyState'
import { getHabits, addHabit, updateHabit, deleteHabit, getLogsForDateRange, logHabit } from '../db'

export function HabitsScreen() {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [habits, setHabits] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [color, setColor] = useState('#FF8BA7')

  const loadHabits = useCallback(async () => {
    setHabits(await getHabits())
  }, [])

  useEffect(() => { loadHabits() }, [loadHabits])

  const openAdd = () => {
    setEditId(null)
    setName('')
    setEmoji('⭐')
    setColor('#FF8BA7')
    setModalVisible(true)
  }

  const openEdit = (habit: any) => {
    setEditId(habit.id)
    setName(habit.name)
    setEmoji(habit.emoji)
    setColor(habit.color)
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editId) {
      await updateHabit(editId, { name: name.trim(), emoji, color })
    } else {
      await addHabit({
        id: `habit_${Date.now()}`,
        name: name.trim(),
        emoji,
        frequency: 'daily',
        customDays: [],
        createdAt: Date.now(),
        color,
      })
    }
    setModalVisible(false)
    loadHabits()
  }

  const handleDelete = (id: string) => {
    Alert.alert(t('habits.delete'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteHabit(id); loadHabits() } },
    ])
  }

  const colors_palette = ['#FF8BA7', '#FFB347', '#6BCB77', '#74B9FF', '#C9A0DC', '#FF6B6B', '#A8E6CF', '#FFB5A7']

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('habits.title')}</Text>
        <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <EmptyState emoji="🐱" message={t('habits.empty')} />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HabitCard
              name={item.name}
              emoji={item.emoji}
              color={item.color}
              onPress={() => openEdit(item)}
              onLongPress={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editId ? t('habits.edit') : t('habits.add')}>
        <Text style={[styles.label, { color: colors.text }]}>{t('habits.name')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={name}
          onChangeText={setName}
          placeholder={t('habits.name')}
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { color: colors.text, marginTop: spacing.md }]}>{t('habits.emoji')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={emoji}
          onChangeText={setEmoji}
          maxLength={2}
        />
        <Text style={[styles.label, { color: colors.text, marginTop: spacing.md }]}>Color</Text>
        <View style={styles.colorRow}>
          {colors_palette.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.text }]}
            />
          ))}
        </View>
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.button]}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700' },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },
  list: { paddingBottom: 100 },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  colorRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.lg },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  button: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  buttonText: { fontSize: fontSize.md, fontWeight: '600' },
})
