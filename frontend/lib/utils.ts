import { formatEther, parseEther, formatUnits, parseUnits } from 'viem'

export function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAmount(amount: bigint, decimals = 18): string {
    const formatted = formatUnits(amount, decimals)
    const num = parseFloat(formatted)
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(4).replace(/\.?0+$/, '')
}

export function formatETH(amount: bigint): string {
    return formatAmount(amount) + ' ETH'
}

export function formatSDT(amount: bigint): string {
    return formatAmount(amount) + ' SDT'
}

export function formatDeadline(deadline: bigint): string {
    const date = new Date(Number(deadline) * 1000)
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export function getTimeRemaining(deadline: bigint): string {
    const now = BigInt(Math.floor(Date.now() / 1000))
    if (now >= deadline) return 'Ended'

    const diff = Number(deadline - now)
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)

    if (days > 0) return `${days} days left`
    if (hours > 0) return `${hours} hours left`
    return 'Ending soon'
}

export function formatCooldown(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`
    }
    return `${secs}s`
}

export function getProgress(collected: bigint, target: bigint): number {
    if (target === 0n) return 0
    return Math.min(100, Number((collected * 100n) / target))
}

export function getIPFSUrl(cid: string): string {
    if (!cid) return '/placeholder.svg'
    return `https://gateway.pinata.cloud/ipfs/${cid}`
}

export { formatEther, parseEther, formatUnits, parseUnits }

// Error messages mapping (English)
export const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
    'CrowdFunding__CampaignNotFound': 'Campaign not found',
    'CrowdFunding__InvalidDeadline': 'Invalid deadline',
    'CrowdFunding__InvalidTargetAmount': 'Invalid target amount',
    'CrowdFunding__CampaignEnded': 'Campaign has ended',
    'CrowdFunding__CampaignNotEnded': 'Campaign has not ended yet',
    'CrowdFunding__NotCreator': 'Only the creator can perform this action',
    'CrowdFunding__TargetNotReached': 'Target not reached',
    'CrowdFunding__AlreadyClaimed': 'Funds already withdrawn',
    'CrowdFunding__NoDonationToRefund': 'No donation to refund',
    'CrowdFunding__TargetReached': 'Target already reached',
    'CrowdFunding__InvalidDonationAmount': 'Invalid donation amount',
    'CrowdFunding__WrongPaymentType': 'Wrong payment type',
    'CrowdFunding__TransferFailed': 'Transfer failed',
    'CrowdFunding__EmptyTitle': 'Title cannot be empty',
    'CrowdFunding__CampaignCancelled': 'Campaign has been cancelled',
    'CrowdFunding__CannotCancelWithDonations': 'Cannot cancel campaign with donations',
    'CrowdFunding__MaxCampaignsReached': 'Maximum 5 active campaigns reached',
    'CrowdFunding__DonationTooLow': 'Donation amount too low',
    'CrowdFunding__ExtensionTooLong': 'Extension too long (max 30 days)',
    'SedulurToken__CooldownNotExpired': 'Cooldown not expired',
    'SedulurToken__InvalidAddress': 'Invalid address'
}

export function parseContractError(error: Error): string {
    const message = error.message || ''
    const match = message.match(/CrowdFunding__\w+|SedulurToken__\w+/)
    if (match) {
        return CONTRACT_ERROR_MESSAGES[match[0]] || 'Transaction failed'
    }
    if (message.includes('User rejected')) {
        return 'Transaction cancelled'
    }
    if (message.includes('insufficient funds')) {
        return 'Insufficient balance'
    }
    return 'An error occurred'
}
