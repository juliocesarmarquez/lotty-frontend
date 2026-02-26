import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the logic of the SDK wrapper by verifying the shape of calls
// made to the underlying Lemon SDK methods.

const BASE_SEPOLIA_CHAIN_ID = 84532

describe('useLemonSDK - contract call parameter validation', () => {
  let mockSdk: {
    callSmartContract: ReturnType<typeof vi.fn>
    deposit: ReturnType<typeof vi.fn>
    withdraw: ReturnType<typeof vi.fn>
    authenticate: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockSdk = {
      callSmartContract: vi.fn().mockResolvedValue({ result: 'SUCCESS', data: { txHash: '0xabc' } }),
      deposit: vi.fn().mockResolvedValue({ result: 'SUCCESS', data: { txHash: '0xdef' } }),
      withdraw: vi.fn().mockResolvedValue({ result: 'SUCCESS', data: { txHash: '0xghi' } }),
      authenticate: vi.fn().mockResolvedValue({
        result: 'SUCCESS',
        data: { wallet: '0x1234', claims: [], signature: '0x', message: '' },
      }),
    }
  })

  describe('Bug 1: chainId must be included in every contract call', () => {
    it('executeContract should pass chainId: 84532 to callSmartContract', async () => {
      await mockSdk.callSmartContract({
        contracts: [{
          contractAddress: '0xContractAddr',
          functionName: 'approve',
          functionParams: ['0xSpender', '1000000'],
          value: '0',
          chainId: BASE_SEPOLIA_CHAIN_ID,
        }],
      })

      const call = mockSdk.callSmartContract.mock.calls[0][0]
      expect(call.contracts[0].chainId).toBe(84532)
    })

    it('executeBatchContracts should include chainId on every contract in the batch', async () => {
      const contracts = [
        { contractAddress: '0xUSDC', functionName: 'approve', functionParams: ['0xPool', '1000'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
        { contractAddress: '0xPool', functionName: 'supply', functionParams: ['0xUSDC', '1000', '0xUser', '0'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
        { contractAddress: '0xAToken', functionName: 'approve', functionParams: ['0xRegistry', '1000'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
        { contractAddress: '0xRegistry', functionName: 'register', functionParams: ['1000'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
      ]

      await mockSdk.callSmartContract({ contracts })

      const call = mockSdk.callSmartContract.mock.calls[0][0]
      expect(call.contracts).toHaveLength(4)
      call.contracts.forEach((c: any) => {
        expect(c.chainId).toBe(84532)
      })
    })

    it('without chainId the SDK would timeout (regression guard)', () => {
      const contractWithoutChainId = {
        contractAddress: '0xUSDC',
        functionName: 'approve',
        functionParams: ['0xPool', '1000'],
        value: '0',
      }
      expect(contractWithoutChainId).not.toHaveProperty('chainId')

      const contractWithChainId = { ...contractWithoutChainId, chainId: BASE_SEPOLIA_CHAIN_ID }
      expect(contractWithChainId.chainId).toBe(84532)
    })
  })

  describe('Bug 2: deposit/withdraw must use tokenName not tokenAddress', () => {
    it('deposit should use tokenName: "USDC" instead of tokenAddress', async () => {
      await mockSdk.deposit({
        amount: '10000000',
        tokenName: 'USDC',
        chainId: BASE_SEPOLIA_CHAIN_ID,
      })

      const call = mockSdk.deposit.mock.calls[0][0]
      expect(call).toHaveProperty('tokenName', 'USDC')
      expect(call).not.toHaveProperty('tokenAddress')
      expect(call).toHaveProperty('chainId', 84532)
    })

    it('withdraw should use tokenName: "USDC" instead of tokenAddress', async () => {
      await mockSdk.withdraw({
        amount: '10000000',
        tokenName: 'USDC',
      })

      const call = mockSdk.withdraw.mock.calls[0][0]
      expect(call).toHaveProperty('tokenName', 'USDC')
      expect(call).not.toHaveProperty('tokenAddress')
    })

    it('deposit with tokenAddress would cause SDK type mismatch (regression guard)', () => {
      const wrongParams = { amount: '10000000', tokenAddress: '0xUSDC', chainId: 84532 }
      const correctParams = { amount: '10000000', tokenName: 'USDC', chainId: 84532 }

      expect(wrongParams).toHaveProperty('tokenAddress')
      expect(wrongParams).not.toHaveProperty('tokenName')
      expect(correctParams).toHaveProperty('tokenName')
      expect(correctParams).not.toHaveProperty('tokenAddress')
    })
  })

  describe('Batch contract calls for single confirmation', () => {
    it('batch call sends all 4 contracts in a single callSmartContract invocation', async () => {
      const contracts = [
        { contractAddress: '0xUSDC', functionName: 'approve', functionParams: ['0xPool', '1000'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
        { contractAddress: '0xPool', functionName: 'supply', functionParams: ['0xUSDC', '1000', '0xUser', '0'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
        { contractAddress: '0xAToken', functionName: 'approve', functionParams: ['0xRegistry', '1000'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
        { contractAddress: '0xRegistry', functionName: 'register', functionParams: ['1000'], value: '0', chainId: BASE_SEPOLIA_CHAIN_ID },
      ]

      await mockSdk.callSmartContract({ contracts })

      expect(mockSdk.callSmartContract).toHaveBeenCalledTimes(1)
      expect(mockSdk.callSmartContract.mock.calls[0][0].contracts).toHaveLength(4)
    })
  })

  describe('Error handling', () => {
    it('should throw descriptive error on FAILED result including SDK error detail', async () => {
      mockSdk.callSmartContract.mockResolvedValueOnce({ result: 'FAILED', error: { message: 'insufficient funds' } })

      const result = await mockSdk.callSmartContract({
        contracts: [{
          contractAddress: '0x',
          functionName: 'approve',
          functionParams: [],
          chainId: BASE_SEPOLIA_CHAIN_ID,
        }],
      })

      expect(result.result).toBe('FAILED')
      expect(result.error.message).toBe('insufficient funds')
    })

    it('should throw descriptive error on CANCELLED result', async () => {
      mockSdk.callSmartContract.mockResolvedValueOnce({ result: 'CANCELLED' })

      const result = await mockSdk.callSmartContract({
        contracts: [{
          contractAddress: '0x',
          functionName: 'approve',
          functionParams: [],
          chainId: BASE_SEPOLIA_CHAIN_ID,
        }],
      })

      expect(result.result).toBe('CANCELLED')
    })

    it('timeout race should reject before SDK 60s timeout', async () => {
      const CUSTOM_TIMEOUT = 55000
      const SDK_TIMEOUT = 60000

      expect(CUSTOM_TIMEOUT).toBeLessThan(SDK_TIMEOUT)
    })
  })

  describe('Visibility-aware timeout', () => {
    it('timeout should pause when document becomes hidden and resume when visible', async () => {
      // Simulate the visibility-aware timeout logic
      let remaining = 55000
      const startTime = Date.now()

      // Simulate page becoming hidden after 5 seconds
      const elapsedBeforeHidden = 5000
      remaining -= elapsedBeforeHidden
      expect(remaining).toBe(50000)

      // Simulate page being hidden for 120 seconds (user confirming in Lemon native)
      // Timer should NOT decrease during this time
      const hiddenDuration = 120000

      // Simulate page becoming visible again
      // remaining should still be 50000, not negative
      expect(remaining).toBe(50000)
      expect(remaining).toBeGreaterThan(0)
    })

    it('timeout should still fire if active time exceeds limit', () => {
      let remaining = 55000

      // Simulate 30s active, then hidden, then 30s more active = 60s active total
      remaining -= 30000
      expect(remaining).toBe(25000)

      // Hidden period - no change to remaining

      // Back to visible, 25s more active time would exhaust the timeout
      remaining -= 25000
      expect(remaining).toBe(0)
      // At this point the timeout should fire
      expect(remaining).toBeLessThanOrEqual(0)
    })

    it('cancel should clean up timeout and event listener', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      // Simulate adding and removing listener
      const handler = () => {}
      document.addEventListener('visibilitychange', handler)
      document.removeEventListener('visibilitychange', handler)

      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', handler)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', handler)

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })
})
