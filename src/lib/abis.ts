export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
  'function transfer(address, uint256) returns (bool)',
]

export const ATOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
  'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
]

export const AAVE_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
]

export const LOTTY_REGISTRY_ABI = [
  'function TICKET_PRICE() view returns (uint256)',
  'function getUserInfo(address) view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)',
  'function getStats() view returns (uint256, uint256, uint256, uint256, uint256, bool)',
  'function getAntiWhaleEffect(address) view returns (uint256, uint256, uint256)',
  'function isDrawPending() view returns (bool)',
  'function register(uint256 amount)',
  'function addToPosition(uint256 amount)',
  'function unregister()',
  'function claimPrize()',
  'function startDraw() returns (uint256)',
  'function completeDraw()',
  'function getAccumulatedYield() view returns (uint256)',
]

export const DRAW_BUFFER_ABI = [
  'function getDraw(uint32) view returns (uint32, uint64, uint64, uint256)',
  'function getNewestDraw() view returns (uint32, uint64, uint64, uint256)',
  'function getDrawCount() view returns (uint16)',
]

export const MOCK_RNG_ABI = [
  'function requestRandomNumber() returns (uint32, uint32)',
  'function completeRequest(uint32 requestId, uint256 randomWord)',
  'function isRequestComplete(uint32) view returns (bool)',
  'function randomNumber(uint32) view returns (uint256)',
  'function getLastRequestId() view returns (uint32)',
]
