'use client'

import Image from 'next/image'

interface WelcomeScreenProps {
  onConnect: () => void
  isConnecting: boolean
  hasMetaMask: boolean
  isLemonEnvironment: boolean
}

export default function WelcomeScreen({ onConnect, isConnecting, hasMetaMask, isLemonEnvironment }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
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
          <p className="text-text-main/70 text-lg font-display">No-Loss Lottery</p>
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
          <h2 className="font-display font-bold text-lg">How it works</h2>
          <ul className="space-y-2 text-sm text-text-main/80">
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
              <span>Deposit USDC to get lottery tickets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
              <span>Your deposit earns yield in Aave</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
              <span>Weekly draws — winner takes all yield</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-display font-bold text-primary-yellow bg-border-black w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
              <span>Withdraw anytime — never lose your deposit</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="neo-button w-full text-center"
        >
          {isConnecting ? 'Connecting...' : isLemonEnvironment ? 'Connect with Lemon' : hasMetaMask ? 'Connect Wallet' : 'Install MetaMask'}
        </button>
      </div>
    </div>
  )
}
