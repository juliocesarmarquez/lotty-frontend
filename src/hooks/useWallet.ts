'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { getChainConfig } from '@/lib/constants'

interface WalletState {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  })

  const hasMetaMask = typeof window !== 'undefined' && !!(window as any).ethereum

  const connect = useCallback(async () => {
    if (!hasMetaMask) {
      setState(prev => ({ ...prev, error: 'MetaMask not found' }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const ethereum = (window as any).ethereum
      const provider = new ethers.BrowserProvider(ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      sessionStorage.removeItem('lotty_disconnected')

      setState({
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
      })
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect',
      }))
    }
  }, [hasMetaMask])

  const disconnect = useCallback(() => {
    sessionStorage.setItem('lotty_disconnected', 'true')
    setState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    })
  }, [])

  const switchChain = useCallback(async () => {
    if (!hasMetaMask) return

    const config = getChainConfig()
    const chainIdHex = '0x' + config.chainId.toString(16)

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: config.chainName,
            rpcUrls: [config.rpcUrl],
            blockExplorerUrls: [config.blockExplorer],
          }],
        })
      }
    }
  }, [hasMetaMask])

  // Listen for account/chain changes
  useEffect(() => {
    if (!hasMetaMask) return

    const ethereum = (window as any).ethereum

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (state.isConnected) {
        setState(prev => ({ ...prev, address: accounts[0] }))
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged)
      ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [hasMetaMask, state.isConnected, disconnect])

  // Auto-reconnect (unless manually disconnected)
  useEffect(() => {
    if (!hasMetaMask) return
    if (sessionStorage.getItem('lotty_disconnected') === 'true') return

    const tryReconnect = async () => {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        })
        if (accounts.length > 0) {
          connect()
        }
      } catch {}
    }

    tryReconnect()
  }, [hasMetaMask, connect])

  return {
    ...state,
    hasMetaMask,
    connect,
    disconnect,
    switchChain,
  }
}
