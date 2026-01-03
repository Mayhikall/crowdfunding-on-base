'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Card, CardContent, Badge, Progress, Button } from '@/components/ui'
import { StatusBadge } from '@/components/ui/Badge'
import { useCampaign, useDonators, useDonation, useIsCampaignSuccessful, useDonationsForDonators } from '@/hooks/useCrowdFunding'
import { Campaign, getCampaignStatus, CATEGORY_LABELS, CATEGORY_COLORS, PaymentType } from '@/types/campaign'
import { formatETH, formatSDT, formatAddress, formatDeadline, getTimeRemaining, getProgress, getIPFSUrl } from '@/lib/utils'
import { DonateForm } from './DonateForm'
import { CreatorActions } from './CreatorActions'
import { RefundButton } from './RefundButton'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = Number(params.id)
  const { address } = useAccount()

  const { data: campaign, isLoading, error, refetch } = useCampaign(campaignId)
  const { data: donators } = useDonators(campaignId)
  const { data: myDonation } = useDonation(campaignId, address)
  const { data: isSuccessful } = useIsCampaignSuccessful(campaignId)
  const donatorAmounts = useDonationsForDonators(campaignId, donators as readonly `0x${string}`[] | undefined)

  const isETH = campaign?.paymentType === PaymentType.ETH

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 w-48 mb-8 border-2 border-black"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 aspect-video bg-gray-300 border-4 border-black"></div>
            <div className="bg-gray-300 h-96 border-4 border-black"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Card hover={false} className="bg-[#FF6B6B]">
            <CardContent className="py-12 text-white">
              <div className="w-16 h-16 mx-auto mb-4 bg-white border-4 border-black rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-black mb-4">Error Loading Campaign</h1>
              <p className="mb-6">{error.message || 'Failed to load campaign data. Please try again.'}</p>
              <Link href="/campaigns">
                <Button variant="primary">Back to Campaigns</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!campaign || campaign.creator === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Card hover={false}>
            <CardContent className="py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 border-4 border-black rounded-full flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h1 className="text-2xl font-black mb-4">Campaign Not Found</h1>
              <p className="text-gray-600 mb-6">The campaign you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/campaigns">
                <Button variant="primary">Back to Campaigns</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const status = getCampaignStatus(campaign as unknown as Campaign)
  const progress = getProgress(campaign.amountCollected, campaign.targetAmount)
  const isCreator = address && campaign.creator.toLowerCase() === address.toLowerCase()
  const hasDonation = myDonation && myDonation > 0n

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/campaigns" className="font-bold hover:text-[#4ECDC4]">
          &larr; Back to Campaigns
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative aspect-video border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-200">
            <Image
              src={getIPFSUrl(campaign.imageCID)}
              alt={campaign.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Title & Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={CATEGORY_COLORS[campaign.category as keyof typeof CATEGORY_COLORS]}>
                {CATEGORY_LABELS[campaign.category as keyof typeof CATEGORY_LABELS]}
              </Badge>
              <Badge variant={isETH ? 'info' : 'warning'}>
                {isETH ? 'ETH' : 'SDT'}
              </Badge>
              <StatusBadge status={status} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              {campaign.title}
            </h1>
          </div>

          {/* Creator Info */}
          <Card hover={false}>
            <CardContent>
              <p className="text-sm text-gray-500 uppercase font-bold mb-1">Creator</p>
              <p className="font-bold font-mono">{formatAddress(campaign.creator)}</p>
              {isCreator && (
                <Badge variant="success" className="mt-2">You</Badge>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card hover={false}>
            <CardContent>
              <h2 className="font-bold text-xl uppercase mb-4">Description</h2>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {campaign.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Donators with amounts */}
          <Card hover={false}>
            <CardContent>
              <h2 className="font-bold text-xl uppercase mb-4">
                Donors ({donators?.length ?? 0})
              </h2>
              {donators && donators.length > 0 ? (
                <div className="space-y-2">
                  {donators.map((donator, i) => {
                    const amount = donatorAmounts?.[i]?.result as bigint | undefined
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black"
                      >
                        <span className="font-mono text-sm">{formatAddress(donator)}</span>
                        <span className="font-bold text-sm">
                          {amount ? (isETH ? formatETH(amount) : formatSDT(amount)) : '...'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No donors yet. Be the first to support this campaign!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card hover={false} className="bg-[#FFE66D]">
            <CardContent className="space-y-4">
              <Progress value={progress} size="lg" />
              
              <div className="text-center">
                <p className="text-3xl font-black">
                  {isETH ? formatETH(campaign.amountCollected) : formatSDT(campaign.amountCollected)}
                </p>
                <p className="text-gray-700">
                  of {isETH ? formatETH(campaign.targetAmount) : formatSDT(campaign.targetAmount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white border-2 border-black">
                  <p className="text-sm text-gray-500 uppercase font-bold">Deadline</p>
                  <p className="font-bold">{formatDeadline(campaign.deadline)}</p>
                </div>
                <div className="p-3 bg-white border-2 border-black">
                  <p className="text-sm text-gray-500 uppercase font-bold">Status</p>
                  <p className="font-bold">{getTimeRemaining(campaign.deadline)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donate Form - Show for non-creators when active */}
          {status === 'active' && !isCreator && (
            <DonateForm
              campaignId={campaignId}
              paymentType={campaign.paymentType}
              onSuccess={refetch}
            />
          )}

          {/* My Donation */}
          {hasDonation && (
            <Card hover={false} className="bg-[#95E1D3]">
              <CardContent>
                <p className="text-sm uppercase font-bold text-gray-700">Your Donation</p>
                <p className="text-2xl font-black">
                  {isETH ? formatETH(myDonation) : formatSDT(myDonation)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card hover={false}>
            <CardContent className="space-y-3">
              <h3 className="font-bold text-lg uppercase mb-2">Actions</h3>
              
              {/* Refund Button - Show for donors when failed */}
              {hasDonation && (
                <RefundButton 
                  campaignId={campaignId} 
                  onSuccess={refetch}
                  canRefund={status === 'failed' && !!hasDonation}
                  hasDonation={!!hasDonation}
                  status={status}
                />
              )}

              {/* Creator Actions */}
              {isCreator && (
                <CreatorActions
                  campaignId={campaignId}
                  campaign={campaign as unknown as Campaign}
                  status={status}
                  isSuccessful={isSuccessful ?? false}
                  onSuccess={refetch}
                />
              )}

              {/* Message for non-connected or non-involved users */}
              {!isCreator && !hasDonation && (
                <p className="text-gray-500 text-sm">
                  {status === 'active' 
                    ? 'Donate to this campaign to access donor actions.'
                    : 'No actions available for this campaign.'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
