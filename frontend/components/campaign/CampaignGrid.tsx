'use client'

import { CampaignCard } from './CampaignCard'
import { CampaignWithId } from '@/types/campaign'

interface CampaignGridProps {
  campaigns: CampaignWithId[]
  isLoading?: boolean
}

export function CampaignGrid({ campaigns, isLoading }: CampaignGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] aspect-[4/5] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-bold mb-2">No Campaigns Yet</h3>
        <p className="text-gray-600">Be the first to create a campaign!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}
