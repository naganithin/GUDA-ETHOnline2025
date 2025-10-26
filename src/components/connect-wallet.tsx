import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function WalletConnection() {
  const { status } = useAccount()

  return (
    <div
      className={cn(
        'max-w-md mx-auto p-4 flex items-center justify-center',
        status === 'connected' && 'hidden',
      )}
    >
      <ConnectButton />
    </div>
  )
}
