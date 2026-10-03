import React from 'react'
import { HeroSection } from '@/components/page/homepage/Herosection'
import DistressedText from '@/components/typography/DistressedText'

const Homepage = () => {
  return (
    <main className="relative w-full bg-background text-foreground">
      <HeroSection />

      {/* Next Section Placeholder (As requested: text baad mein design karenge) */}
      <section
        id="next-section"
        className="relative min-h-screen w-full flex flex-col justify-center items-center px-6 sm:px-12 py-32 bg-background border-t border-foreground/10 select-none z-30"
      >
        <DistressedText
          className="z-50"
        >
          A software engineer with a passion for building cool stuff.
        </DistressedText>

      </section>
    </main>
  )
}

export default Homepage