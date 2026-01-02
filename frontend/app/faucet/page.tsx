'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Button, Card, CardContent } from '@/components/ui'
import { SEDULUR_TOKEN_ADDRESS, SEDULUR_TOKEN_ABI } from '@/lib/contracts'
import { formatSDT } from '@/lib/utils'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

export default function FaucetPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [addTokenStatus, setAddTokenStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: SEDULUR_TOKEN_ADDRESS,
    abi: SEDULUR_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { 
    writeContract, 
    data: hash, 
    isPending, 
    error: writeError,
    reset 
  } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleClaim = () => {
    reset()
    writeContract({
      address: SEDULUR_TOKEN_ADDRESS,
      abi: SEDULUR_TOKEN_ABI,
      functionName: 'claimFaucet',
    })
  }

  const handleAddToken = async () => {
    if (!walletClient) {
      setAddTokenStatus('error')
      return
    }
    
    try {
      const wasAdded = await walletClient.watchAsset({
        type: 'ERC20',
        options: {
          address: SEDULUR_TOKEN_ADDRESS,
          symbol: 'SDT',
          decimals: 18,
          image: '',
        },
      })
      
      if (wasAdded) {
        setAddTokenStatus('success')
      }
    } catch (err) {
      console.error('Failed to add token:', err)
      setAddTokenStatus('error')
    }
  }

  useEffect(() => {
    if (isSuccess) {
      refetchBalance()
    }
  }, [isSuccess, refetchBalance])

  const getErrorMessage = () => {
    if (!writeError) return null
    const msg = writeError.message || 'Unknown error'
    
    if (msg.includes('CooldownNotExpired') || msg.includes('Cooldown')) {
      return 'Cooldown not expired. You can only claim once every 24 hours.'
    }
    if (msg.includes('User rejected') || msg.includes('user rejected')) {
      return 'Transaction was rejected by user.'
    }
    if (msg.includes('insufficient funds')) {
      return 'Insufficient ETH for gas. Get some Base Sepolia ETH first.'
    }
    
    return 'Transaction failed. Please try again.'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-3xl md:text-4xl font-black uppercase mb-2">Token Faucet</h1>
      <p className="text-gray-600 mb-8">Claim free SDT tokens every 24 hours</p>

      {/* Main Card */}
      <Card className="mb-6 bg-[#FFE66D]">
        <CardContent className="text-center py-6 md:py-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-[#4ECDC4] border-4 border-black mx-auto mb-4 flex items-center justify-center">
            <span className="text-xl md:text-2xl font-black">SDT</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-2">Sedulur Token</h2>
          <p className="text-base md:text-lg mb-4">
            Get <span className="font-bold">100 SDT</span> free for donations
          </p>

          {isConnected ? (
            <>
              {/* Balance */}
              <div className="mb-6 p-4 bg-white border-4 border-black">
                <p className="text-sm uppercase font-bold text-gray-500">Your Balance</p>
                <p className="text-2xl md:text-3xl font-black">
                  {balance !== undefined ? formatSDT(balance as bigint) : '0 SDT'}
                </p>
              </div>

              {/* Claim Button */}
              <Button
                variant="donate"
                size="lg"
                onClick={handleClaim}
                isLoading={isPending || isConfirming}
                className="w-full mb-4"
                disabled={isPending || isConfirming}
              >
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : 'Claim 100 SDT'}
              </Button>

              {/* Add Token to Wallet Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToken}
                className="w-full"
              >
                {addTokenStatus === 'success' ? 'Token Added!' : addTokenStatus === 'error' ? 'Failed - Try Again' : 'Add SDT to Wallet'}
              </Button>

              {/* Success Message */}
              {isSuccess && (
                <div className="mt-4 p-4 bg-[#95E1D3] border-4 border-black">
                  <p className="font-bold">Successfully claimed 100 SDT!</p>
                </div>
              )}

              {/* Error Message */}
              {writeError && (
                <div className="mt-4 p-4 bg-[#FF6B6B] border-4 border-black text-white text-left">
                  <p className="font-bold">{getErrorMessage()}</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 bg-white border-4 border-black">
              <p className="font-bold text-lg mb-2">Connect Wallet</p>
              <p className="text-gray-600">Connect your wallet to claim tokens</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card hover={false}>
          <CardContent className="text-center py-4">
            <p className="text-xs md:text-sm uppercase font-bold text-gray-500">Amount</p>
            <p className="text-lg md:text-xl font-black">100 SDT</p>
          </CardContent>
        </Card>
        <Card hover={false}>
          <CardContent className="text-center py-4">
            <p className="text-xs md:text-sm uppercase font-bold text-gray-500">Cooldown</p>
            <p className="text-lg md:text-xl font-black">24 Hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
