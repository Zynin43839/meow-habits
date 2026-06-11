import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import { th } from './th'
import { en } from './en'

const detectLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem('app_language')
    if (saved) return saved
  } catch {}
  const locales = Localization.getLocales()
  const lang = locales[0]?.languageCode || 'en'
  return lang === 'th' ? 'th' : 'en'
}

detectLanguage().then((lng) => {
  i18n.use(initReactI18next).init({
    resources: { th, en },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  })
})

export const changeLanguage = async (lang: 'th' | 'en') => {
  await i18n.changeLanguage(lang)
  await AsyncStorage.setItem('app_language', lang)
}

export default i18n
