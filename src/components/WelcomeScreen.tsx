'use client'

import Image from 'next/image'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

interface WelcomeScreenProps {
  onConnect: () => void
  isConnecting: boolean
  hasMetaMask: boolean
  isLemonEnvironment: boolean
}

export default function WelcomeScreen({ onConnect, isConnecting, hasMetaMask, isLemonEnvironment }: WelcomeScreenProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-4">
          <Image
            src="/images/LottyBanner.webp"
            alt="Lotty"
            width={280}
            height={100}
            className="mx-auto"
            priority
          />
          <p className="text-text-main/70 text-lg font-display">{t('welcome.no_loss_lottery')}</p>
          <Image
            src="/images/mascot.png"
            alt="Lotty Mascot"
            width={160}
            height={160}
            className="mx-auto"
            priority
          />
        </div>

        <div className="neo-card space-y-3">
          <h2 className="font-display font-bold text-lg">{t('welcome.how_it_works')}</h2>
          <ul className="space-y-2 text-sm text-text-main/80">
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
              <span>{t('welcome.step1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
              <span>{t('welcome.step2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
              <span>{t('welcome.step3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
              <span>{t('welcome.step4')}</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="neo-button w-full text-center"
        >
          {isConnecting ? t('common.connecting') : isLemonEnvironment ? t('common.connect_lemon') : hasMetaMask ? t('common.connect_wallet') : t('common.install_metamask')}
        </button>
      </div>
    </div>
  )
}
