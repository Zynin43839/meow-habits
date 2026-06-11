import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import { AppNavigator } from './src/navigation/AppNavigator'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import * as Font from 'expo-font'
import { Kanit_400Regular, Kanit_600SemiBold, Kanit_700Bold, Kanit_800ExtraBold } from '@expo-google-fonts/kanit'
import './src/i18n'

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = '* { font-family: Kanit_400Regular, sans-serif !important; }'
  document.head.appendChild(style)
}

function AppContent() {
  const { colors, isDark, fontLoaded } = useTheme()
  if (!fontLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 48 }}>🐱</Text>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: { fontFamily: 'Kanit_400Regular', fontWeight: '400' },
            medium: { fontFamily: 'Kanit_600SemiBold', fontWeight: '600' },
            bold: { fontFamily: 'Kanit_700Bold', fontWeight: '700' },
            heavy: { fontFamily: 'Kanit_800ExtraBold', fontWeight: '800' },
          },
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </>
  )
}

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false)

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({ Kanit_400Regular, Kanit_600SemiBold, Kanit_700Bold, Kanit_800ExtraBold })
      setFontLoaded(true)
    }
    loadFont()
  }, [])

  return (
    <SafeAreaProvider>
      <ThemeProvider fontLoaded={fontLoaded}>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
})
