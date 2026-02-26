export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet'

export const ADDRESSES = {
  testnet: {
    LOTTY_REGISTRY: '0x0796E141e8137b712DbA72eA1aC13d0Db39e9656',
    RNG_CHAINLINK: '0x6f669059c93E01f080883a628bBeEcDdE4AFfe5B',
    DRAW_BUFFER: '0x0A5bA22F67f27081C44F2226afc76DC5F66Dbd3C',
    AAVE_POOL: '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27',        // Aave V3 Pool (real, verified on BaseScan)
    USDC: '0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f',             // Aave testnet USDC — faucet: app.aave.com/faucet/
    A_USDC: '0x10F1A9D11CDf50041f3f8cB7191CBE2f31750ACC',           // Real aUSDC on Base Sepolia
    // NOTE: Circle USDC (0x036CbD53842c5426634e7929541eC2318f3dCF7e) is NOT compatible
    // with Aave V3 Pool on Base Sepolia — it has no reserve. To use Circle USDC,
    // switch to MockAavePool + MockAToken (see Deploy.s.sol for details).
  },
  mainnet: {
    LOTTY_REGISTRY: '', // TODO: Deploy to mainnet
    RNG_CHAINLINK: '',  // TODO: Deploy to mainnet
    DRAW_BUFFER: '',    // TODO: Deploy to mainnet
    AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    A_USDC: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB',
  },
} as const

export function getAddresses() {
  return ADDRESSES[NETWORK as keyof typeof ADDRESSES] || ADDRESSES.testnet
}

export const CHAIN_CONFIG = {
  testnet: {
    chainId: 84532,
    chainName: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
  },
  mainnet: {
    chainId: 8453,
    chainName: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
} as const

export function getChainConfig() {
  return CHAIN_CONFIG[NETWORK as keyof typeof CHAIN_CONFIG] || CHAIN_CONFIG.testnet
}

export const TICKET_PRICE = 10_000_000 // 10 USDC (6 decimals)
export const USDC_DECIMALS = 6

export const REWARD_TIERS = [
  { days: 0, apy: 8 },
  { days: 7, apy: 9 },
  { days: 30, apy: 10 },
  { days: 60, apy: 11 },
  { days: 100, apy: 12 },
  { days: 365, apy: 13 },
]

export function getAPYForStreak(streakDays: number): number {
  let apy = REWARD_TIERS[0].apy
  for (const tier of REWARD_TIERS) {
    if (streakDays >= tier.days) {
      apy = tier.apy
    }
  }
  return apy
}

export function getNextMilestone(streakDays: number): { days: number; apy: number } | null {
  for (const tier of REWARD_TIERS) {
    if (streakDays < tier.days) {
      return tier
    }
  }
  return null
}

export function formatUSDC(amount: bigint | number): string {
  const value = typeof amount === 'bigint' ? Number(amount) / 1e6 : amount / 1e6
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function parseUSDC(amount: number): bigint {
  return BigInt(Math.round(amount * 1e6))
}
