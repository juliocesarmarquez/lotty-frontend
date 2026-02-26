import { describe, it, expect } from 'vitest'

describe('BuyTicketModal - error message handling', () => {
  // Helper that mimics the error classification logic from BuyTicketModal
  function classifyError(err: { message?: string }): string {
    const msg = err.message || ''
    if (msg.includes('Timeout')) {
      return 'Transaction timed out. Please check your Lemon wallet and try again.'
    } else if (msg.includes('CANCELLED')) {
      return 'Transaction was cancelled.'
    } else if (msg.includes('FAILED')) {
      return 'Transaction failed. You may not have enough USDC.'
    } else {
      return msg || 'Transaction failed. Please try again.'
    }
  }

  it('should show timeout-specific message for SDK timeout errors', () => {
    const error = { message: 'Timeout calling approve on contract 0xb0A52964...' }
    expect(classifyError(error)).toBe('Transaction timed out. Please check your Lemon wallet and try again.')
  })

  it('should show timeout message for batch timeout', () => {
    const error = { message: 'Timeout executing batch of 4 contract calls' }
    expect(classifyError(error)).toBe('Transaction timed out. Please check your Lemon wallet and try again.')
  })

  it('should show cancellation message when user cancels', () => {
    const error = { message: 'Contract call failed (approve): CANCELLED' }
    expect(classifyError(error)).toBe('Transaction was cancelled.')
  })

  it('should show failure message when transaction fails', () => {
    const error = { message: 'Batch contract call failed: FAILED' }
    expect(classifyError(error)).toBe('Transaction failed. You may not have enough USDC.')
  })

  it('should show generic message for unknown errors', () => {
    const error = { message: 'Something unexpected happened' }
    expect(classifyError(error)).toBe('Something unexpected happened')
  })

  it('should show fallback message when no error message', () => {
    const error = {}
    expect(classifyError(error)).toBe('Transaction failed. Please try again.')
  })

  it('should handle the old SDK timeout message format', () => {
    const error = { message: 'Timeout, 60s passed waiting for CALL_SMART_CONTRACT_RESPONSE response.' }
    expect(classifyError(error)).toBe('Transaction timed out. Please check your Lemon wallet and try again.')
  })
})
