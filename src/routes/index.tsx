import { createFileRoute } from '@tanstack/react-router'
import { Activity } from 'lucide-react'
import Nexus from '@/components/nexus'
import WalletConnection from '@/components/connect-wallet'
import { useAccount } from 'wagmi'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { status } = useAccount()

  return (
    <div className="min-h-screen w-full flex flex-col">
      {status === 'connected' ? (
        <div className="flex-1 w-full">
          <Nexus />
          <div className="mb-80" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center">
          <Activity className="animate-pulse mb-4" size={48} />
          <WalletConnection />
        </div>
      )}
    </div>
  )
}
