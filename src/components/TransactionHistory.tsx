import { useWalletStore } from '@/lib/store'
import { ExternalLink } from 'lucide-react'

const TransactionHistory = () => {
  const { transactionHistory } = useWalletStore()

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm h-full">
      <h3 className="text-lg font-semibold mb-4 text-black">
        Transaction History
      </h3>
      <div className="text-black h-[calc(100%-2rem)] overflow-y-auto">
        {transactionHistory.length === 0 ? (
          <p className="text-gray-500">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactionHistory.map((tx) => (
              <div
                key={tx.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-sm">
                    {tx.type === 'cashback'
                      ? `Cashback: ${tx.amount} ${tx.tokenName}`
                      : `${tx.amount} ${tx.tokenName}`}
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        `https://eth-sepolia.blockscout.com/tx/${tx.txId}`,
                        '_blank',
                      )
                    }
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                  >
                    <ExternalLink size={12} />
                    View TX
                  </button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    From: {tx.sourceChainName} ({tx.sourceChainNumber})
                  </div>
                  <div>
                    To: {tx.destinationChainName} ({tx.destinationChainNumber})
                  </div>
                  <div>
                    Receiver: {tx.receiver.slice(0, 6)}...
                    {tx.receiver.slice(-4)}
                  </div>
                  <div className="text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory
