import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { Header, Footer } from '@/components/layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'SedulurFund - Decentralized Crowdfunding on Base',
  description: 'A decentralized crowdfunding platform on Base Sepolia. Create campaigns, donate with ETH or SDT tokens. Transparent, secure, and community-driven.',
  keywords: ['crowdfunding', 'web3', 'base', 'blockchain', 'crypto', 'decentralized', 'fundraising'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
