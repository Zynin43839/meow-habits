import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import { CustomTabBar } from '../components/CustomTabBar'
import { TodayScreen } from '../screens/TodayScreen'
import { FocusScreen } from '../screens/FocusScreen'
import { CalendarScreen } from '../screens/CalendarScreen'
import { JournalScreen } from '../screens/JournalScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

const Tab = createBottomTabNavigator()

export function AppNavigator() {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarLabel: t('tabs.today') }} />
      <Tab.Screen name="Focus" component={FocusScreen} options={{ tabBarLabel: t('tabs.focus') }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: t('tabs.calendar') }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarLabel: t('tabs.journal') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('tabs.settings') }} />
    </Tab.Navigator>
  )
}
