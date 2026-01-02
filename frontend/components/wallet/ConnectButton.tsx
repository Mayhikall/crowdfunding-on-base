'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { formatAddress } from '@/lib/utils'
import { Button } from '@/components/ui'

export function ConnectButton() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="faucet" size="sm">
        Connect
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
        <div className="px-2 md:px-3 py-1 bg-[#FFE66D] border-2 border-black font-bold text-xs md:text-sm">
          {balance ? `${(Number(balance.value) / 1e18).toFixed(4)} ${balance.symbol}` : '...'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="group text-xs md:text-sm"
        >
          <span className="group-hover:hidden">{formatAddress(address)}</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="faucet"
      size="sm"
      onClick={() => connect({ connector: connectors[0] })}
      isLoading={isPending}
      className="text-xs md:text-sm whitespace-nowrap"
    >
      Connect Wallet
    </Button>
  )
}
