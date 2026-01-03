'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button, Input, Textarea } from '@/components/ui'
import { CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI } from '@/lib/contracts'
import { parseContractError } from '@/lib/utils'
import { Campaign, CampaignStatus } from '@/types/campaign'

interface CreatorActionsProps {
  campaignId: number
  campaign: Campaign
  status: CampaignStatus
  isSuccessful?: boolean
  onSuccess: () => void
}

export function CreatorActions({ campaignId, campaign, status, onSuccess }: CreatorActionsProps) {
  const [showUpdate, setShowUpdate] = useState(false)
  const [showExtend, setShowExtend] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [extensionDays, setExtensionDays] = useState('')

  // Withdraw
  const { writeContract: writeWithdraw, data: withdrawHash, isPending: isWithdrawPending, error: withdrawError } = useWriteContract()
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash })

  // Cancel
  const { writeContract: writeCancel, data: cancelHash, isPending: isCancelPending, error: cancelError } = useWriteContract()
  const { isLoading: isCancelConfirming, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash })

  // Update
  const { writeContract: writeUpdate, data: updateHash, isPending: isUpdatePending, error: updateError } = useWriteContract()
  const { isLoading: isUpdateConfirming, isSuccess: isUpdateSuccess } = useWaitForTransactionReceipt({ hash: updateHash })

  // Extend
  const { writeContract: writeExtend, data: extendHash, isPending: isExtendPending, error: extendError } = useWriteContract()
  const { isLoading: isExtendConfirming, isSuccess: isExtendSuccess } = useWaitForTransactionReceipt({ hash: extendHash })

  useEffect(() => {
    if (isWithdrawSuccess || isCancelSuccess || isUpdateSuccess || isExtendSuccess) {
      onSuccess()
      setShowUpdate(false)
      setShowExtend(false)
    }
  }, [isWithdrawSuccess, isCancelSuccess, isUpdateSuccess, isExtendSuccess, onSuccess])

  const handleWithdraw = () => {
    writeWithdraw({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'withdraw',
      args: [BigInt(campaignId)],
    })
  }

  const handleCancel = () => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return
    writeCancel({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'cancelCampaign',
      args: [BigInt(campaignId)],
    })
  }

  const handleUpdate = () => {
    writeUpdate({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'updateCampaign',
      args: [BigInt(campaignId), newDescription, ''],
    })
  }

  const handleExtend = () => {
    const seconds = BigInt(parseInt(extensionDays) * 24 * 60 * 60)
    writeExtend({
      address: CROWDFUNDING_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: 'extendDeadline',
      args: [BigInt(campaignId), seconds],
    })
  }

  const canWithdraw = status === 'success' && !campaign.claimed
  const canCancel = status === 'active' && campaign.amountCollected === 0n
  const canUpdate = status === 'active'
  const canExtend = status === 'active'

  // Get disabled reasons
  const getWithdrawReason = () => {
    if (campaign.claimed) return 'Funds already withdrawn'
    if (status === 'active') return 'Campaign still active'
    if (status === 'failed') return 'Campaign did not reach goal'
    if (status === 'cancelled') return 'Campaign was cancelled'
    return ''
  }

  const getCancelReason = () => {
    if (status !== 'active') return 'Campaign is not active'
    if (campaign.amountCollected > 0n) return 'Cannot cancel - has donations'
    return ''
  }

  return (
    <div className="space-y-3">
      {/* Withdraw Button - Always visible */}
      <div>
        <Button
          variant="withdraw"
          className="w-full"
          onClick={handleWithdraw}
          disabled={!canWithdraw || isWithdrawPending || isWithdrawConfirming}
          isLoading={isWithdrawPending || isWithdrawConfirming}
        >
          {isWithdrawPending ? 'Confirm...' : isWithdrawConfirming ? 'Processing...' : 'Withdraw Funds'}
        </Button>
        {!canWithdraw && <p className="text-gray-500 text-xs mt-1">{getWithdrawReason()}</p>}
        {withdrawError && <p className="text-red-500 text-sm mt-1">{parseContractError(withdrawError)}</p>}
      </div>

      {/* Update Campaign */}
      <div>
        {!showUpdate ? (
          <Button variant="ghost" className="w-full" onClick={() => setShowUpdate(true)} disabled={!canUpdate}>
            Update Description
          </Button>
        ) : (
          <div className="space-y-2 p-3 border-2 border-black bg-gray-50">
            <Textarea placeholder="New description..." rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleUpdate} isLoading={isUpdatePending || isUpdateConfirming}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowUpdate(false)}>Cancel</Button>
            </div>
            {updateError && <p className="text-red-500 text-sm">{parseContractError(updateError)}</p>}
          </div>
        )}
      </div>

      {/* Extend Deadline */}
      <div>
        {!showExtend ? (
          <Button variant="ghost" className="w-full" onClick={() => setShowExtend(true)} disabled={!canExtend}>
            Extend Deadline
          </Button>
        ) : (
          <div className="space-y-2 p-3 border-2 border-black bg-gray-50">
            <Input type="number" min="1" max="30" placeholder="Days (max 30)" value={extensionDays} onChange={(e) => setExtensionDays(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleExtend} isLoading={isExtendPending || isExtendConfirming}>Extend</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowExtend(false)}>Cancel</Button>
            </div>
            {extendError && <p className="text-red-500 text-sm">{parseContractError(extendError)}</p>}
          </div>
        )}
      </div>

      {/* Cancel Campaign */}
      <div>
        <Button
          variant="danger"
          className="w-full"
          onClick={handleCancel}
          disabled={!canCancel || isCancelPending || isCancelConfirming}
          isLoading={isCancelPending || isCancelConfirming}
        >
          Cancel Campaign
        </Button>
        {!canCancel && status === 'active' && <p className="text-gray-500 text-xs mt-1">{getCancelReason()}</p>}
        {cancelError && <p className="text-red-500 text-sm mt-1">{parseContractError(cancelError)}</p>}
      </div>

      {/* Status messages */}
      {campaign.claimed && <p className="text-center text-gray-500">Funds have been withdrawn</p>}
      {campaign.cancelled && <p className="text-center text-gray-500">Campaign was cancelled</p>}
    </div>
  )
}
