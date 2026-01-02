export enum PaymentType {
    ETH = 0,
    TOKEN = 1
}

export enum Category {
    CHARITY = 0,
    TECHNOLOGY = 1,
    ART = 2,
    MUSIC = 3,
    GAMING = 4,
    EDUCATION = 5,
    HEALTH = 6,
    ENVIRONMENT = 7,
    COMMUNITY = 8,
    OTHER = 9
}

export const CATEGORY_LABELS: Record<Category, string> = {
    [Category.CHARITY]: 'Charity',
    [Category.TECHNOLOGY]: 'Technology',
    [Category.ART]: 'Art',
    [Category.MUSIC]: 'Music',
    [Category.GAMING]: 'Gaming',
    [Category.EDUCATION]: 'Education',
    [Category.HEALTH]: 'Health',
    [Category.ENVIRONMENT]: 'Environment',
    [Category.COMMUNITY]: 'Community',
    [Category.OTHER]: 'Other'
}

export const CATEGORY_COLORS: Record<Category, string> = {
    [Category.CHARITY]: 'bg-pink-400',
    [Category.TECHNOLOGY]: 'bg-cyan-400',
    [Category.ART]: 'bg-purple-400',
    [Category.MUSIC]: 'bg-yellow-400',
    [Category.GAMING]: 'bg-green-400',
    [Category.EDUCATION]: 'bg-blue-400',
    [Category.HEALTH]: 'bg-red-400',
    [Category.ENVIRONMENT]: 'bg-emerald-400',
    [Category.COMMUNITY]: 'bg-orange-400',
    [Category.OTHER]: 'bg-gray-400'
}

export interface Campaign {
    creator: `0x${string}`
    paymentType: PaymentType
    claimed: boolean
    cancelled: boolean
    category: Category
    targetAmount: bigint
    amountCollected: bigint
    deadline: bigint
    title: string
    description: string
    imageCID: string
}

export interface CampaignWithId extends Campaign {
    id: number
}

export type CampaignStatus = 'active' | 'success' | 'failed' | 'claimed' | 'cancelled'

export function getCampaignStatus(campaign: Campaign): CampaignStatus {
    const now = BigInt(Math.floor(Date.now() / 1000))

    if (campaign.cancelled) return 'cancelled'
    if (campaign.claimed) return 'claimed'
    if (now <= campaign.deadline) return 'active'
    if (campaign.amountCollected >= campaign.targetAmount) return 'success'
    return 'failed'
}

export function getCategorySlug(category: Category): string {
    return CATEGORY_LABELS[category].toLowerCase()
}

export function getCategoryFromSlug(slug: string): Category | undefined {
    const entry = Object.entries(CATEGORY_LABELS).find(
        ([, label]) => label.toLowerCase() === slug.toLowerCase()
    )
    return entry ? Number(entry[0]) as Category : undefined
}
