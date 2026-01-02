'use client'

import { useReadContract, useReadContracts } from 'wagmi'
import { CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI } from '@/lib/contracts'
import { Campaign, CampaignWithId } from '@/types/campaign'

export function useCampaignCount() {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getCampaignCount',
    })
}

export function useCampaigns(start: number = 0, limit: number = 20) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getCampaigns',
        args: [BigInt(start), BigInt(limit)],
    })
}

export function useCampaign(campaignId: number) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getCampaign',
        args: [BigInt(campaignId)],
    })
}

export function useCampaignsByCategory(category: number) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getCampaignsByCategory',
        args: [category],
    })
}

export function useDonators(campaignId: number) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getDonators',
        args: [BigInt(campaignId)],
    })
}

export function useDonation(campaignId: number, address: `0x${string}` | undefined) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getDonation',
        args: address ? [BigInt(campaignId), address] : undefined,
        query: {
            enabled: !!address,
        },
    })
}

export function useIsCampaignActive(campaignId: number) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'isCampaignActive',
        args: [BigInt(campaignId)],
    })
}

export function useIsCampaignSuccessful(campaignId: number) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'isCampaignSuccessful',
        args: [BigInt(campaignId)],
    })
}

export function useActiveCampaignCount(address: `0x${string}` | undefined) {
    return useReadContract({
        address: CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'getActiveCampaignCount',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })
}

// Helper to transform raw campaign data
export function transformCampaign(data: readonly [string, number, boolean, boolean, number, bigint, bigint, bigint, string, string, string], id: number): CampaignWithId {
    return {
        id,
        creator: data[0] as `0x${string}`,
        paymentType: data[1],
        claimed: data[2],
        cancelled: data[3],
        category: data[4],
        targetAmount: data[5],
        amountCollected: data[6],
        deadline: data[7],
        title: data[8],
        description: data[9],
        imageCID: data[10],
    }
}

export function transformCampaigns(data: readonly Campaign[] | undefined, startIndex: number = 0): CampaignWithId[] {
    if (!data) return []
    return data.map((campaign, index) => ({
        id: startIndex + index,
        ...campaign,
    })) as CampaignWithId[]
}

// Hook to get all donations for a user across all campaigns
export function useDonationHistory(address: `0x${string}` | undefined, campaignCount: number) {
    // Create contract calls for getDonation for each campaign
    const donationCalls = address && campaignCount > 0
        ? Array.from({ length: campaignCount }, (_, i) => ({
            address: CROWDFUNDING_ADDRESS,
            abi: CROWDFUNDING_ABI,
            functionName: 'getDonation' as const,
            args: [BigInt(i), address] as const,
        }))
        : []

    // Create contract calls for isCampaignActive for each campaign
    const activeCalls = campaignCount > 0
        ? Array.from({ length: campaignCount }, (_, i) => ({
            address: CROWDFUNDING_ADDRESS,
            abi: CROWDFUNDING_ABI,
            functionName: 'isCampaignActive' as const,
            args: [BigInt(i)] as const,
        }))
        : []

    // Create contract calls for isCampaignSuccessful for each campaign  
    const successCalls = campaignCount > 0
        ? Array.from({ length: campaignCount }, (_, i) => ({
            address: CROWDFUNDING_ADDRESS,
            abi: CROWDFUNDING_ABI,
            functionName: 'isCampaignSuccessful' as const,
            args: [BigInt(i)] as const,
        }))
        : []

    const { data: donations } = useReadContracts({
        contracts: donationCalls,
        query: { enabled: !!address && campaignCount > 0 },
    })

    const { data: activeStatuses } = useReadContracts({
        contracts: activeCalls,
        query: { enabled: campaignCount > 0 },
    })

    const { data: successStatuses } = useReadContracts({
        contracts: successCalls,
        query: { enabled: campaignCount > 0 },
    })

    return { donations, activeStatuses, successStatuses }
}
