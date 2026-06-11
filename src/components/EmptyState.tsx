import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize } from '../theme/spacing'

interface EmptyStateProps {
  emoji?: string
  message: string
}

export function EmptyState({ emoji = '📭', message }: EmptyStateProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  message: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 24 },
})
