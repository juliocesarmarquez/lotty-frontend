'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface LemonContextType {
  isReady: boolean
  isLemonEnvironment: boolean
  sdk: any | null
}

const LemonContext = createContext<LemonContextType>({
  isReady: false,
  isLemonEnvironment: false,
  sdk: null,
})

export function useLemonContext() {
  return useContext(LemonContext)
}

export function LemonProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [isLemonEnvironment, setIsLemonEnvironment] = useState(false)
  const [sdk, setSdk] = useState<any>(null)

  useEffect(() => {
    async function loadSDK() {
      try {
        const lemonSDK = await import('@lemoncash/mini-app-sdk')
        const inWebView = lemonSDK.isWebView && lemonSDK.isWebView() === true
        setSdk(lemonSDK)
        setIsLemonEnvironment(inWebView)
      } catch (err) {
        console.log('Lemon SDK not available, running in standalone mode')
        setIsLemonEnvironment(false)
      } finally {
        setIsReady(true)
      }
    }

    loadSDK()
  }, [])

  return (
    <LemonContext.Provider value={{ isReady, isLemonEnvironment, sdk }}>
      {children}
    </LemonContext.Provider>
  )
}
