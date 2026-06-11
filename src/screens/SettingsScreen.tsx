import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'
import { changeLanguage } from '../i18n'
import { getXp } from '../db'
import { getRankProgress } from '../ranks'

export function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const { colors, isDark, toggleTheme, accentColor, setAccentColor } = useTheme()
  const insets = useSafeAreaInsets()
  const [notifications, setNotifications] = useState(false)
  const lang = i18n.language as 'th' | 'en'

  const [xp, setXp] = useState(0)
  useEffect(() => { getXp().then(setXp) }, [])

  const { currentRank, nextRank, progress } = getRankProgress(xp)

  const colors_palette = ['#FF8BA7', '#FFB347', '#6BCB77', '#74B9FF', '#C9A0DC', '#FF6B6B', '#A8E6CF', '#FFB5A7']

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.theme')}</Text>
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            {isDark ? '☾ ' + t('settings.dark') : '☀ ' + t('settings.light')}
          </Text>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.language')}</Text>
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => changeLanguage('th')}
            style={[styles.langBtn, { backgroundColor: lang === 'th' ? colors.primary : colors.border }]}
          >
            <Text style={{ color: lang === 'th' ? '#fff' : colors.text, fontWeight: '600' }}>{t('settings.thai')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={[styles.langBtn, { backgroundColor: lang === 'en' ? colors.primary : colors.border }]}
          >
            <Text style={{ color: lang === 'en' ? '#fff' : colors.text, fontWeight: '600' }}>{t('settings.english')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.rank')}</Text>
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {currentRank.emoji} {currentRank.title} — {xp} {t('settings.xp')}
            </Text>
            {nextRank && (
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                Next: {nextRank.emoji} {nextRank.title} ({Math.round((1 - progress) * (nextRank.xpRequired - currentRank.xpRequired))} XP to go)
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.accentColor')}</Text>
        <View style={[styles.colorRow, { backgroundColor: colors.card }]}>
          {colors_palette.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setAccentColor(c)}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: accentColor === c ? 3 : 0, borderColor: colors.text }]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.notifications')}</Text>
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.notificationTime')}: 07:00</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          MeowHabits {t('settings.version')} 1.0.0
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          🐱 Built with 💕
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: '700', paddingVertical: spacing.md },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  rowLabel: { fontSize: fontSize.md },
  langBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: spacing.xl },
  footerText: { fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.xs },
})
