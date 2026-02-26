'use client'

import Image from 'next/image'

interface ProgressLevelProps {
  currentDays: number
  currentAPY: number
  nextMilestone: { days: number; apy: number } | null
}

export default function ProgressLevel({ currentDays, currentAPY, nextMilestone }: ProgressLevelProps) {
  const progress = nextMilestone
    ? Math.min(100, (currentDays / nextMilestone.days) * 100)
    : 100

  return (
    <div className="neo-card-yellow relative overflow-hidden">
      <Image
        src="/images/lottyPig.webp"
        alt=""
        width={48}
        height={48}
        className="absolute top-0 right-0"
      />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-20 h-14 bg-card-white border-3 border-border-black rounded-full flex items-center justify-center gap-1.5">
          <span className="font-display font-bold text-lg">{currentDays}d</span>
          <span className="text-xl leading-none">🔥</span>
        </div>
        <div>
          <p className="text-xs font-display uppercase text-text-main/60">CURRENT</p>
          <span className="neo-card bg-card-white px-3 py-1 inline-block mt-1">
            <span className="font-display font-bold text-sm">{currentAPY}% APY</span>
          </span>
        </div>
      </div>

      {nextMilestone && (
        <div className="w-full bg-card-white/50 border-2 border-border-black rounded-full h-3">
          <div
            className="bg-text-main h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
