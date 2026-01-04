/**
 * Contract Configuration
 * 
 * Best practice: Store contract addresses in environment variables
 * with fallback to deployed addresses for development convenience.
 */

import { baseSepolia } from 'wagmi/chains'

// Supported chain - Base Sepolia only
export const SUPPORTED_CHAIN = baseSepolia
export const SUPPORTED_CHAIN_ID = baseSepolia.id // 84532

// Contract addresses from environment variables with fallbacks
export const CONTRACT_ADDRESSES = {
    [baseSepolia.id]: {
        crowdfunding: (process.env.NEXT_PUBLIC_CROWDFUNDING_ADDRESS ||
            '0x1A8DA2385043aDDA13Afa12772e8D8cbCdd3B367') as `0x${string}`,
        sedulurToken: (process.env.NEXT_PUBLIC_SEDULUR_TOKEN_ADDRESS ||
            '0xA7781a2D948303809355f958027a750eFe8e71CB') as `0x${string}`,
    }
} as const

// Helper to get contract address
export function getContractAddress(contract: 'crowdfunding' | 'sedulurToken'): `0x${string}` {
    return CONTRACT_ADDRESSES[SUPPORTED_CHAIN_ID][contract]
}
