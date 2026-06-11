import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightTheme, darkTheme, AppTheme, ThemeColors } from './colors'

interface ThemeContextType {
  theme: AppTheme
  colors: ThemeColors
  isDark: boolean
  toggleTheme: () => void
  accentColor: string
  setAccentColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemScheme === 'dark')
  const [accentColor, setAccentColor] = useState('#FF8BA7')

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((mode) => {
      if (mode) setIsDark(mode === 'dark')
    })
    AsyncStorage.getItem('accent_color').then((color) => {
      if (color) setAccentColor(color)
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      AsyncStorage.setItem('theme_mode', next ? 'dark' : 'light')
      return next
    })
  }, [])

  const handleSetAccentColor = useCallback((color: string) => {
    setAccentColor(color)
    AsyncStorage.setItem('accent_color', color)
  }, [])

  const theme = (isDark ? darkTheme : lightTheme) as AppTheme
  const colors = theme.colors

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, accentColor, setAccentColor: handleSetAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
