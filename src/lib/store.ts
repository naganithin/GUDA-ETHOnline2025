// store.ts
import { create } from 'zustand'
import { ethers } from 'ethers'
import { PYTH_PRICE_IDS, PythPriceFeed } from './pyth'
import { PYUSDToken } from './pyusd'
import { fetchAllBalances } from './balanceFetcher'
import { parseUnits } from 'viem'

interface Transaction {
  id: string
  tokenName: string
  sourceChainName: string
  sourceChainNumber: number
  destinationChainName: string
  destinationChainNumber: number
  amount: string
  receiver: string
  txId: string
  timestamp: number
  type: 'transfer' | 'cashback'
}

interface WalletState {
  address: string | null
  isConnected: boolean
  balancesSepolia: Record<string, string> // Only non-zero balances from Sepolia
  balancesBaseSepolia: Record<string, string> // Only non-zero balances from Base Sepolia
  ethBalance: string // ETH balance on Sepolia
  ethBalanceBaseSepolia: string // ETH balance on Base Sepolia
  tokenPricesUSD: Record<string, number>
  provider: ethers.providers.Web3Provider | null
  pyusdToken: PYUSDToken | null
  transactionHistory: Transaction[]
  setWalletData: (data: {
    address: string
    provider: ethers.providers.Web3Provider
    pyusdToken: PYUSDToken
  }) => void
  disconnectWallet: () => void
  updateBalances: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  // New: Get raw balances (including zeros) for debugging
  rawBalancesSepolia: Record<string, string>
  rawBalancesBaseSepolia: Record<string, string>
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  isConnected: false,
  balancesSepolia: {}, // Only non-zero balances from Sepolia
  balancesBaseSepolia: {}, // Only non-zero balances from Base Sepolia
  ethBalance: '0',
  ethBalanceBaseSepolia: '0',
  rawBalancesSepolia: {}, // Raw balances for debugging
  rawBalancesBaseSepolia: {}, // Raw balances for debugging
  tokenPricesUSD: {},
  provider: null,
  pyusdToken: null,
  transactionHistory: [],

  setWalletData: ({ address, provider, pyusdToken }) => {
    set({ address, isConnected: true, provider, pyusdToken })
    get().updateBalances()
  },

  disconnectWallet: () => {
    set({
      address: null,
      isConnected: false,
      balancesSepolia: {},
      balancesBaseSepolia: {},
      ethBalance: '0',
      ethBalanceBaseSepolia: '0',
      rawBalancesSepolia: {},
      rawBalancesBaseSepolia: {},
      tokenPricesUSD: {},
      provider: null,
      pyusdToken: null,
      transactionHistory: [],
    })
  },

  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }
    set((state) => ({
      transactionHistory: [newTransaction, ...state.transactionHistory],
    }))
  },

  updateBalances: async () => {
    const { provider, address } = get()
    if (!provider || !address) return

    try {
      // 1. ETH balance on Sepolia
      const ethBalance = await provider.getBalance(address)
      const ethBalanceFormatted = ethers.utils.formatEther(ethBalance)

      // 2. ETH balance on Base Sepolia
      const baseSepoliaProvider = new ethers.providers.JsonRpcProvider(
        'https://sepolia.base.org',
      )
      const ethBalanceBaseSepoliaRaw =
        await baseSepoliaProvider.getBalance(address)
      const ethBalanceBaseSepoliaFormatted = ethers.utils.formatEther(
        ethBalanceBaseSepoliaRaw,
      )

      // 3. Token balances from Sepolia
      const balancesSepolia = await fetchAllBalances(address, 'sepolia')

      // 4. Token balances from Base Sepolia
      const balancesBaseSepolia = await fetchAllBalances(address, 'baseSepolia')

      // 4. Filter balances for Sepolia
      const filteredBalancesSepolia: Record<string, string> = {}
      Object.entries(balancesSepolia).forEach(([token, balance]) => {
        const balanceNum = parseFloat(balance || '0')
        // Only keep non-zero balances (with small tolerance for floating point)
        if (balanceNum > 0.0000001) {
          filteredBalancesSepolia[token] = balance
        }
      })

      // 5. Filter balances for Base Sepolia
      const filteredBalancesBaseSepolia: Record<string, string> = {}
      Object.entries(balancesBaseSepolia).forEach(([token, balance]) => {
        const balanceNum = parseFloat(balance || '0')
        // Only keep non-zero balances (with small tolerance for floating point)
        if (balanceNum > 0.0000001) {
          filteredBalancesBaseSepolia[token] = balance
        }
      })

      // 6. Fetch Pyth prices using dedicated JSON-RPC
      const pythProvider = new ethers.providers.JsonRpcProvider(
        'https://sepolia.rpc.thirdweb.com',
      )
      const pyth = new PythPriceFeed(pythProvider)

      const prices = await pyth.getMultiplePrices(Object.values(PYTH_PRICE_IDS))

      // Map token prices
      const tokenPricesUSD: Record<string, number> = {
        ETH: prices[PYTH_PRICE_IDS.ETH_USD]?.price || 2500,
        BTC: prices[PYTH_PRICE_IDS.BTC_USD]?.price || 65000,
        USDC: prices[PYTH_PRICE_IDS.USDC_USD]?.price || 1,
        PYUSD: prices[PYTH_PRICE_IDS.PYUSD_USD]?.price || 1,
      }

      set({
        ethBalance: ethBalanceFormatted.toString(),
        ethBalanceBaseSepolia: ethBalanceBaseSepoliaFormatted.toString(),
        balancesSepolia: filteredBalancesSepolia, // Only non-zero balances from Sepolia
        balancesBaseSepolia: filteredBalancesBaseSepolia, // Only non-zero balances from Base Sepolia
        rawBalancesSepolia: balancesSepolia, // Keep raw for debugging
        rawBalancesBaseSepolia: balancesBaseSepolia, // Keep raw for debugging
        tokenPricesUSD,
      })

      console.log('[STORE] ETH balance Sepolia:', ethBalanceFormatted)
      console.log(
        '[STORE] ETH balance Base Sepolia:',
        ethBalanceBaseSepoliaFormatted,
      )
      console.log('[STORE] Raw balances Sepolia:', balancesSepolia)
      console.log('[STORE] Raw balances Base Sepolia:', balancesBaseSepolia)
      console.log(
        '[STORE] Filtered balances Sepolia (non-zero only):',
        filteredBalancesSepolia,
      )
      console.log(
        '[STORE] Filtered balances Base Sepolia (non-zero only):',
        filteredBalancesBaseSepolia,
      )
      console.log('[STORE] Prices:', tokenPricesUSD)
    } catch (error) {
      console.error('[STORE] Failed to update balances:', error)
      set({
        ethBalance: '0',
        ethBalanceBaseSepolia: '0',
        balancesSepolia: {},
        balancesBaseSepolia: {},
        rawBalancesSepolia: {},
        rawBalancesBaseSepolia: {},
        tokenPricesUSD: {
          ETH: 2500,
          BTC: 65000,
          USDC: 1,
          PYUSD: 1,
        },
      })
    }
  },
}))
