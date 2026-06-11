import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'

const catLevels = [
  { level: 1, emoji: '🐱', name: 'ลูกแมว' },
  { level: 5, emoji: '🐈', name: 'แมวน้อย' },
  { level: 10, emoji: '🐈‍⬛', name: 'แมวโต' },
  { level: 20, emoji: '🦁', name: 'สิงโต' },
  { level: 50, emoji: '🐯', name: 'เสือ' },
]

export function CatMascot({ level, xp, xpToNext, size = 60 }: { level: number; xp: number; xpToNext: number; size?: number }) {
  const { colors } = useTheme()
  const cat = [...catLevels].reverse().find((c) => level >= c.level) || catLevels[0]
  const progress = Math.min(xp / xpToNext, 1)

  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { fontSize: size }]}>{cat.emoji}</Text>
      <View style={[styles.xpBar, { backgroundColor: colors.border, borderRadius: borderRadius.sm }]}>
        <View style={[styles.xpFill, { width: `${progress * 100}%`, backgroundColor: colors.accent, borderRadius: borderRadius.sm }]} />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Lv.{level}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  emoji: { lineHeight: undefined },
  xpBar: { width: 120, height: 8, marginTop: spacing.xs, overflow: 'hidden' },
  xpFill: { height: '100%' },
  label: { fontSize: fontSize.xs, marginTop: 2 },
})
