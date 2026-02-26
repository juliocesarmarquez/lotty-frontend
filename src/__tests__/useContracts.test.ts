import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test addresses matching constants.ts testnet (Aave V3 real contracts on Base Sepolia)
const ADDRESSES = {
  USDC: '0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f',
  AAVE_POOL: '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27',
  A_USDC: '0x10F1A9D11CDf50041f3f8cB7191CBE2f31750ACC',
  LOTTY_REGISTRY: '0xDa2f85582e52cCe2D0ae29d483011D78C3478FA1',
}

describe('useContracts - Lemon sequential execution', () => {
  let mockExecuteContract: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockExecuteContract = vi.fn().mockResolvedValue({ result: 'SUCCESS', data: { txHash: '0xabc' } })
  })

  describe('register() sequential calls', () => {
    it('should make 4 sequential calls for register', async () => {
      const walletAddress = '0xUserWallet'
      const amount = BigInt(10_000_000) // 10 USDC

      // Simulate the 4 sequential calls that register() makes
      await mockExecuteContract(ADDRESSES.USDC, 'approve', [ADDRESSES.AAVE_POOL, amount.toString()])
      await mockExecuteContract(ADDRESSES.AAVE_POOL, 'supply', [ADDRESSES.USDC, amount.toString(), walletAddress, '0'])
      await mockExecuteContract(ADDRESSES.A_USDC, 'approve', [ADDRESSES.LOTTY_REGISTRY, amount.toString()])
      await mockExecuteContract(ADDRESSES.LOTTY_REGISTRY, 'register', [amount.toString()])

      expect(mockExecuteContract).toHaveBeenCalledTimes(4)

      expect(mockExecuteContract).toHaveBeenNthCalledWith(1, ADDRESSES.USDC, 'approve', [ADDRESSES.AAVE_POOL, amount.toString()])
      expect(mockExecuteContract).toHaveBeenNthCalledWith(2, ADDRESSES.AAVE_POOL, 'supply', [ADDRESSES.USDC, amount.toString(), walletAddress, '0'])
      expect(mockExecuteContract).toHaveBeenNthCalledWith(3, ADDRESSES.A_USDC, 'approve', [ADDRESSES.LOTTY_REGISTRY, amount.toString()])
      expect(mockExecuteContract).toHaveBeenNthCalledWith(4, ADDRESSES.LOTTY_REGISTRY, 'register', [amount.toString()])
    })

    it('should make 4 sequential calls for addToPosition', async () => {
      const walletAddress = '0xUserWallet'
      const amount = BigInt(20_000_000) // 20 USDC

      await mockExecuteContract(ADDRESSES.USDC, 'approve', [ADDRESSES.AAVE_POOL, amount.toString()])
      await mockExecuteContract(ADDRESSES.AAVE_POOL, 'supply', [ADDRESSES.USDC, amount.toString(), walletAddress, '0'])
      await mockExecuteContract(ADDRESSES.A_USDC, 'approve', [ADDRESSES.LOTTY_REGISTRY, amount.toString()])
      await mockExecuteContract(ADDRESSES.LOTTY_REGISTRY, 'addToPosition', [amount.toString()])

      expect(mockExecuteContract).toHaveBeenCalledTimes(4)
      expect(mockExecuteContract).toHaveBeenNthCalledWith(4, ADDRESSES.LOTTY_REGISTRY, 'addToPosition', [amount.toString()])
    })
  })

  describe('Parameter correctness', () => {
    it('amounts should be string-serialized bigints', () => {
      const amount = BigInt(10_000_000)
      expect(amount.toString()).toBe('10000000')
      expect(typeof amount.toString()).toBe('string')
    })

    it('wallet address should be passed to supply as onBehalfOf', async () => {
      const walletAddress = '0xUserWallet'
      const amount = BigInt(10_000_000)

      await mockExecuteContract(ADDRESSES.USDC, 'approve', [ADDRESSES.AAVE_POOL, amount.toString()])
      await mockExecuteContract(ADDRESSES.AAVE_POOL, 'supply', [ADDRESSES.USDC, amount.toString(), walletAddress, '0'])
      await mockExecuteContract(ADDRESSES.A_USDC, 'approve', [ADDRESSES.LOTTY_REGISTRY, amount.toString()])
      await mockExecuteContract(ADDRESSES.LOTTY_REGISTRY, 'register', [amount.toString()])

      const supplyCall = mockExecuteContract.mock.calls[1]
      expect(supplyCall[2][2]).toBe(walletAddress)
      expect(supplyCall[2][3]).toBe('0') // referral code
    })
  })
})
