'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { CampaignGrid } from '@/components/campaign'
import { useCampaigns, transformCampaigns } from '@/hooks/useCrowdFunding'
import { CATEGORY_LABELS, Category } from '@/types/campaign'

export default function CampaignsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  const { data: rawCampaigns, isLoading } = useCampaigns(0, 50)
  
  const allCampaigns = transformCampaigns(rawCampaigns)
    .filter(c => !c.cancelled)
    .reverse()

  const filteredCampaigns = selectedCategory !== null
    ? allCampaigns.filter(c => c.category === selectedCategory)
    : allCampaigns

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase">Campaigns</h1>
          <p className="text-gray-600">
            {allCampaigns.length} active campaigns
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              px-4 py-2 border-2 border-black font-bold text-sm uppercase
              transition-all duration-100
              ${selectedCategory === null
                ? 'bg-[#4ECDC4] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-gray-100'
              }
            `}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedCategory(Number(value) as Category)}
              className={`
                px-4 py-2 border-2 border-black font-bold text-sm uppercase
                transition-all duration-100
                ${selectedCategory === Number(value)
                  ? 'bg-[#4ECDC4] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {selectedCategory !== null && (
        <p className="text-gray-600 mb-4">
          Showing {filteredCampaigns.length} campaigns in {CATEGORY_LABELS[selectedCategory]}
        </p>
      )}

      {/* Campaign Grid */}
      <CampaignGrid campaigns={filteredCampaigns} isLoading={isLoading} />

      {/* Empty State */}
      {!isLoading && filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No campaigns found.</p>
          <Link href="/creator">
            <Button variant="donate">Create First Campaign</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
