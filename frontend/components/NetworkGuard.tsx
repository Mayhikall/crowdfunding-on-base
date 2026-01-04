'use client'

import { ReactNode, useCallback, useState, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { Button } from '@/components/ui'

// Target chain - Base Sepolia
const TARGET_CHAIN_ID = baseSepolia.id // 84532

export interface NetworkGuardProps {
  children: ReactNode
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected, chain } = useAccount()
  const { switchChain, isPending, error: switchError } = useSwitchChain()
  const [mounted, setMounted] = useState(false)
  const [hasSwitchError, setHasSwitchError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSwitch = useCallback(() => {
    setHasSwitchError(false)
    switchChain(
      { chainId: TARGET_CHAIN_ID },
      {
        onError: () => {
          setHasSwitchError(true)
        }
      }
    )
  }, [switchChain])

  if (!mounted) return null

  // Check if on wrong network
  const isWrongNetwork = isConnected && chain?.id !== undefined && chain.id !== TARGET_CHAIN_ID

  // If correct chain or not connected, show content
  if (!isWrongNetwork) {
    return <>{children}</>
  }

  // Wrong network - show modal
  return (
    <>
      {children}
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Wrong Network</h2>
          <p className="mb-6 text-gray-600">
            Please switch to <strong className="text-[#4ECDC4]">Base Sepolia Testnet</strong> to use this app.
          </p>
          {(hasSwitchError || switchError) && (
            <p className="text-sm text-red-500 mb-4">
              {switchError?.message || 'Failed to switch. Please try manually in your wallet.'}
            </p>
          )}
          <Button
            onClick={handleSwitch}
            isLoading={isPending}
            className="w-full"
          >
            Switch to Base Sepolia
          </Button>
        </div>
      </div>
    </>
  )
}
