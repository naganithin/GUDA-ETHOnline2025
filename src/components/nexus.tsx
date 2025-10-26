import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState } from 'react'
import { useWalletStore } from '@/lib/store'
import { DollarSign, Coins, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import InitButton from './init-button'
import { isInitialized, getUnifiedBalances } from '@/lib/nexus'
import TransferButton from './TransferButton'
import TransactionHistory from './TransactionHistory'

// PortfolioBalances, Chat, and History components remain unchanged
function PortfolioBalances() {
  const {
    address,
    isConnected,
    balancesSepolia,
    balancesBaseSepolia,
    ethBalance,
    ethBalanceBaseSepolia,
    tokenPricesUSD,
  } = useWalletStore()

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-gray-200 p-6 shadow-lg h-full flex flex-col justify-center items-center">
        <div className="text-center">
          <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-gray-800">
            Portfolio Balances
          </h3>
          <p className="text-gray-600">
            Please connect your wallet via the header.
          </p>
        </div>
      </div>
    )
  }

  // Combine assets from both networks, prefixing with network for uniqueness
  const assetsSepolia = Object.entries(balancesSepolia).map(
    ([token, balance]) => ({
      token,
      balance,
      network: 'Sepolia',
      valueUSD: parseFloat(balance) * (tokenPricesUSD[token] || 0),
    }),
  )

  const assetsBaseSepolia = Object.entries(balancesBaseSepolia).map(
    ([token, balance]) => ({
      token,
      balance,
      network: 'Base Sepolia',
      valueUSD: parseFloat(balance) * (tokenPricesUSD[token] || 0),
    }),
  )

  // Add ETH balances if > 0
  const ethAssets = []
  if (parseFloat(ethBalance) > 0) {
    ethAssets.push({
      token: 'ETH',
      balance: ethBalance,
      network: 'Sepolia',
      valueUSD: parseFloat(ethBalance) * (tokenPricesUSD.ETH || 0),
    })
  }
  if (parseFloat(ethBalanceBaseSepolia) > 0) {
    ethAssets.push({
      token: 'ETH',
      balance: ethBalanceBaseSepolia,
      network: 'Base Sepolia',
      valueUSD: parseFloat(ethBalanceBaseSepolia) * (tokenPricesUSD.ETH || 0),
    })
  }

  const allAssets = [
    ...assetsSepolia,
    ...assetsBaseSepolia,
    ...ethAssets,
  ].filter((asset) => asset.valueUSD > 0)

  const totalValue = allAssets.reduce((sum, asset) => sum + asset.valueUSD, 0)

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-lg h-full flex flex-col">
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-800">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-gray-600" />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Coins className="w-5 h-5 mr-2" />
        Asset Holdings
      </h3>

      {allAssets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">
            No assets with positive USD value found.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="overflow-y-auto max-h-full">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left text-sm font-semibold text-gray-600">
                  <th className="pb-2">Asset</th>
                  <th className="pb-2 text-right">Network</th>
                  <th className="pb-2 text-right">Balance</th>
                  <th className="pb-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {allAssets.map((asset) => (
                  <tr
                    key={`${asset.token}-${asset.network}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-xs">
                            {asset.token.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {asset.token}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {asset.network}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {parseFloat(asset.balance).toFixed(4)}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-800">
                      ${asset.valueUSD.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const Chat = () => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const balances = await getUnifiedBalances()
      const balancesText = JSON.stringify(balances, null, 2)

      const res = await fetch('https://api.asi1.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ASI1_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'asi1-mini',
          messages: [
            {
              role: 'user',
              content: `${userMessage}\n\nFull account details from getUnifiedBalances:\n${balancesText}`,
            },
          ],
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const assistantContent = data.choices[0].message.content

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantContent },
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-black">Chat</h3>

      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 text-blue-900 ml-8'
                : 'bg-gray-100 text-gray-900 mr-8'
            }`}
          >
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-gray-100 text-gray-900 mr-8">
            <p className="text-sm">Thinking...</p>
          </div>
        )}
      </div>

      {/* Input fixed at bottom */}
      <div className="mt-auto flex gap-2 pt-2 border-t border-gray-200">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}


const Nexus = () => {
  const [initialized, setInitialized] = useState(isInitialized())
  const { transactionHistory } = useWalletStore()

  if (!initialized) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <InitButton
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onReady={() => setInitialized(true)}
          />
        </div>
      </div>
    )
  }


  const totalCashback = transactionHistory
    .filter((tx) => tx.type === 'cashback')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="p-6 h-full">
        <Card className="border-none shadow-none w-full h-full">
          <CardContent className="h-full">
            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-3rem)]">
              {/* Left half: Portfolio + Actions + History */}
              <div className="grid gap-6 overflow-y-auto">
                <PortfolioBalances />

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm text-center transition-all hover:shadow-md">
                    <h3 className="text-base font-semibold mb-2 text-black">
                      Transfer Tokens
                    </h3>
                    <TransferButton />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm text-center transition-all hover:shadow-md">
                    <h3 className="text-base font-semibold mb-2 text-black">
                      Cashback Earned
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {totalCashback.toFixed(6)} PYUSD
                    </p>
                    <p className="text-lg text-gray-600">
                      ${totalCashback.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                <TransactionHistory />
              </div>

              {/* Right half: Chat full height */}
              <div className="h-full flex flex-col">
                <Chat />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default Nexus
