'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Card, CardContent, Badge, Progress, Button } from '@/components/ui'
import { StatusBadge } from '@/components/ui/Badge'
import { useCampaign, useDonators, useDonation, useIsCampaignSuccessful } from '@/hooks/useCrowdFunding'
import { Campaign, getCampaignStatus, CATEGORY_LABELS, CATEGORY_COLORS, PaymentType } from '@/types/campaign'
import { formatETH, formatSDT, formatAddress, formatDeadline, getTimeRemaining, getProgress, getIPFSUrl } from '@/lib/utils'
import { DonateForm } from './DonateForm'
import { CreatorActions } from './CreatorActions'
import { RefundButton } from './RefundButton'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = Number(params.id)
  const { address } = useAccount()

  const { data: campaign, isLoading, refetch } = useCampaign(campaignId)
  const { data: donators } = useDonators(campaignId)
  const { data: myDonation } = useDonation(campaignId, address)
  const { data: isSuccessful } = useIsCampaignSuccessful(campaignId)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 w-48 mb-8"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 aspect-video bg-gray-300 border-4 border-black"></div>
            <div className="bg-gray-300 h-96 border-4 border-black"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign || campaign.creator === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-black mb-4">Campaign Not Found</h1>
        <Link href="/campaigns">
          <Button variant="primary">Back to Campaigns</Button>
        </Link>
      </div>
    )
  }

  const status = getCampaignStatus(campaign as unknown as Campaign)
  const progress = getProgress(campaign.amountCollected, campaign.targetAmount)
  const isCreator = address && campaign.creator.toLowerCase() === address.toLowerCase()
  const isETH = campaign.paymentType === PaymentType.ETH
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

          {/* Donators */}
          <Card hover={false}>
            <CardContent>
              <h2 className="font-bold text-xl uppercase mb-4">
                Donors ({donators?.length ?? 0})
              </h2>
              {donators && donators.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {donators.map((donator, i) => (
                    <div
                      key={i}
                      className="p-2 bg-gray-100 border-2 border-black font-mono text-sm"
                    >
                      {formatAddress(donator)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No donors yet.</p>
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

          {/* All Action Buttons - Always visible with proper states */}
          <Card hover={false}>
            <CardContent className="space-y-3">
              <h3 className="font-bold text-lg uppercase mb-2">Actions</h3>
              
              {/* Refund Button - Show for donors when failed */}
              <RefundButton 
                campaignId={campaignId} 
                onSuccess={refetch}
                canRefund={status === 'failed' && !!hasDonation}
                hasDonation={!!hasDonation}
                status={status}
              />

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
              {!isCreator && !hasDonation && status !== 'active' && (
                <p className="text-gray-500 text-sm">
                  No actions available for this campaign.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
