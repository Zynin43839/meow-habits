import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import { CustomTabBar } from '../components/CustomTabBar'
import { TodayScreen } from '../screens/TodayScreen'
import { HabitsScreen } from '../screens/HabitsScreen'
import { CalendarScreen } from '../screens/CalendarScreen'
import { StatsScreen } from '../screens/StatsScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { useTheme } from '../theme/ThemeContext'

const Tab = createBottomTabNavigator()

export function AppNavigator() {
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarLabel: t('tabs.today') }} />
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ tabBarLabel: t('tabs.habits') }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: t('tabs.calendar') }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: t('tabs.stats') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('tabs.settings') }} />
    </Tab.Navigator>
  )
}
