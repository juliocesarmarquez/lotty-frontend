'use client'

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  icon?: string
}

export default function StatCard({ label, value, subValue, icon }: StatCardProps) {
  return (
    <div className="neo-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-main/60 font-display uppercase tracking-wide">{label}</p>
          <p className="text-xl font-display font-bold mt-1">{value}</p>
          {subValue && <p className="text-xs text-text-main/50 mt-0.5">{subValue}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  )
}
