'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui'

export function AnimatedHero() {
  const [isVisible, setIsVisible] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[90vh] bg-gradient-hero overflow-hidden border-b-4 border-black">
      {/* Floating Decorative Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 right-[10%] w-20 h-20 bg-[#FFE66D] border-4 border-black shape-float-1 rotate-12"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}
        />
        <div 
          className="absolute top-40 right-[25%] w-16 h-16 bg-[#FF6B6B] border-4 border-black rounded-full shape-float-2"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}
        />
        <div 
          className="absolute bottom-32 right-[15%] w-24 h-24 bg-[#95E1D3] border-4 border-black rotate-45 shape-float-3"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.6s' }}
        />
        <div 
          className="absolute top-1/3 right-[5%] w-12 h-32 bg-white border-4 border-black shape-float-2 -rotate-12"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}
        />
        <div 
          className="absolute bottom-20 left-[5%] w-14 h-14 bg-[#FFE66D] border-4 border-black rounded-full shape-float-1"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.5s' }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          {/* Tagline */}
          <div 
            className={`inline-block mb-6 px-4 py-2 bg-[#FFE66D] border-4 border-black neo-shadow-sm ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}
          >
            <span className="font-bold text-sm uppercase tracking-wider">
              Blockchain-Powered Crowdfunding Platform
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-[1.1] mb-6">
            <span 
              className={`block ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.1s' }}
            >
              Fund What
            </span>
            <span 
              className={`block text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.2s' }}
            >
              Matters
            </span>
            <span 
              className={`block ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.3s' }}
            >
              Together
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl mb-10 max-w-xl leading-relaxed ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <strong>Sedulur</strong> is a next-generation crowdfunding platform that is 
            <span className="text-white font-bold"> transparent</span>, 
            <span className="text-white font-bold"> secure</span>, and 
            <span className="text-white font-bold"> decentralized</span>. 
            Support meaningful projects or raise funds for your own dreams!
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-wrap gap-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.5s' }}
          >
            <Link href="/campaigns">
              <Button variant="primary" size="lg" className="animate-glow">
                Explore Campaigns
              </Button>
            </Link>
            {isConnected && (
              <Link href="/campaign/create">
                <Button variant="faucet" size="lg">
                  Start Fundraising
                </Button>
              </Link>
            )}
          </div>

          {/* Trust Badges */}
          <div 
            className={`mt-12 flex flex-wrap items-center gap-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.7s' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFE66D] border-2 border-black flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="text-sm font-bold">100% On-Chain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#95E1D3] border-2 border-black flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="text-sm font-bold">Funds Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="text-sm font-bold">No Platform Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-4 border-black bg-white rounded-full flex items-start justify-center p-2">
          <div className="w-2 h-3 bg-black rounded-full animate-fade-in-up" style={{ animationDuration: '1s', animationIterationCount: 'infinite' }} />
        </div>
      </div>
    </section>
  )
}
