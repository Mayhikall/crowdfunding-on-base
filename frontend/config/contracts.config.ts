/**
 * Contract Configuration
 * 
 * All contract addresses are read from environment variables.
 * No fallbacks - app will fail fast if not configured.
 */

import { baseSepolia } from 'wagmi/chains'

// Supported chain - Base Sepolia only
export const SUPPORTED_CHAIN = baseSepolia
export const SUPPORTED_CHAIN_ID = baseSepolia.id // 84532

// Contract addresses - MUST be set in environment
export const CONTRACT_ADDRESSES = {
    [baseSepolia.id]: {
        crowdfunding: process.env.NEXT_PUBLIC_CROWDFUNDING_ADDRESS as `0x${string}`,
        sedulurToken: process.env.NEXT_PUBLIC_SEDULUR_TOKEN_ADDRESS as `0x${string}`,
    }
} as const

// Helper to get contract address
export function getContractAddress(contract: 'crowdfunding' | 'sedulurToken'): `0x${string}` {
    const address = CONTRACT_ADDRESSES[SUPPORTED_CHAIN_ID][contract]
    if (!address) {
        throw new Error(`Contract address for ${contract} is not configured`)
    }
    return address
}
