'use client'

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui'
import { CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI } from '@/lib/contracts'
import { parseContractError } from '@/lib/utils'
import { CampaignStatus } from '@/types/campaign'

interface RefundButtonProps {
  campaignId: number
  onSuccess: () => void
  canRefund: boolean
  hasDonation: boolean
  status: CampaignStatus
}

export function RefundButton({ campaignId, onSuccess, canRefund, hasDonation, status }: RefundButtonProps) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      onSuccess()
    }
  }, [isSuccess, onSuccess])

  const handleRefund = () => {
    writeContract({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'refund',
      args: [BigInt(campaignId)],
    })
  }

  // Get tooltip/reason text
  const getDisabledReason = () => {
    if (!hasDonation) return 'You have not donated to this campaign'
    if (status === 'active') return 'Campaign is still active'
    if (status === 'success' || status === 'claimed') return 'Campaign reached its goal - no refund available'
    if (status === 'cancelled') return 'Campaign was cancelled'
    return ''
  }

  return (
    <div className="space-y-2">
      <Button
        variant="refund"
        className="w-full"
        onClick={handleRefund}
        disabled={!canRefund || isPending || isConfirming}
        isLoading={isPending || isConfirming}
      >
        {isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : 'Claim Refund'}
      </Button>
      
      {!canRefund && (
        <p className="text-gray-500 text-xs">{getDisabledReason()}</p>
      )}
      
      {error && (
        <p className="text-red-500 font-bold text-sm">{parseContractError(error)}</p>
      )}
      
      {isSuccess && (
        <p className="text-green-600 font-bold text-sm">Refund successful!</p>
      )}
    </div>
  )
}
