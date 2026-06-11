import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'

const catForms = [
  { level: 1, emoji: '🥚', name: 'Egg' },
  { level: 3, emoji: '🐣', name: 'Hatchling' },
  { level: 5, emoji: '🐱', name: 'Kitten' },
  { level: 10, emoji: '😸', name: 'Cat' },
  { level: 20, emoji: '😺', name: 'Happy Cat' },
  { level: 35, emoji: '🦁', name: 'Lion' },
  { level: 50, emoji: '🐯', name: 'Tiger' },
  { level: 75, emoji: '🦄', name: 'Legendary' },
  { level: 100, emoji: '🌟', name: 'Star' },
]

export function CatMascot({ level, xp, xpToNext, size = 80 }: { level: number; xp: number; xpToNext: number; size?: number }) {
  const { colors } = useTheme()
  const bounceAnim = useRef(new Animated.Value(0)).current

  const form = [...catForms].reverse().find((c) => level >= c.level) || catForms[0]
  const progress = Math.min(xp / xpToNext, 1)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounceAnim }] }]}>
      <View style={[styles.avatarCircle, { backgroundColor: colors.cardWarm, borderColor: colors.primary, borderWidth: 3 }]}>
        <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>{form.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.levelText, { color: colors.textSecondary }]}>Lv.{level} {form.name}</Text>
        <View style={[styles.xpBar, { backgroundColor: colors.border }]}>
          <View style={[styles.xpFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  emoji: { lineHeight: undefined },
  info: { alignItems: 'center', marginTop: spacing.sm },
  levelText: { fontSize: fontSize.xs, fontWeight: '700', marginBottom: 4 },
  xpBar: { width: 100, height: 10, borderRadius: 5, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 5 },
})
