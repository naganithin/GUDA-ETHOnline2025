// src/lib/balanceFetcher.ts
const APIs = {
  sepolia: 'https://eth-sepolia.blockscout.com/api',
  baseSepolia: 'https://base-sepolia.blockscout.com/api',
}

export async function fetchAllBalances(
  address: string,
  chain: 'sepolia' | 'baseSepolia',
): Promise<Record<string, string>> {
  const apiBase = APIs[chain]
  const apiUrl = `${apiBase}?module=account&action=tokenlist&address=${address}`

  try {
    const res = await fetch(apiUrl)
    if (!res.ok)
      throw new Error(`Blockscout API error for ${chain}: ${res.status}`)

    const data = await res.json()

    if (data.status !== '1' || !Array.isArray(data.result)) {
      console.warn(`[Balances:${chain}] Unexpected API format:`, data)
      return {}
    }

    const balances: Record<string, string> = {}

    for (const token of data.result) {
      const symbol = token.symbol || 'UNKNOWN'
      const decimals = Number(token.decimals || 0)
      const balanceRaw = BigInt(token.balance || 0)

      const formatted =
        decimals > 0
          ? (Number(balanceRaw) / 10 ** decimals).toFixed(6)
          : balanceRaw.toString()

      // Prefix symbol with chain to disambiguate if needed
      balances[`${symbol}`] = formatted
    }

    console.log(`[Balances:${chain}] Parsed balances:`, balances)
    return balances
  } catch (error) {
    console.error(`[Balances:${chain}] Failed to fetch balances:`, error)
    return {}
  }
}
