import React, { useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'

const tabs = [
  { key: 'Today', emoji: '🏠', label: 'Today' },
  { key: 'Focus', emoji: '⏱️', label: 'Focus' },
  { key: 'Calendar', emoji: '📅', label: 'Calendar' },
  { key: 'Journal', emoji: '📓', label: 'Journal' },
  { key: 'Settings', emoji: '⚙️', label: 'Settings' },
]

function TabItem({ route, isFocused, onPress }: { route: any; isFocused: boolean; onPress: () => void }) {
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.85)).current
  const tab = tabs.find((t) => t.key === route.name) || tabs[0]

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0.85,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start()
  }, [isFocused])

  return (
    <TouchableOpacity onPress={onPress} style={styles.tab} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[styles.iconCircle, isFocused && { backgroundColor: `${colors.primary}25` }]}>
          <Text style={{ fontSize: isFocused ? 24 : 20 }}>{tab.emoji}</Text>
        </View>
      </Animated.View>
      <Text style={[
        styles.label,
        { color: isFocused ? colors.primary : colors.textSecondary },
        isFocused && { fontWeight: '800' },
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  )
}

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#FFF5F7', borderTopColor: colors.border }]}>
      {state.routes.map((route: any, index: number) => (
        <TabItem
          key={route.key}
          route={route}
          isFocused={state.index === index}
          onPress={() => {
            const event = navigation.emit({ type: 'tabPress', target: route.key })
            if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name)
          }}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {},
  label: { fontSize: 10, fontWeight: '600' },
})
