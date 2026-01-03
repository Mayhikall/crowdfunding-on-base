'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Badge, Progress } from '@/components/ui'
import { CampaignWithId, getCampaignStatus, CATEGORY_LABELS, CATEGORY_COLORS, PaymentType } from '@/types/campaign'
import { formatETH, formatSDT, getTimeRemaining, getProgress, getIPFSUrl } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/Badge'

interface CampaignCardProps {
  campaign: CampaignWithId
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const status = getCampaignStatus(campaign)
  const progress = getProgress(campaign.amountCollected, campaign.targetAmount)
  const timeRemaining = getTimeRemaining(campaign.deadline)
  const categoryColor = CATEGORY_COLORS[campaign.category]
  const isETH = campaign.paymentType === PaymentType.ETH

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="h-full overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-video border-b-4 border-black overflow-hidden bg-gray-200">
          <Image
            src={getIPFSUrl(campaign.imageCID)}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={status} />
          </div>
        </div>

        <CardContent className="space-y-3">
          {/* Category & Payment Type */}
          <div className="flex items-center gap-2">
            <Badge className={categoryColor}>
              {CATEGORY_LABELS[campaign.category]}
            </Badge>
            <Badge variant={isETH ? 'info' : 'warning'}>
              {isETH ? 'ETH' : 'SDT'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-2 leading-tight">
            {campaign.title}
          </h3>

          {/* Progress */}
          <Progress value={progress} size="sm" />

          {/* Amount */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold">
              {isETH
                ? formatETH(campaign.amountCollected)
                : formatSDT(campaign.amountCollected)
              }
            </span>
            <span className="text-gray-500">
              of {isETH
                ? formatETH(campaign.targetAmount)
                : formatSDT(campaign.targetAmount)
              }
            </span>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>{timeRemaining}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
