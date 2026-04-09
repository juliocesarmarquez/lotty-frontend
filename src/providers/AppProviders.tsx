'use client'

import { ReactNode } from 'react'
import { LemonProvider } from './LemonProvider'
import { LanguageProvider } from '@/i18n/LanguageContext'

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <LemonProvider>
                {children}
            </LemonProvider>
        </LanguageProvider>
    )
}
