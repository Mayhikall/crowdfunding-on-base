'use client'

import { AnimatedHero, FeatureShowcase, HowItWorks, CallToAction } from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with animated entrance */}
      <AnimatedHero />
      
      {/* Features with hover effects */}
      <FeatureShowcase />
      
      {/* How it works steps */}
      <HowItWorks />
      
      {/* Final CTA */}
      <CallToAction />
    </div>
  )
}
