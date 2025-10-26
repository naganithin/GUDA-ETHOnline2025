import { useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { useWalletStore } from '@/lib/store'
import { PYUSDToken } from '@/lib/pyusd'

export default function WalletSync() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { setWalletData, disconnectWallet } = useWalletStore()

  useEffect(() => {
    if (isConnected && address && walletClient) {
      // Convert wagmi walletClient to ethers provider and signer
      const provider = new ethers.providers.Web3Provider(walletClient.transport)
      const signer = provider.getSigner(address)
      const pyusdToken = new PYUSDToken(signer)

      setWalletData({
        address,
        provider,
        pyusdToken,
      })
    } else if (!isConnected) {
      disconnectWallet()
    }
  }, [isConnected, address, walletClient, setWalletData, disconnectWallet])

  return null // This component doesn't render anything
}
