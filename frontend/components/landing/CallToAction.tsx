'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

export function CallToAction() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 bg-[#FFE66D] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            black 10px,
            black 12px
          )`
        }} />
      </div>

      {/* Floating Decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#4ECDC4] border-4 border-black rotate-12 shape-float-1 opacity-80" />
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-[#FF6B6B] border-4 border-black rounded-full shape-float-2 opacity-80" />
      <div className="absolute top-1/2 right-20 w-12 h-12 bg-white border-4 border-black shape-float-3 opacity-80" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Headline */}
          <h2 
            className={`text-4xl md:text-6xl font-black uppercase leading-tight mb-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
          >
            Ready to Start?
          </h2>

          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl mb-10 max-w-xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            Join <strong>thousands</strong> of people who have already made their dreams come true. 
            Start fundraising or support a campaign today!
          </p>

          {/* Single CTA Button */}
          <div 
            className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/campaigns">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-10">
                Let's Fund
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div 
            className={`mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-xs font-black">✓</span>
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-xs font-black">✓</span>
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-xs font-black">✓</span>
              <span>Instant withdrawals</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
