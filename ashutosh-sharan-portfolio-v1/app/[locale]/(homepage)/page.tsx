import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/page/homepage/Herosection'

// Sized fallback skeleton matching WhoIsRavenSection's exact 320vh scroll height to prevent CLS
function WhoIsRavenSkeleton() {
  return (
    <div
      className="relative w-full h-[320vh] bg-transparent text-foreground select-none pointer-events-none"
      aria-hidden="true"
    />
  )
}

const WhoIsRavenSection = dynamic(
  () => import('@/components/page/homepage/WhoIsRavenSection').then((mod) => mod.WhoIsRavenSection),
  {
    loading: () => <WhoIsRavenSkeleton />,
  }
)

const Homepage = () => {
  return (
    <main className="relative w-full bg-transparent text-foreground">
      <HeroSection />
      <Suspense fallback={<WhoIsRavenSkeleton />}>
        <WhoIsRavenSection />
      </Suspense>
    </main>
  )
}

export default Homepage