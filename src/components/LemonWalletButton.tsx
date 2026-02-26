'use client'

interface LemonWalletButtonProps {
  onConnect: () => void
  isConnecting: boolean
}

export default function LemonWalletButton({ onConnect, isConnecting }: LemonWalletButtonProps) {
  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="neo-button w-full flex items-center justify-center gap-2"
    >
      <span className="text-xl">🍋</span>
      <span>{isConnecting ? 'Connecting...' : 'Connect with Lemon'}</span>
    </button>
  )
}
