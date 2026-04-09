'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import en from './en.json'
import es from './es.json'
import pt from './pt.json'

type Locale = 'en' | 'es' | 'pt'

export const translations = {
  en,
  es,
  pt,
} as const

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es') // Spanish as default
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('lotty_locale') as Locale
    if (saved && (saved === 'en' || saved === 'es' || saved === 'pt')) {
      setLocale(saved)
    } else {
      const browserLang = navigator.language.split('-')[0]
      if (['en', 'es', 'pt'].includes(browserLang)) {
        setLocale(browserLang as Locale)
      } else {
        setLocale('es')
      }
    }
    setMounted(true)
  }, [])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('lotty_locale', newLocale)
  }

  const t = (key: string, variables?: Record<string, string | number>): string => {
    // Before mounting, always return the translation for the default locale 'es' to match SSR
    const activeLocale = mounted ? locale : 'es'

    const keys = key.split('.')
    let current: any = translations[activeLocale]

    for (const k of keys) {
      if (current[k] === undefined) {
        let fbCurrent: any = translations['en']
        for (const fbk of keys) {
          if (fbCurrent[fbk] === undefined) return key
          fbCurrent = fbCurrent[fbk]
        }
        current = fbCurrent
        break
      }
      current = current[k]
    }

    let text = current as string
    if (variables) {
      Object.keys(variables).forEach(vKey => {
        text = text.replace(new RegExp(`{{${vKey}}}`, 'g'), String(variables[vKey]))
      })
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {mounted ? children : (
        <div style={{ visibility: 'hidden' }} suppressHydrationWarning>
          {children}
        </div>
      )}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    return {
      locale: 'en' as Locale,
      setLocale: () => { },
      t: (key: string, vars?: any) => key // Fallback string return
    }
  }
  return context
}
