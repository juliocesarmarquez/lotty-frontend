'use client'

import { useState, useCallback } from 'react'
import { useLemonSDK } from './useLemonSDK'
import { getAddresses, TICKET_PRICE } from '@/lib/constants'

interface LottyState {
  isRegistered: boolean
  tickets: number
  streak: number
  totalPool: number
  weeklyPrize: number
  participantCount: number
  isLoading: boolean
}

const MOCK_STATE: LottyState = {
  isRegistered: false,
  tickets: 0,
  streak: 0,
  totalPool: 25000,
  weeklyPrize: 120,
  participantCount: 42,
  isLoading: false,
}

export function useLotty() {
  const { wallet, isAuthenticated, executeContract, isLemonEnvironment } = useLemonSDK()
  const [state, setState] = useState<LottyState>(MOCK_STATE)

  const addresses = getAddresses()

  const buyTickets = useCallback(async (quantity: number) => {
    const amount = BigInt(quantity) * BigInt(TICKET_PRICE)

    if (isAuthenticated && isLemonEnvironment && wallet) {
      const lastFn = !state.isRegistered ? 'register' : 'addToPosition'

      await executeContract(addresses.USDC, 'approve', [addresses.AAVE_POOL, amount.toString()], '0', 'ERC20')
      await executeContract(addresses.AAVE_POOL, 'supply', [addresses.USDC, amount.toString(), wallet, '0'])
      await executeContract(addresses.A_USDC, 'approve', [addresses.LOTTY_REGISTRY, amount.toString()], '0', 'ERC20')
      await executeContract(addresses.LOTTY_REGISTRY, lastFn, [amount.toString()])

      setState(prev => ({
        ...prev,
        isRegistered: true,
        tickets: prev.tickets + quantity,
      }))
    } else {
      // Mock mode
      setState(prev => ({
        ...prev,
        isRegistered: true,
        tickets: prev.tickets + quantity,
      }))
    }
  }, [isAuthenticated, isLemonEnvironment, wallet, executeContract, addresses, state.isRegistered])

  const withdraw = useCallback(async () => {
    if (isAuthenticated && isLemonEnvironment) {
      await executeContract(addresses.LOTTY_REGISTRY, 'unregister', [])
      setState(prev => ({
        ...prev,
        isRegistered: false,
        tickets: 0,
      }))
    } else {
      setState(prev => ({
        ...prev,
        isRegistered: false,
        tickets: 0,
      }))
    }
  }, [isAuthenticated, isLemonEnvironment, executeContract, addresses])

  return {
    ...state,
    wallet,
    isAuthenticated,
    isLemonEnvironment,
    buyTickets,
    withdraw,
  }
}
