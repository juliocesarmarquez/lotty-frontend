'use client'

import { Trophy } from 'lucide-react'
import Image from 'next/image'

interface WinnersHistoryProps {
    t: (key: string, variables?: Record<string, string | number>) => string
}

export default function WinnersHistory({ t }: WinnersHistoryProps) {
    // Mock data for empty state, since backend/contract might not have winner history yet
    const winners: any[] = []

    return (
        <div className="space-y-4 pb-24">
            <div className="flex items-center gap-3">
                <Trophy size={28} className="text-primary-yellow stroke-[1.5px]" />
                <h2 className="font-display text-2xl font-bold">{t('winners.title')}</h2>
            </div>

            {winners.length === 0 ? (
                <div className="neo-card text-center py-10 mt-6">
                    <Image
                        src="/images/lottyCaja.webp"
                        alt="Empty Winners"
                        width={80}
                        height={80}
                        className="mx-auto mb-4 opacity-70"
                    />
                    <p className="font-display font-bold text-lg">{t('winners.no_history')}</p>
                    <p className="text-sm text-text-main/60 mt-2 max-w-[200px] mx-auto">
                        {t('winners.description')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* List of winners would go here */}
                </div>
            )}
        </div>
    )
}
