'use client'

import Image from 'next/image'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        <Image
          src="/images/mascot.png"
          alt="Lotty Mascot"
          width={120}
          height={120}
          className="mx-auto animate-bounce"
          priority
        />
        <Image
          src="/images/LottyBanner.webp"
          alt="Lotty"
          width={200}
          height={72}
          className="mx-auto"
          priority
        />
        <p className="text-text-main/70 font-display">Loading...</p>
      </div>
    </div>
  )
}
