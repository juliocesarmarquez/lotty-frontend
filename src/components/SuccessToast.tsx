'use client'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

interface SuccessToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function SuccessToast({ message, isVisible, onClose }: SuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="neo-card bg-green-100 border-green-600 flex items-center gap-3 max-w-lg mx-auto">
        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
        <p className="text-sm font-medium text-green-800">{message}</p>
      </div>
    </div>
  )
}
