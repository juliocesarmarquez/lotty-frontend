'use client'

import { useState } from 'react'
import { Loader2, Play, Shuffle, Trophy } from 'lucide-react'

interface DrawManagerProps {
  canDraw: boolean
  isDrawPending: boolean
  onStartDraw: (onProgress?: (step: string) => void) => Promise<void>
  onCompleteRNG: (onProgress?: (step: string) => void) => Promise<void>
  onCompleteDraw: (onProgress?: (step: string) => void) => Promise<void>
}

export default function DrawManager({
  canDraw,
  isDrawPending,
  onStartDraw,
  onCompleteRNG,
  onCompleteDraw,
}: DrawManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<'start' | 'rng' | 'complete'>('start')

  if (!canDraw && !isDrawPending) return null

  const handleStartDraw = async () => {
    setIsProcessing(true)
    setError('')
    try {
      await onStartDraw((s) => setProgress(s))
      setStep('rng')
      setProgress('')
    } catch (err: any) {
      setError(err.message || 'Failed to start draw')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCompleteRNG = async () => {
    setIsProcessing(true)
    setError('')
    try {
      await onCompleteRNG((s) => setProgress(s))
      setStep('complete')
      setProgress('')
    } catch (err: any) {
      setError(err.message || 'Failed to provide random number')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCompleteDraw = async () => {
    setIsProcessing(true)
    setError('')
    try {
      await onCompleteDraw((s) => setProgress(s))
      setStep('start')
      setProgress('')
    } catch (err: any) {
      setError(err.message || 'Failed to complete draw')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentStep = isDrawPending ? (step === 'start' ? 'rng' : step) : 'start'

  return (
    <div className="neo-card space-y-3">
      <p className="font-display font-bold text-lg">Draw Manager</p>

      <div className="flex gap-1 mb-3">
        {['start', 'rng', 'complete'].map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              i <= ['start', 'rng', 'complete'].indexOf(currentStep)
                ? 'bg-yellow-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {currentStep === 'start' && canDraw && (
        <button
          onClick={handleStartDraw}
          disabled={isProcessing}
          className="neo-button w-full text-center flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          {isProcessing ? 'Starting...' : '1. Start Draw'}
        </button>
      )}

      {currentStep === 'rng' && (
        <button
          onClick={handleCompleteRNG}
          disabled={isProcessing}
          className="neo-button w-full text-center flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Shuffle size={16} />
          )}
          {isProcessing ? 'Generating...' : '2. Generate Random Number'}
        </button>
      )}

      {currentStep === 'complete' && (
        <button
          onClick={handleCompleteDraw}
          disabled={isProcessing}
          className="neo-button w-full text-center flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trophy size={16} />
          )}
          {isProcessing ? 'Completing...' : '3. Complete Draw & Pick Winner'}
        </button>
      )}

      {progress && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-text-main/70" />
          <p className="text-sm text-text-main/70">{progress}</p>
        </div>
      )}

      {error && (
        <div className="neo-card bg-red-50 border-red-300">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      <p className="text-xs text-text-main/50 text-center">
        {currentStep === 'start' && 'Draw is available. Start the draw process.'}
        {currentStep === 'rng' && 'Draw started. Generate random number for winner selection.'}
        {currentStep === 'complete' && 'Random number ready. Complete the draw to pick a winner.'}
      </p>
    </div>
  )
}
