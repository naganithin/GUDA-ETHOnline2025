// src/lib/pyusd.ts
import { ethers } from 'ethers'
import { parseUnits } from 'viem'

const PYUSD_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
]

export const PYUSD_SEPOLIA_ADDRESS =
  '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'

  
export class PYUSDToken {
  private contract: ethers.Contract

  constructor(private signer: ethers.Signer) {
    this.contract = new ethers.Contract(
      PYUSD_SEPOLIA_ADDRESS,
      PYUSD_ABI,
      signer,
    )
  }

  async transfer(to: string, amount: string) {
    const amountWei = parseUnits(amount, 6)
    const tx = await this.contract.transfer(to, amountWei)
    console.log('[PYUSD] Tx hash:', tx.hash)
    return tx
  }

  async approve(spender: string, amount: string) {
    const amountWei = parseUnits(amount, 6)
    const tx = await this.contract.approve(spender, amountWei)
    console.log('[PYUSD] Tx hash:', tx.hash)
    return tx
  }
}

// Utility to create treasury signer for cashback
export function createTreasurySigner(
  provider: ethers.providers.Provider,
): ethers.Wallet {
  return new ethers.Wallet(TREASURY_PRIVATE_KEY, provider)
}

// Utility to create treasury PYUSD token instance
export function createTreasuryPYUSD(
  provider: ethers.providers.Provider,
): PYUSDToken {
  const treasurySigner = createTreasurySigner(provider)
  return new PYUSDToken(treasurySigner)
}
