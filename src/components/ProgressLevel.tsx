'use client'

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
    <div className="neo-card-yellow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-card-white border-3 border-border-black rounded-full flex flex-col items-center justify-center">
            <span className="font-display font-bold text-lg">{currentDays}d</span>
          </div>
          <div>
            <p className="text-xs font-display uppercase text-text-main/60">CURRENT</p>
            <span className="neo-card bg-card-white px-3 py-1 inline-block mt-1">
              <span className="font-display font-bold text-sm">{currentAPY}% APY</span>
            </span>
          </div>
        </div>
      </div>

      {nextMilestone && (
        <>
          <div className="w-full bg-card-white/50 border-2 border-border-black rounded-full h-3 mb-3">
            <div
              className="bg-text-main h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-display">
            <span>NEXT: {nextMilestone.days}d - {nextMilestone.apy}%</span>
          </div>
        </>
      )}
    </div>
  )
}
