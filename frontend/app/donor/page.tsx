'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import Link from 'next/link'
import { Card, CardContent, Badge, Progress, Button } from '@/components/ui'
import { SEDULUR_TOKEN_ADDRESS, SEDULUR_TOKEN_ABI } from '@/lib/contracts'
import { formatAddress, formatETH, formatSDT, formatCooldown, formatDeadline, getProgress, parseContractError } from '@/lib/utils'
import { PaymentType, CATEGORY_LABELS } from '@/types/campaign'
import { useCampaigns, useCampaignCount, transformCampaigns, useDonationHistory } from '@/hooks/useCrowdFunding'
import { ConnectButton } from '@/components/wallet/ConnectButton'

type DonationStatus = 'ACTIVE' | 'SUCCESSFUL' | 'FAILED'

interface DonatedCampaign {
  id: number
  title: string
  category: number
  paymentType: number
  targetAmount: bigint
  amountCollected: bigint
  deadline: bigint
  myDonation: bigint
  status: DonationStatus
}

export default function DonorDashboardPage() {
  const { address, isConnected } = useAccount()
  const [cooldown, setCooldown] = useState(0)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  // Get campaign data
  const { data: campaignCount } = useCampaignCount()
  const { data: rawCampaigns, isLoading: isLoadingCampaigns } = useCampaigns(0, 100)
  const allCampaigns = transformCampaigns(rawCampaigns)
  
  // Get donation history
  const count = campaignCount ? Number(campaignCount) : 0
  const { donations, activeStatuses, successStatuses } = useDonationHistory(address, count)

  // Get SDT balance
  const { data: sdtBalance, refetch: refetchBalance } = useReadContract({
    address: SEDULUR_TOKEN_ADDRESS,
    abi: SEDULUR_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get last claim time
  const { data: lastClaimTime, refetch: refetchClaim } = useReadContract({
    address: SEDULUR_TOKEN_ADDRESS,
    abi: SEDULUR_TOKEN_ABI,
    functionName: 'getLastClaimTime',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Claim faucet
  const { writeContract, data: claimHash, isPending: isClaimPending, error: claimWriteError, reset: resetClaim } = useWriteContract()
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash })

  // Calculate cooldown
  const COOLDOWN_SECONDS = 24 * 60 * 60
  const now = Math.floor(Date.now() / 1000)
  const lastClaim = lastClaimTime !== undefined ? Number(lastClaimTime) : 0
  const nextClaimTime = lastClaim === 0 ? 0 : lastClaim + COOLDOWN_SECONDS
  const canClaim = lastClaim === 0 || now >= nextClaimTime
  const timeRemaining = canClaim ? 0 : Math.max(0, nextClaimTime - now)

  // Cooldown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      setCooldown(timeRemaining)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            refetchClaim()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCooldown(0)
    }
  }, [timeRemaining, refetchClaim])

  // Handle claim success/error
  useEffect(() => {
    if (isClaimSuccess) {
      setClaimSuccess(true)
      setClaimError(null)
      refetchBalance()
      refetchClaim()
    }
  }, [isClaimSuccess, refetchBalance, refetchClaim])

  useEffect(() => {
    if (claimWriteError) {
      setClaimError(parseContractError(claimWriteError))
      setClaimSuccess(false)
    }
  }, [claimWriteError])

  const handleClaim = () => {
    setClaimError(null)
    setClaimSuccess(false)
    resetClaim()
    writeContract({
      address: SEDULUR_TOKEN_ADDRESS,
      abi: SEDULUR_TOKEN_ABI,
      functionName: 'claimFaucet',
    })
  }

  // Build donated campaigns list
  const donatedCampaigns = useMemo<DonatedCampaign[]>(() => {
    if (!donations || !activeStatuses || !successStatuses || allCampaigns.length === 0) {
      return []
    }

    const result: DonatedCampaign[] = []
    
    for (let i = 0; i < allCampaigns.length; i++) {
      const donation = donations[i]?.result as bigint | undefined
      const isActive = activeStatuses[i]?.result as boolean | undefined
      const isSuccessful = successStatuses[i]?.result as boolean | undefined
      const campaign = allCampaigns[i]
      
      if (donation && donation > 0n) {
        let status: DonationStatus = 'ACTIVE'
        
        if (isActive) {
          status = 'ACTIVE'
        } else if (isSuccessful) {
          status = 'SUCCESSFUL'
        } else {
          status = 'FAILED'
        }

        result.push({
          id: campaign.id,
          title: campaign.title,
          category: campaign.category,
          paymentType: campaign.paymentType,
          targetAmount: campaign.targetAmount,
          amountCollected: campaign.amountCollected,
          deadline: campaign.deadline,
          myDonation: donation,
          status,
        })
      }
    }

    return result
  }, [donations, activeStatuses, successStatuses, allCampaigns])

  // Calculate summary
  const totalETHDonated = donatedCampaigns
    .filter(c => c.paymentType === PaymentType.ETH)
    .reduce((sum, c) => sum + c.myDonation, 0n)
  
  const totalTokenDonated = donatedCampaigns
    .filter(c => c.paymentType === PaymentType.TOKEN)
    .reduce((sum, c) => sum + c.myDonation, 0n)

  const campaignsSupported = donatedCampaigns.length

  const isLoadingDonations = isLoadingCampaigns || !donations

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card hover={false} className="text-center">
            <CardContent className="py-12">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-[#4ECDC4] border-4 border-black rounded-full flex items-center justify-center">
                <span className="text-4xl">🔗</span>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-black uppercase mb-4">Connect Your Wallet</h1>
              
              {/* Description */}
              <p className="text-gray-600 mb-8">
                Connect your wallet to access the Donor Dashboard and view your donation history.
              </p>
              
              {/* Connect Button */}
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              
              {/* Features preview */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 text-left">
                <p className="text-sm font-bold uppercase text-gray-500 mb-3">What you can do:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-[#95E1D3] border-2 border-black flex items-center justify-center text-xs font-bold">✓</span>
                    <span>View your donation history</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-[#95E1D3] border-2 border-black flex items-center justify-center text-xs font-bold">✓</span>
                    <span>Claim SDT tokens from faucet</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-[#95E1D3] border-2 border-black flex items-center justify-center text-xs font-bold">✓</span>
                    <span>Request refunds on failed campaigns</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase">Donor Dashboard</h1>
          <p className="text-gray-600 font-mono">{formatAddress(address!)}</p>
        </div>
        <Link href="/campaigns">
          <Button variant="donate">Explore Campaigns</Button>
        </Link>
      </div>

      {/* Faucet Status Card */}
      <Card className="mb-6 bg-[#FFE66D]">
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase font-bold text-gray-700">SDT Balance</p>
              <p className="text-3xl font-black">
                {sdtBalance !== undefined ? formatSDT(sdtBalance as bigint) : '0 SDT'}
              </p>
            </div>
            <div className="text-right">
              {canClaim ? (
                <Button
                  variant="donate"
                  onClick={handleClaim}
                  isLoading={isClaimPending || isClaimConfirming}
                  disabled={isClaimPending || isClaimConfirming}
                >
                  {isClaimPending ? 'Confirm...' : isClaimConfirming ? 'Processing...' : 'Claim Faucet'}
                </Button>
              ) : (
                <div>
                  <p className="text-sm uppercase font-bold text-gray-700">Next claim available in</p>
                  <p className="text-xl font-black font-mono">{formatCooldown(cooldown)}</p>
                </div>
              )}
            </div>
          </div>
          {claimSuccess && (
            <div className="mt-4 p-3 bg-[#95E1D3] border-2 border-black">
              <p className="font-bold text-sm">Successfully claimed 100 SDT!</p>
            </div>
          )}
          {claimError && (
            <div className="mt-4 p-3 bg-[#FF6B6B] border-2 border-black text-white">
              <p className="font-bold text-sm">{claimError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donation Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card hover={false} className="bg-[#4ECDC4]">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Total ETH Donated</p>
            <p className="text-2xl font-black">{formatETH(totalETHDonated)}</p>
          </CardContent>
        </Card>
        <Card hover={false} className="bg-[#95E1D3]">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Total Tokens Donated</p>
            <p className="text-2xl font-black">{formatSDT(totalTokenDonated)}</p>
          </CardContent>
        </Card>
        <Card hover={false} className="bg-white">
          <CardContent className="text-center">
            <p className="text-sm uppercase font-bold opacity-80">Campaigns Supported</p>
            <p className="text-2xl font-black">{campaignsSupported}</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
      <h2 className="text-2xl font-black uppercase mb-4">Donation History</h2>
      
      {isLoadingDonations ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 border-4 border-black animate-pulse" />
          ))}
        </div>
      ) : donatedCampaigns.length === 0 ? (
        <Card hover={false}>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 border-4 border-black mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-black text-gray-400">?</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No Donations Yet</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t made any donations yet.</p>
            <Link href="/campaigns">
              <Button variant="donate">Browse Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {donatedCampaigns.map((campaign) => {
            const isETH = campaign.paymentType === PaymentType.ETH
            const progress = getProgress(campaign.amountCollected, campaign.targetAmount)
            
            const statusColors: Record<DonationStatus, string> = {
              'ACTIVE': 'bg-[#4ECDC4]',
              'SUCCESSFUL': 'bg-[#95E1D3]',
              'FAILED': 'bg-[#FF6B6B] text-white',
            }

            const statusSubtitles: Record<DonationStatus, string> = {
              'ACTIVE': 'Campaign is still accepting donations',
              'SUCCESSFUL': 'Funding goal has been reached',
              'FAILED': 'Funding goal was not reached',
            }

            return (
              <Card key={campaign.id} className="hover:translate-x-1 hover:translate-y-1">
                <CardContent>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                        <Badge variant={isETH ? 'info' : 'warning'}>
                          {isETH ? 'ETH' : 'TOKEN'}
                        </Badge>
                        <Badge>
                          {CATEGORY_LABELS[campaign.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                      </div>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <h3 className="font-bold text-lg hover:text-[#4ECDC4]">{campaign.title}</h3>
                      </Link>
                      <p className="text-sm text-gray-500">{statusSubtitles[campaign.status]}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Deadline: {formatDeadline(campaign.deadline)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Your Donation</p>
                        <p className="font-bold text-lg">
                          {isETH ? formatETH(campaign.myDonation) : formatSDT(campaign.myDonation)}
                        </p>
                      </div>
                      <Progress value={progress} size="sm" showLabel={false} className="w-24" />
                      <div className="flex gap-2 justify-end">
                        {campaign.status === 'ACTIVE' && (
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Button variant="donate" size="sm">Donate Again</Button>
                          </Link>
                        )}
                        {campaign.status === 'FAILED' && (
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Button variant="refund" size="sm">Refund</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link href="/campaigns">
          <Card className="bg-[#4ECDC4]">
            <CardContent className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl uppercase">Browse Campaigns</h3>
                <p className="text-sm">Find new campaigns to support</p>
              </div>
              <span className="text-2xl font-black">&rarr;</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/faucet">
          <Card className="bg-[#FFE66D]">
            <CardContent className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl uppercase">Token Faucet</h3>
                <p className="text-sm">Claim 100 SDT every 24 hours</p>
              </div>
              <span className="text-2xl font-black">&rarr;</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
