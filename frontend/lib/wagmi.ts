'use client'

import { http, createConfig } from 'wagmi'
import { baseSepolia, sepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// RPC URL - required
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
if (!rpcUrl) {
    throw new Error('NEXT_PUBLIC_RPC_URL is not configured')
}

export const config = createConfig({
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

export const TARGET_CHAIN_ID = baseSepolia.id

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
