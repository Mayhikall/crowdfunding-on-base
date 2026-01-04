'use client'

import { http, createConfig } from 'wagmi'
import { baseSepolia, sepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Use custom RPC if available, otherwise fallback to default
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org'

export const config = createConfig({
    // Include other chains so wagmi can detect them (but app only supports Base Sepolia)
    chains: [baseSepolia, sepolia, mainnet],
    connectors: [
        injected(),
    ],
    transports: {
        [baseSepolia.id]: http(rpcUrl),
        [sepolia.id]: http(),
        [mainnet.id]: http(),
    },
    ssr: true,
})

// Export target chain for use elsewhere
export const TARGET_CHAIN_ID = baseSepolia.id

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
