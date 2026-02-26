'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface DrawCountdownProps {
  timeUntilDraw: bigint
  variant?: 'full' | 'compact'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeLeft(initialSeconds: number, startedAt: number): TimeLeft {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  const remaining = Math.max(0, initialSeconds - elapsed)

  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    total: remaining,
  }
}

function getNextSundayMidnightUTC(): Date {
  const now = new Date()
  const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7
  const nextSunday = new Date(now)
  nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
  nextSunday.setUTCHours(0, 0, 0, 0)
  return nextSunday
}

function formatLocalDrawTime(): string {
  const nextDraw = getNextSundayMidnightUTC()
  return nextDraw.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DrawCountdown({ timeUntilDraw, variant = 'full' }: DrawCountdownProps) {
  const initialSeconds = Number(timeUntilDraw)
  const [startedAt] = useState(() => Date.now())
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(initialSeconds, startedAt)
  )

  const updateTime = useCallback(() => {
    setTimeLeft(calculateTimeLeft(initialSeconds, startedAt))
  }, [initialSeconds, startedAt])

  useEffect(() => {
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [updateTime])

  const isUrgent = timeLeft.total > 0 && timeLeft.total <= 3600
  const isDrawReady = timeLeft.total <= 0

  if (isDrawReady) {
    if (variant === 'compact') {
      return (
        <div className="neo-card-yellow text-center py-3 animate-pulse">
          <p className="font-display font-bold text-lg">Draw available!</p>
        </div>
      )
    }

    return (
      <div className="neo-card-yellow text-center py-6 relative overflow-hidden animate-pulse">
        <Image
          src="/images/lottyRuleta.webp"
          alt=""
          width={64}
          height={64}
          className="absolute -right-2 -top-2 opacity-30"
        />
        <p className="text-sm font-display uppercase text-text-main/60">Weekly Draw</p>
        <p className="font-display text-3xl font-bold mt-2">Draw available!</p>
      </div>
    )
  }

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (variant === 'compact') {
    return (
      <div className={`neo-card-yellow text-center py-3 ${isUrgent ? 'animate-pulse' : ''}`}>
        <p className="text-xs font-display uppercase text-text-main/60 mb-1">Next Draw</p>
        <p className="font-display font-bold text-lg">
          {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
          <span>{pad(timeLeft.hours)}h </span>
          <span>{pad(timeLeft.minutes)}m </span>
          <span>{pad(timeLeft.seconds)}s</span>
        </p>
      </div>
    )
  }

  return (
    <div className={`neo-card-yellow text-center py-6 relative overflow-hidden ${isUrgent ? 'animate-pulse' : ''}`}>
      <Image
        src="/images/lottyRuleta.webp"
        alt=""
        width={64}
        height={64}
        className="absolute -right-2 -top-2 opacity-30"
      />
      <p className="text-sm font-display uppercase text-text-main/60">Next Draw In</p>
      <div className="flex items-center justify-center gap-3 mt-3">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <p className="font-display text-3xl font-bold">{timeLeft.days}</p>
            <p className="text-xs text-text-main/50 uppercase">days</p>
          </div>
        )}
        <div className="text-center">
          <p className="font-display text-3xl font-bold">{pad(timeLeft.hours)}</p>
          <p className="text-xs text-text-main/50 uppercase">hrs</p>
        </div>
        <span className="font-display text-2xl font-bold text-text-main/30">:</span>
        <div className="text-center">
          <p className="font-display text-3xl font-bold">{pad(timeLeft.minutes)}</p>
          <p className="text-xs text-text-main/50 uppercase">min</p>
        </div>
        <span className="font-display text-2xl font-bold text-text-main/30">:</span>
        <div className="text-center">
          <p className="font-display text-3xl font-bold">{pad(timeLeft.seconds)}</p>
          <p className="text-xs text-text-main/50 uppercase">sec</p>
        </div>
      </div>
      <p className="text-xs text-text-main/40 mt-3">{formatLocalDrawTime()}</p>
    </div>
  )
}
