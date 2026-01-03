'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI } from '@/lib/contracts'
import { useTokenBalance, useTokenAllowance, useApproveToken } from '@/hooks/useSedulurToken'
import { formatSDT, parseContractError } from '@/lib/utils'
import { PaymentType } from '@/types/campaign'

interface DonateFormProps {
  campaignId: number
  paymentType: number
  onSuccess: () => void
}

export function DonateForm({ campaignId, paymentType, onSuccess }: DonateFormProps) {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  
  const isETH = paymentType === PaymentType.ETH
  
  const { data: tokenBalance } = useTokenBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(address)
  const { approve, isPending: isApproving, isConfirming: isApprovalConfirming, isSuccess: isApprovalSuccess } = useApproveToken()
  
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const parsedAmount = amount ? (isETH ? parseEther(amount) : parseUnits(amount, 18)) : 0n
  const needsApproval = !isETH && allowance !== undefined && parsedAmount > allowance

  useEffect(() => {
    if (isApprovalSuccess) {
      refetchAllowance()
    }
  }, [isApprovalSuccess, refetchAllowance])

  useEffect(() => {
    if (isSuccess) {
      setAmount('')
      onSuccess()
    }
  }, [isSuccess, onSuccess])

  const handleDonate = () => {
    if (!amount || parsedAmount === 0n) return

    if (isETH) {
      writeContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'donateETH',
        args: [BigInt(campaignId)],
        value: parsedAmount,
      })
    } else {
      writeContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'donateToken',
        args: [BigInt(campaignId), parsedAmount],
      })
    }
  }

  const handleApprove = () => {
    approve(parsedAmount)
  }

  const minAmount = isETH ? '0.001' : '1'

  return (
    <Card hover={false}>
      <CardContent className="space-y-4">
        <h3 className="font-bold text-lg uppercase">Donate {isETH ? 'ETH' : 'SDT'}</h3>
        
        {!isETH && tokenBalance !== undefined && (
          <div className="p-3 bg-gray-100 border-2 border-black">
            <p className="text-sm text-gray-500">SDT Balance: <span className="font-bold">{formatSDT(tokenBalance)}</span></p>
          </div>
        )}

        <Input
          type="number"
          step={isETH ? '0.001' : '1'}
          min={minAmount}
          placeholder={`Min ${minAmount} ${isETH ? 'ETH' : 'SDT'}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {!isConnected ? (
          <p className="text-center text-gray-500 font-medium text-sm">
            Connect wallet to donate
          </p>
        ) : needsApproval ? (
          <Button
            variant="faucet"
            size="lg"
            className="w-full"
            onClick={handleApprove}
            isLoading={isApproving || isApprovalConfirming}
          >
            {isApproving ? 'Confirm...' : isApprovalConfirming ? 'Approving...' : 'Approve SDT'}
          </Button>
        ) : (
          <Button
            variant="donate"
            size="lg"
            className="w-full"
            onClick={handleDonate}
            disabled={!amount || parsedAmount === 0n || isPending || isConfirming}
            isLoading={isPending || isConfirming}
          >
            {isPending ? 'Confirm...' : isConfirming ? 'Processing...' : `Donate ${isETH ? 'ETH' : 'SDT'}`}
          </Button>
        )}

        {error && (
          <p className="text-red-500 font-bold text-sm">{parseContractError(error)}</p>
        )}

        {isSuccess && (
          <p className="text-green-600 font-bold text-sm">Donation successful!</p>
        )}
      </CardContent>
    </Card>
  )
}
