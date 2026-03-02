'use client'

import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

interface DisconnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DisconnectModal({ isOpen, onClose, onConfirm }: DisconnectModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="neo-card max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t('profile.disconnectModal.title')}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-sm text-text-main/70">{t('profile.disconnectModal.body')}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 px-4 border-2 border-border-black rounded-xl font-display font-bold">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="flex-1 neo-button text-center">
            {t('common.disconnect')}
          </button>
        </div>
      </div>
    </div>
  )
}
