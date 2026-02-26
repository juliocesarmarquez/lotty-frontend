'use client'

import { useState, useCallback, useEffect } from 'react'
import { useLemonContext } from '@/providers/LemonProvider'

const BASE_SEPOLIA_CHAIN_ID = 84532

function createVisibilityAwareTimeout(ms: number, message: string): { promise: Promise<never>; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout>
  let remaining = ms
  let startTime = Date.now()
  let rejectFn: (err: Error) => void

  const promise = new Promise<never>((_, reject) => {
    rejectFn = reject
    timeoutId = setTimeout(() => reject(new Error(message)), remaining)
  })

  const onVisibilityChange = () => {
    if (document.hidden) {
      clearTimeout(timeoutId)
      remaining -= (Date.now() - startTime)
    } else {
      startTime = Date.now()
      timeoutId = setTimeout(() => rejectFn(new Error(message)), Math.max(remaining, 0))
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  const cancel = () => {
    clearTimeout(timeoutId)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return { promise, cancel }
}

interface ContractCall {
  contractAddress: string
  functionName: string
  functionParams: string[]
  value?: string
  contractStandard?: string
}

interface LemonSDKState {
  wallet: string | null
  isAuthenticated: boolean
  isAuthenticating: boolean
  error: string | null
}

export function useLemonSDK() {
  const { isReady, isLemonEnvironment, sdk } = useLemonContext()
  const [state, setState] = useState<LemonSDKState>({
    wallet: null,
    isAuthenticated: false,
    isAuthenticating: false,
    error: null,
  })

  const authenticate = useCallback(async () => {
    if (!sdk || !isLemonEnvironment) return

    setState(prev => ({ ...prev, isAuthenticating: true, error: null }))

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 10000)
      )

      const authPromise = sdk.authenticate({
        chainId: BASE_SEPOLIA_CHAIN_ID,
      })

      const result: any = await Promise.race([authPromise, timeoutPromise])

      if (result.result === 'SUCCESS') {
        setState({
          wallet: result.data.wallet,
          isAuthenticated: true,
          isAuthenticating: false,
          error: null,
        })
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticating: false,
          error: 'Authentication failed',
        }))
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: err.message || 'Authentication error',
      }))
    }
  }, [sdk, isLemonEnvironment])

  const executeContract = useCallback(async (
    contractAddress: string,
    functionName: string,
    functionParams: string[],
    value: string = '0',
    contractStandard?: string
  ) => {
    if (!sdk) throw new Error('SDK not available')

    const timeout = createVisibilityAwareTimeout(55000, `Timeout calling ${functionName} on contract ${contractAddress.slice(0, 10)}...`)

    try {
      const callPromise = sdk.callSmartContract({
        contracts: [{
          contractAddress,
          functionName,
          functionParams,
          value,
          chainId: BASE_SEPOLIA_CHAIN_ID,
          ...(contractStandard && { contractStandard }),
        }],
      })

      const result: any = await Promise.race([callPromise, timeout.promise])

      if (result.result !== 'SUCCESS') {
        const detail = result.error?.message || result.result
        throw new Error(`Contract call failed (${functionName}): ${detail}`)
      }

      return result
    } finally {
      timeout.cancel()
    }
  }, [sdk])

  const executeBatchContracts = useCallback(async (
    calls: ContractCall[],
  ) => {
    if (!sdk) throw new Error('SDK not available')

    const contracts = calls.map(call => ({
      contractAddress: call.contractAddress,
      functionName: call.functionName,
      functionParams: call.functionParams,
      value: call.value || '0',
      chainId: BASE_SEPOLIA_CHAIN_ID,
      ...(call.contractStandard && { contractStandard: call.contractStandard }),
    }))

    const timeout = createVisibilityAwareTimeout(55000, `Timeout executing batch of ${calls.length} contract calls`)

    try {
      const callPromise = sdk.callSmartContract({ contracts })

      const result: any = await Promise.race([callPromise, timeout.promise])

      if (result.result !== 'SUCCESS') {
        const detail = result.error?.message || result.result
        throw new Error(`Batch contract call failed: ${detail}`)
      }

      return result
    } finally {
      timeout.cancel()
    }
  }, [sdk])

  const depositFromLemon = useCallback(async (amount: string, tokenName: string) => {
    if (!sdk) throw new Error('SDK not available')

    const result = await sdk.deposit({
      amount,
      tokenName,
      chainId: BASE_SEPOLIA_CHAIN_ID,
    })

    if (result.result !== 'SUCCESS') {
      throw new Error(`Deposit failed: ${result.result}`)
    }

    return result
  }, [sdk])

  const withdrawToLemon = useCallback(async (amount: string, tokenName: string) => {
    if (!sdk) throw new Error('SDK not available')

    const result = await sdk.withdraw({
      amount,
      tokenName,
    })

    if (result.result !== 'SUCCESS') {
      throw new Error(`Withdraw failed: ${result.result}`)
    }

    return result
  }, [sdk])

  const reconnect = useCallback(async () => {
    setState(prev => ({ ...prev, isAuthenticated: false, wallet: null }))
    await authenticate()
  }, [authenticate])

  // Auto-authenticate when in Lemon WebView
  useEffect(() => {
    if (isReady && isLemonEnvironment && !state.isAuthenticated && !state.isAuthenticating) {
      authenticate()
    }
  }, [isReady, isLemonEnvironment, state.isAuthenticated, state.isAuthenticating, authenticate])

  return {
    ...state,
    isLemonEnvironment,
    isReady,
    authenticate,
    executeContract,
    executeBatchContracts,
    depositFromLemon,
    withdrawToLemon,
    reconnect,
  }
}
