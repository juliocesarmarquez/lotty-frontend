'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { getAddresses, getChainConfig, TICKET_PRICE } from '@/lib/constants'
import {
  ERC20_ABI,
  ATOKEN_ABI,
  AAVE_POOL_ABI,
  LOTTY_REGISTRY_ABI,
  DRAW_BUFFER_ABI,
  MOCK_RNG_ABI,
} from '@/lib/abis'

interface Balances {
  usdc: bigint
  aUsdc: bigint
}

interface UserPosition {
  depositedAmount: bigint
  currentABalance: bigint
  accruedYield: bigint
  tickets: bigint
  streak: bigint
  winProbabilityBps: bigint
  isActive: boolean
}

interface PoolStats {
  totalDeposits: bigint
  participantCount: bigint
  currentPrizePool: bigint
  timeUntilDraw: bigint
  estimatedWeeklyYield: bigint
  canDraw: boolean
  accumulatedYield: bigint
  isDrawPending: boolean
}

interface ContractState {
  balances: Balances
  position: UserPosition | null
  poolStats: PoolStats | null
  isLoading: boolean
  error: string | null
}

const DEFAULT_BALANCES: Balances = {
  usdc: 0n,
  aUsdc: 0n,
}

export function useContracts(
  walletAddress: string | null,
  signer: ethers.Signer | null,
  lemonExecuteContract?: (address: string, fn: string, params: string[], value?: string, contractStandard?: string) => Promise<any>,
  isLemon?: boolean,
) {
  const [state, setState] = useState<ContractState>({
    balances: DEFAULT_BALANCES,
    position: null,
    poolStats: null,
    isLoading: false,
    error: null,
  })

  const refreshInterval = useRef<NodeJS.Timeout | null>(null)
  const addresses = getAddresses()
  const chainConfig = getChainConfig()

  const getProvider = useCallback(() => {
    return new ethers.JsonRpcProvider(chainConfig.rpcUrl)
  }, [chainConfig.rpcUrl])

  // ============ Read Functions ============

  const fetchBalances = useCallback(async (address: string) => {
    const provider = getProvider()
    const usdc = new ethers.Contract(addresses.USDC, ERC20_ABI, provider)
    const aUsdcContract = new ethers.Contract(addresses.A_USDC, ATOKEN_ABI, provider)

    const [usdcBal, aUsdcBal] = await Promise.all([
      usdc.balanceOf(address),
      aUsdcContract.balanceOf(address),
    ])

    return { usdc: usdcBal, aUsdc: aUsdcBal }
  }, [getProvider, addresses])

  const fetchUserPosition = useCallback(async (address: string): Promise<UserPosition | null> => {
    const provider = getProvider()
    const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, provider)

    try {
      const result = await registry.getUserInfo(address)
      return {
        depositedAmount: result[0],
        currentABalance: result[1],
        accruedYield: result[2],
        tickets: result[3],
        streak: result[4],
        winProbabilityBps: result[5],
        isActive: result[6],
      }
    } catch {
      return null
    }
  }, [getProvider, addresses])

  const fetchPoolStats = useCallback(async (): Promise<PoolStats | null> => {
    const provider = getProvider()
    const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, provider)

    try {
      const [result, yieldAmount, drawPending] = await Promise.all([
        registry.getStats(),
        registry.getAccumulatedYield().catch(() => 0n),
        registry.isDrawPending().catch(() => false),
      ])
      return {
        totalDeposits: result[0],
        participantCount: result[1],
        currentPrizePool: result[2],
        timeUntilDraw: result[3],
        estimatedWeeklyYield: result[4],
        canDraw: result[5],
        accumulatedYield: yieldAmount,
        isDrawPending: drawPending,
      }
    } catch {
      return null
    }
  }, [getProvider, addresses])

  const refreshData = useCallback(async () => {
    if (!walletAddress) return

    try {
      const [balances, position, poolStats] = await Promise.all([
        fetchBalances(walletAddress),
        fetchUserPosition(walletAddress),
        fetchPoolStats(),
      ])

      setState(prev => ({
        ...prev,
        balances,
        position,
        poolStats,
        error: null,
      }))
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }))
    }
  }, [walletAddress, fetchBalances, fetchUserPosition, fetchPoolStats])

  // ============ Write Functions ============

  const register = useCallback(async (amount: bigint, onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    // Pre-validate USDC balance
    const balances = await fetchBalances(walletAddress)
    if (balances.usdc < amount) {
      throw new Error(`Insufficient USDC balance. You have ${Number(balances.usdc) / 1e6} USDC but need ${Number(amount) / 1e6} USDC. Get testnet USDC from the Aave faucet: app.aave.com/faucet/`)
    }

    // Helper to get actual aUSDC balance after Aave supply (compensates for rounding)
    const getAUsdcBalance = async (): Promise<bigint> => {
      const provider = getProvider()
      const aUsdcContract = new ethers.Contract(addresses.A_USDC, ATOKEN_ABI, provider)
      return aUsdcContract.balanceOf(walletAddress)
    }

    if (isLemon && lemonExecuteContract) {
      onProgress?.('Approving USDC for Aave...')
      await lemonExecuteContract(addresses.USDC, 'approve', [addresses.AAVE_POOL, amount.toString()], '0', 'ERC20')

      onProgress?.('Supplying to Aave...')
      await lemonExecuteContract(addresses.AAVE_POOL, 'supply', [addresses.USDC, amount.toString(), walletAddress, '0'])

      // Use actual aUSDC balance to handle Aave rounding
      const aUsdcBalance = await getAUsdcBalance()
      const registerAmount = aUsdcBalance < amount ? aUsdcBalance : amount

      onProgress?.('Approving aUSDC for Lotty...')
      await lemonExecuteContract(addresses.A_USDC, 'approve', [addresses.LOTTY_REGISTRY, registerAmount.toString()], '0', 'ERC20')

      onProgress?.('Registering in Lotty...')
      await lemonExecuteContract(addresses.LOTTY_REGISTRY, 'register', [registerAmount.toString()])
    } else if (signer) {
      onProgress?.('Approving USDC for Aave...')
      const usdc = new ethers.Contract(addresses.USDC, ERC20_ABI, signer)
      let tx = await usdc.approve(addresses.AAVE_POOL, amount)
      await tx.wait()

      onProgress?.('Supplying to Aave...')
      const aavePool = new ethers.Contract(addresses.AAVE_POOL, AAVE_POOL_ABI, signer)
      tx = await aavePool.supply(addresses.USDC, amount, walletAddress, 0)
      await tx.wait()

      // Use actual aUSDC balance to handle Aave rounding
      const aUsdcBalance = await getAUsdcBalance()
      const registerAmount = aUsdcBalance < amount ? aUsdcBalance : amount

      onProgress?.('Approving aUSDC for Lotty...')
      const aUsdc = new ethers.Contract(addresses.A_USDC, ATOKEN_ABI, signer)
      tx = await aUsdc.approve(addresses.LOTTY_REGISTRY, registerAmount)
      await tx.wait()

      onProgress?.('Registering in Lotty...')
      const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, signer)
      tx = await registry.register(registerAmount)
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, refreshData, fetchBalances, getProvider])

  const addToPosition = useCallback(async (amount: bigint, onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    // Pre-validate USDC balance
    const balances = await fetchBalances(walletAddress)
    if (balances.usdc < amount) {
      throw new Error(`Insufficient USDC balance. You have ${Number(balances.usdc) / 1e6} USDC but need ${Number(amount) / 1e6} USDC. Get testnet USDC from the Aave faucet: app.aave.com/faucet/`)
    }

    // Helper to get actual aUSDC balance after Aave supply
    const getAUsdcBalance = async (): Promise<bigint> => {
      const provider = getProvider()
      const aUsdcContract = new ethers.Contract(addresses.A_USDC, ATOKEN_ABI, provider)
      return aUsdcContract.balanceOf(walletAddress)
    }

    if (isLemon && lemonExecuteContract) {
      onProgress?.('Approving USDC for Aave...')
      await lemonExecuteContract(addresses.USDC, 'approve', [addresses.AAVE_POOL, amount.toString()], '0', 'ERC20')

      onProgress?.('Supplying to Aave...')
      await lemonExecuteContract(addresses.AAVE_POOL, 'supply', [addresses.USDC, amount.toString(), walletAddress, '0'])

      const aUsdcBalance = await getAUsdcBalance()
      const addAmount = aUsdcBalance < amount ? aUsdcBalance : amount

      onProgress?.('Approving aUSDC for Lotty...')
      await lemonExecuteContract(addresses.A_USDC, 'approve', [addresses.LOTTY_REGISTRY, addAmount.toString()], '0', 'ERC20')

      onProgress?.('Adding to position...')
      await lemonExecuteContract(addresses.LOTTY_REGISTRY, 'addToPosition', [addAmount.toString()])
    } else if (signer) {
      onProgress?.('Approving USDC for Aave...')
      const usdc = new ethers.Contract(addresses.USDC, ERC20_ABI, signer)
      let tx = await usdc.approve(addresses.AAVE_POOL, amount)
      await tx.wait()

      onProgress?.('Supplying to Aave...')
      const aavePool = new ethers.Contract(addresses.AAVE_POOL, AAVE_POOL_ABI, signer)
      tx = await aavePool.supply(addresses.USDC, amount, walletAddress, 0)
      await tx.wait()

      const aUsdcBalance = await getAUsdcBalance()
      const addAmount = aUsdcBalance < amount ? aUsdcBalance : amount

      onProgress?.('Approving aUSDC for Lotty...')
      const aUsdc = new ethers.Contract(addresses.A_USDC, ATOKEN_ABI, signer)
      tx = await aUsdc.approve(addresses.LOTTY_REGISTRY, addAmount)
      await tx.wait()

      onProgress?.('Adding to position...')
      const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, signer)
      tx = await registry.addToPosition(addAmount)
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, refreshData, fetchBalances, getProvider])

  const unregister = useCallback(async (onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    onProgress?.('Withdrawing from Lotty...')

    if (isLemon && lemonExecuteContract) {
      await lemonExecuteContract(addresses.LOTTY_REGISTRY, 'unregister', [])
    } else if (signer) {
      const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, signer)
      const tx = await registry.unregister()
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, refreshData])

  const claimPrize = useCallback(async (onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    onProgress?.('Claiming prize...')

    if (isLemon && lemonExecuteContract) {
      await lemonExecuteContract(addresses.LOTTY_REGISTRY, 'claimPrize', [])
    } else if (signer) {
      const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, signer)
      const tx = await registry.claimPrize()
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, refreshData])

  // ============ Draw Management ============

  const startDraw = useCallback(async (onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    onProgress?.('Starting draw...')

    if (isLemon && lemonExecuteContract) {
      await lemonExecuteContract(addresses.LOTTY_REGISTRY, 'startDraw', [])
    } else if (signer) {
      const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, signer)
      const tx = await registry.startDraw()
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, refreshData])

  const completeRNG = useCallback(async (onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    onProgress?.('Providing random number...')

    const provider = getProvider()
    const rng = new ethers.Contract(addresses.RNG_CHAINLINK, MOCK_RNG_ABI, provider)
    const lastRequestId = await rng.getLastRequestId()

    const randomWord = BigInt(Math.floor(Math.random() * 1e18)).toString()

    if (isLemon && lemonExecuteContract) {
      await lemonExecuteContract(addresses.RNG_CHAINLINK, 'completeRequest', [lastRequestId.toString(), randomWord])
    } else if (signer) {
      const rngSigner = new ethers.Contract(addresses.RNG_CHAINLINK, MOCK_RNG_ABI, signer)
      const tx = await rngSigner.completeRequest(lastRequestId, randomWord)
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, getProvider, refreshData])

  const completeDraw = useCallback(async (onProgress?: (step: string) => void) => {
    if (!walletAddress) throw new Error('No wallet')

    onProgress?.('Completing draw...')

    if (isLemon && lemonExecuteContract) {
      await lemonExecuteContract(addresses.LOTTY_REGISTRY, 'completeDraw', [])
    } else if (signer) {
      const registry = new ethers.Contract(addresses.LOTTY_REGISTRY, LOTTY_REGISTRY_ABI, signer)
      const tx = await registry.completeDraw()
      await tx.wait()
    }

    await refreshData()
  }, [walletAddress, isLemon, lemonExecuteContract, signer, addresses, refreshData])

  // ============ Auto-refresh ============

  useEffect(() => {
    if (walletAddress) {
      refreshData()
      refreshInterval.current = setInterval(refreshData, 30000)
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current)
      }
    }
  }, [walletAddress, refreshData])

  return {
    ...state,
    refreshData,
    register,
    addToPosition,
    unregister,
    claimPrize,
    startDraw,
    completeRNG,
    completeDraw,
  }
}
