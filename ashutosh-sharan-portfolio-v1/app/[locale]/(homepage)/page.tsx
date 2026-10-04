import React from 'react'
import { HeroSection } from '@/components/page/homepage/Herosection'
import { WhoIsRavenSection } from '@/components/page/homepage/WhoIsRavenSection'

const Homepage = () => {
  return (
    <main className="relative w-full bg-transparent text-foreground">
      <HeroSection />
      <WhoIsRavenSection />
    </main>
  )
}

export default Homepage