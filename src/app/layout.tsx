import type { Metadata } from 'next'
import { Inter, Chakra_Petch } from 'next/font/google'
import { LemonProvider } from '@/providers/LemonProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chakra-petch',
})

export const metadata: Metadata = {
  title: 'Lotty - No-Loss Lottery',
  description: 'Win prizes without losing your deposit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${chakraPetch.variable}`}>
      <body className="font-body bg-cream text-text-main min-h-screen">
        <LemonProvider>
          {children}
        </LemonProvider>
      </body>
    </html>
  )
}
