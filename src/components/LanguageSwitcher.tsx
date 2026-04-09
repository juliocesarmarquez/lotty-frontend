'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import { Globe } from 'lucide-react'

const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'pt', label: 'PT' }
] as const

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Safe visualization for SSR vs Client
    const displayLocale = mounted ? locale : 'es'

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-medium bg-card-white/80 border border-border-black/20 rounded-lg shadow-neo-sm hover:bg-primary-yellow/20 transition-colors"
            >
                <Globe size={14} className="text-text-main/70" />
                {displayLocale.toUpperCase()}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-24 bg-card-white border-2 border-border-black rounded-xl shadow-neo-sm overflow-hidden z-50">
                    {languages.map(({ code, label }) => (
                        <button
                            key={code}
                            onClick={() => {
                                setLocale(code)
                                setIsOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-display transition-colors hover:bg-primary-yellow/20 ${displayLocale === code ? 'bg-primary-yellow/10 font-bold' : ''
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
