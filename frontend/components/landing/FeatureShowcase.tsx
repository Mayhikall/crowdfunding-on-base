'use client'

import { useEffect, useState, useRef } from 'react'

interface Feature {
  title: string
  description: string
  color: string
}

const features: Feature[] = [
  {
    title: '100% Transparent',
    description: 'All transactions are recorded on the blockchain. Nothing is hidden, everything is publicly verifiable.',
    color: '#4ECDC4',
  },
  {
    title: 'Funds Protected',
    description: 'Smart contracts ensure funds can only be withdrawn if the goal is reached. Otherwise, donors get a refund.',
    color: '#FFE66D',
  },
  {
    title: 'Instant & Cheap',
    description: 'No platform fees! Only pay minimal gas fees on the Base network which are super affordable.',
    color: '#95E1D3',
  },
  {
    title: 'Borderless',
    description: 'Receive donations from anywhere in the world. Not limited by bank accounts or countries.',
    color: '#FF6B6B',
  },
  {
    title: 'Full Control',
    description: 'Your wallet, your funds. No third party can freeze or hold your money.',
    color: '#E8D5B7',
  },
  {
    title: 'Real-Time Tracking',
    description: 'Monitor campaign progress in real-time. See every donation come in directly on your dashboard.',
    color: '#B8E0D2',
  },
]

function FeatureCard({ feature, index, isVisible }: { feature: Feature; index: number; isVisible: boolean }) {
  return (
    <div
      className={`group relative bg-white border-4 border-black p-6 hover-lift ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'
      }}
    >
      {/* Colored top bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 transition-all duration-300 group-hover:h-3"
        style={{ backgroundColor: feature.color }}
      />
      
      {/* Number Badge */}
      <div 
        className="w-12 h-12 border-4 border-black flex items-center justify-center text-xl font-black mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        style={{ backgroundColor: feature.color }}
      >
        {index + 1}
      </div>

      {/* Title */}
      <h3 className="text-xl font-black uppercase mb-3 group-hover:text-[#4ECDC4] transition-colors">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

export function FeatureShowcase() {
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
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white border-t-4 border-b-4 border-black">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className={`inline-block px-4 py-2 bg-[#FF6B6B] text-white border-4 border-black text-sm font-bold uppercase mb-4 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}
          >
            Our Advantages
          </span>
          <h2 
            className={`text-3xl md:text-5xl font-black uppercase mb-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            Why Choose <span className="text-gradient-animated">Sedulur</span>?
          </h2>
          <p 
            className={`text-gray-600 max-w-2xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            A blockchain-based crowdfunding platform with cutting-edge technology for a better fundraising experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}
