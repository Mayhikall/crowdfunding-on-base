import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { Header, Footer } from '@/components/layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'SedulurFund - Crowdfunding on Base',
  description: 'Platform crowdfunding terdesentralisasi di Base Sepolia. Buat campaign, donasi dengan ETH atau SDT token.',
  keywords: ['crowdfunding', 'web3', 'base', 'blockchain', 'crypto'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
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
