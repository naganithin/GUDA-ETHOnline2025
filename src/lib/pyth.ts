// pyth.ts
import { ethers } from 'ethers'

// Define the ABI directly in the file (copied from IPyth.json)
const PythAbi = [
  // Paste the ABI array from @pythnetwork/pyth-sdk-solidity/abis/IPyth.json here
  // Example (partial, replace with full ABI):
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'getPriceUnsafe',
    outputs: [
      { internalType: 'int64', name: 'price', type: 'int64' },
      { internalType: 'uint64', name: 'conf', type: 'uint64' },
      { internalType: 'int32', name: 'expo', type: 'int32' },
      { internalType: 'uint256', name: 'publishTime', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // ... (add the rest of the ABI)
]

export class PythPriceFeed {
  private contract: ethers.Contract

  constructor(
    provider: ethers.providers.JsonRpcProvider,
    network: 'sepolia' = 'sepolia',
  ) {
    const contractAddresses = {
      sepolia: '0x26DD80569a8B23768A1d80869Ed7339e07595E85',
    }

    this.contract = new ethers.Contract(
      contractAddresses[network],
      PythAbi,
      provider,
    )
  }

  async getPrice(priceId: string): Promise<{
    price: number
    confidence: number
    expo: number
    timestamp: number
    isFresh: boolean
  }> {
    try {
      const [priceRaw, confRaw, expoRaw, timestampRaw] =
        await this.contract.getPriceUnsafe(priceId)

      const price = Number(priceRaw) * Math.pow(10, Number(expoRaw))
      const confidence = Number(confRaw) * Math.pow(10, Number(expoRaw))
      const isFresh = Date.now() / 1000 - Number(timestampRaw) < 60

      return {
        price,
        confidence,
        expo: Number(expoRaw),
        timestamp: Number(timestampRaw),
        isFresh,
      }
    } catch (error) {
      console.error(`[Pyth] Failed to fetch price for ${priceId}:`, error)
      return {
        price: 0,
        confidence: 0,
        expo: 0,
        timestamp: 0,
        isFresh: false,
      }
    }
  }

  async getMultiplePrices(priceIds: string[]) {
    const prices: Record<string, any> = {}
    for (const id of priceIds) {
      prices[id] = await this.getPrice(id)
    }
    return prices
  }
}

export const PYTH_PRICE_IDS = {
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  USDC_USD:
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  PYUSD_USD:
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
} as const
