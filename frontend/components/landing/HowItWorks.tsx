'use client'

import { useEffect, useState, useRef } from 'react'

interface Step {
  number: string
  title: string
  description: string
  color: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Use MetaMask or any compatible wallet. Make sure you have Base Sepolia ETH for gas fees.',
    color: '#4ECDC4',
  },
  {
    number: '02',
    title: 'Create or Browse',
    description: 'Start your own fundraising campaign or support existing ones with SDT tokens.',
    color: '#FFE66D',
  },
  {
    number: '03',
    title: 'Donate with SDT',
    description: 'Send donations using SDT (Sedulur Token). Simple, fast, and secure.',
    color: '#95E1D3',
  },
  {
    number: '04',
    title: 'Track Progress',
    description: 'Monitor campaign progress in real-time. Everything is transparent on Base blockchain.',
    color: '#FF6B6B',
  },
]

function StepCard({ step, index, isVisible }: { step: Step; index: number; isVisible: boolean }) {
  return (
    <div className="relative">
      {/* Card */}
      <div
        className={`relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: `${index * 0.2}s` }}
      >
        {/* Step Number */}
        <div 
          className="w-16 h-16 mx-auto mb-4 border-4 border-black flex items-center justify-center text-xl font-black animate-bounce"
          style={{ 
            backgroundColor: step.color,
            animationDelay: `${index * 0.5}s`,
            animationDuration: '2s'
          }}
        >
          {step.number}
        </div>

        {/* Content Card */}
        <div className="bg-white border-4 border-black p-6 neo-shadow-sm text-center">
          {/* Title */}
          <h3 className="text-lg font-black uppercase mb-3">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export function HowItWorks() {
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
    <section ref={sectionRef} className="py-16 md:py-24 bg-[#F5F5DC]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className={`inline-block px-4 py-2 bg-[#95E1D3] border-4 border-black text-sm font-bold uppercase mb-4 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}
          >
            Easy & Fast
          </span>
          <h2 
            className={`text-3xl md:text-5xl font-black uppercase mb-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            How It Works
          </h2>
          <p 
            className={`text-gray-600 max-w-xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            Just 4 simple steps to start supporting or raising funds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number} 
              step={step} 
              index={index} 
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
