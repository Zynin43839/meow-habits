import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native'
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
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start()
    onToggle?.()
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress || onToggle}
        style={[
          styles.card,
          {
            backgroundColor: completed ? `${color}15` : colors.card,
            borderColor: completed ? color : colors.border,
            borderWidth: 2,
          },
        ]}
        activeOpacity={0.8}
      >
        <View style={[styles.emojiCircle, { backgroundColor: `${color}20` }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[
            styles.name,
            { color: completed ? colors.textSecondary : colors.text },
            completed && { textDecorationLine: 'line-through' },
          ]}>
            {name}
          </Text>
          {streak !== undefined && (
            <View style={styles.streakRow}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakText, { color: streak > 0 ? colors.streakHigh : colors.textSecondary }]}>
                {streak} {streak === 1 ? 'วัน' : 'วัน'}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleToggle}
          style={[styles.checkBtn, { backgroundColor: completed ? color : colors.border }]}
        >
          <Text style={[styles.checkIcon, { color: completed ? '#fff' : colors.textSecondary }]}>
            {completed ? '✓' : '+'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingRight: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: 5,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  emoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '700' },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  streakEmoji: { fontSize: 12, marginRight: 3 },
  streakText: { fontSize: fontSize.xs, fontWeight: '600' },
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkIcon: { fontSize: 20, fontWeight: 'bold' },
})
