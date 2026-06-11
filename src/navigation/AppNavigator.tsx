import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'
import { TodayScreen } from '../screens/TodayScreen'
import { HabitsScreen } from '../screens/HabitsScreen'
import { CalendarScreen } from '../screens/CalendarScreen'
import { StatsScreen } from '../screens/StatsScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

const Tab = createBottomTabNavigator()

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <React.Fragment>
      {React.createElement(require('react-native').Text, {
        style: { fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 },
      }, emoji)}
    </React.Fragment>
  )
}

export function AppNavigator() {
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: t('tabs.today'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarLabel: t('tabs.habits'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: t('tabs.calendar'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: t('tabs.stats'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}
