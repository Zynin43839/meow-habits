import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize } from '../theme/spacing'
import { getRankProgress, RANKS } from '../ranks'

export function Secretary({ xp, size = 80 }: { xp: number; size?: number }) {
  const { colors, isDark } = useTheme()
  const bounceAnim = useRef(new Animated.Value(0)).current
  const { currentRank, nextRank, xpInRank, xpToNext, progress } = getRankProgress(xp)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounceAnim }] }]}>
      <View style={[styles.avatarCircle, { backgroundColor: colors.cardWarm, borderColor: colors.primary, borderWidth: 3 }]}>
        <Text style={styles.emoji}>{currentRank.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.rankText, { color: colors.primary }]}>{currentRank.emoji} {currentRank.title}</Text>
        <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>{xp} XP</Text>
        <View style={[styles.xpBar, { backgroundColor: colors.border }]}>
          <View style={[styles.xpFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
        </View>
        {nextRank && (
          <Text style={[styles.nextRank, { color: colors.textSecondary }]}>
            Next: {nextRank.emoji} {nextRank.title} ({xpToNext - xpInRank} XP)
          </Text>
        )}
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
  emoji: { fontSize: 36 },
  info: { alignItems: 'center', marginTop: spacing.xs },
  rankText: { fontSize: fontSize.sm, fontWeight: '800' },
  xpLabel: { fontSize: fontSize.xs, marginVertical: 2 },
  xpBar: { width: 100, height: 8, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },
  nextRank: { fontSize: fontSize.xs, marginTop: 2 },
})
