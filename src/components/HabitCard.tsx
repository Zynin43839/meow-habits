import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'

interface HabitCardProps {
  name: string
  emoji: string
  color: string
  completed?: boolean
  streak?: number
  onPress?: () => void
  onToggle?: () => void
  onLongPress?: () => void
}

export function HabitCard({ name, emoji, color, completed, streak, onPress, onToggle, onLongPress }: HabitCardProps) {
  const { colors, isDark } = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress || onToggle}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: completed ? color : colors.border,
          borderWidth: completed ? 2 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text, textDecorationLine: completed ? 'line-through' : 'none' }]}>
          {name}
        </Text>
        {streak !== undefined && (
          <Text style={[styles.streak, { color: colors.textSecondary }]}>
            🔥 {streak} {streak === 1 ? 'วัน' : 'วัน'}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.check, { backgroundColor: completed ? color : colors.border }]}
      >
        <Text style={[styles.checkMark, { color: completed ? '#fff' : colors.textSecondary }]}>
          {completed ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: { fontSize: 28, marginRight: spacing.md },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '600' },
  streak: { fontSize: fontSize.xs, marginTop: 2 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { fontSize: 16, fontWeight: 'bold' },
})
