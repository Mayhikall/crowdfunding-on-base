'use client'

import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Use custom RPC if available, otherwise fallback to default
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org'

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        injected(),
    ],
    transports: {
        [baseSepolia.id]: http(rpcUrl),
    },
    ssr: true,
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
