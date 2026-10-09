"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import DistressedText from "@/components/typography/DistressedText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SHOWCASE_CARDS = [
  {
    id: "card-1",
    src: "/experince-images/1.png",
    alt: "Voyager 2 Creative Exploration",
    title: "Voyager 2",
    tag: "Creative Tech / WebGL",
  },
  {
    id: "card-2",
    src: "/experince-images/2.png",
    alt: "The Wild Life Editorial Concept",
    title: "The Wild Life",
    tag: "Visual Identity / Editorial",
  },
  {
    id: "card-3",
    src: "/experince-images/3.png",
    alt: "Water Space Interactive Experience",
    title: "Water Space",
    tag: "Fluid Simulation & Interaction",
  },
];

export function WhoIsRavenSection() {
  const sectionContainerRef = useRef<HTMLDivElement | null>(null);
  const stickyStageRef = useRef<HTMLDivElement | null>(null);

  // Text Elements
  const textGroupRef = useRef<HTMLDivElement | null>(null);
  const titleWrapperRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const h2Ref = useRef<HTMLHeadingElement | null>(null);

  // Stacked Images Elements (Card 1, Card 2, Card 3)
  const imageStackWrapperRef = useRef<HTMLDivElement | null>(null);
  const card1Ref = useRef<HTMLDivElement | null>(null);
  const card2Ref = useRef<HTMLDivElement | null>(null);
  const card3Ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionContainerRef.current;
      const stickyStage = stickyStageRef.current;
      const titleWrapper = titleWrapperRef.current;
      const title = titleRef.current;
      const textGroup = textGroupRef.current;
      const imageStack = imageStackWrapperRef.current;
      const card1 = card1Ref.current;
      const card2 = card2Ref.current;
      const card3 = card3Ref.current;

      if (!section || !stickyStage || !titleWrapper || !title || !textGroup || !imageStack || !card1 || !card2 || !card3) {
        return;
      }

      // Compute initial offset for "Who is Raven?" so it starts at top-right
      const getInitialTitleOffset = () => {
        if (!titleRef.current || !titleWrapperRef.current || !stickyStageRef.current) return { x: 0, y: 0 };
        const stageRect = stickyStageRef.current.getBoundingClientRect();
        const el = titleRef.current;
        const currentX = (gsap.getProperty(titleWrapperRef.current, "x") as number) || 0;
        const currentY = (gsap.getProperty(titleWrapperRef.current, "y") as number) || 0;
        const rect = el.getBoundingClientRect();

        const unshiftedLeft = (rect.left - stageRect.left) - currentX;
        const unshiftedTop = (rect.top - stageRect.top) - currentY;

        const isMobile = stageRect.width < 768;
        const targetRight = isMobile ? 24 : 80;
        const targetTop = isMobile ? 80 : 160;
        const targetLeft = stageRect.width - targetRight - rect.width;

        return {
          x: targetLeft - unshiftedLeft,
          y: targetTop - unshiftedTop,
        };
      };

      // Compute horizontal translation to center the image stack in the viewport
      const getCenterOffset = () => {
        if (!imageStackWrapperRef.current || !stickyStageRef.current) return 0;
        const stageRect = stickyStageRef.current.getBoundingClientRect();
        const el = imageStackWrapperRef.current;
        const currentX = (gsap.getProperty(el, "x") as number) || 0;
        const rect = el.getBoundingClientRect();
        const baseWidth = el.offsetWidth;
        const unshiftedCenterX = (rect.left - stageRect.left - currentX) + baseWidth / 2;
        const targetCenterX = stageRect.width / 2;
        return targetCenterX - unshiftedCenterX;
      };

      // Initial visual setup for title at top-right
      const initOffset = getInitialTitleOffset();
      gsap.set(titleWrapper, {
        x: initOffset.x,
        y: initOffset.y,
      });

      // Images start hidden by bottom clip-path
      gsap.set([card1, card2, card3], {
        clipPath: "inset(100% 0% 0% 0%)",
      });

      // Main scrubbed animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // PHASE 1: "Who is Raven?" animates to dock right above h2
      tl.fromTo(
        titleWrapper,
        {
          x: () => getInitialTitleOffset().x,
          y: () => getInitialTitleOffset().y,
        },
        {
          x: 0,
          y: 0,
          ease: "power2.inOut",
          duration: 1.2,
        },
        "phase1"
      );

      // PHASE 2: Stacked images reveal one by one with clip-path
      // Image 1 reveals
      tl.to(
        card1,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "power2.inOut",
          duration: 0.85,
        },
        "phase2"
      );

      // Image 2 reveals over Image 1
      tl.to(
        card2,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "power2.inOut",
          duration: 0.85,
        },
        "phase2+=0.55"
      );

      // Image 3 reveals over Image 2
      tl.to(
        card3,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "power2.inOut",
          duration: 0.85,
        },
        "phase2+=1.1"
      );

      // PHASE 3: Texts scroll upwards out of the screen
      tl.to(
        textGroup,
        {
          y: -window.innerHeight * 0.55,
          opacity: 0,
          ease: "power2.in",
          duration: 0.95,
        },
        "phase3"
      );

      // PHASE 4: Last image moves from right side to exact center of the screen
      tl.to(
        imageStack,
        {
          x: () => getCenterOffset(),
          scale: () => (window.innerWidth < 768 ? 1.05 : 1.18),
          ease: "power3.inOut",
          duration: 1.3,
        },
        "phase4"
      );

      // Comfortable pause with image resting in center
      tl.to({}, { duration: 0.3 });
    },
    { scope: sectionContainerRef }
  );

  return (
    <div
      ref={sectionContainerRef}
      id="who-is-raven-section"
      className="relative w-full h-[320vh] bg-transparent text-foreground select-none"
    >
      {/* Sticky Stage Viewport */}
      <section
        ref={stickyStageRef}
        className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-transparent"
      >

        {/* Section Content Overlay */}
        <div className="relative z-10 w-full h-full pointer-events-none p-6 sm:p-12 md:p-20 overflow-hidden flex items-center justify-center">
          {/* Left Text Container: "Who is Raven?" settles directly on top of h2 */}
          <div
            ref={textGroupRef}
            className="absolute bottom-14 sm:bottom-20 left-6 sm:left-12 md:left-20 max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col items-start gap-4 sm:gap-6 z-20 pointer-events-auto will-change-transform"
          >
            {/* Title Wrapper: Initially translated to top-right, animates to (0, 0) */}
            <div ref={titleWrapperRef} className="will-change-transform">
              <h1
                ref={titleRef}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-stalinist-one leading-tight text-foreground select-none"
              >
                Who is{" "}
                <span className="inline-block">
                  <span className="inline-block text-foreground">R</span>
                  <DistressedText
                    inlineChar
                    className="mr-[-0.06em] text-[#DC143C]"
                  >
                    a
                  </DistressedText>
                  <span className="inline-block text-foreground">ven</span>
                </span>
                <span>?</span>
              </h1>
            </div>

            {/* Subtitle / Engineer Headline */}
            <h2
              ref={h2Ref}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-space-mono font-medium leading-normal text-foreground select-none"
            >
              A software engineer with a passion for building cool stuff.
            </h2>
          </div>

          {/* Right Stacked Images Container: 3 stacked cards, moves to center */}
          <div
            ref={imageStackWrapperRef}
            className="absolute right-6 sm:right-12 md:right-20 top-1/2 -translate-y-1/2 z-25 w-[290px] sm:w-[390px] md:w-[480px] lg:w-[560px] aspect-[4/3] will-change-transform pointer-events-auto"
          >
            {/* Card 1 */}
            <div
              ref={card1Ref}
              className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-black/10 dark:border-white/10 bg-neutral-900 z-10 will-change-[clip-path]"
              style={{ clipPath: "inset(100% 0% 0% 0%)" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={SHOWCASE_CARDS[0].src}
                  alt={SHOWCASE_CARDS[0].alt}
                  fill
                  sizes="(max-width: 768px) 85vw, 560px"
                  className="object-cover pointer-events-none select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <span className="text-sm font-mono text-white/95 font-semibold">
                    {SHOWCASE_CARDS[0].title}
                  </span>
                  <span className="text-xs font-mono text-[#DC143C]">
                    {SHOWCASE_CARDS[0].tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white/90 text-[11px] sm:text-xs font-mono uppercase tracking-wider select-none">
                  01 / {SHOWCASE_CARDS[0].title}
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              ref={card2Ref}
              className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-black/10 dark:border-white/10 bg-neutral-900 z-20 will-change-[clip-path]"
              style={{ clipPath: "inset(100% 0% 0% 0%)" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={SHOWCASE_CARDS[1].src}
                  alt={SHOWCASE_CARDS[1].alt}
                  fill
                  sizes="(max-width: 768px) 85vw, 560px"
                  className="object-cover pointer-events-none select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <span className="text-sm font-mono text-white/95 font-semibold">
                    {SHOWCASE_CARDS[1].title}
                  </span>
                  <span className="text-xs font-mono text-[#DC143C]">
                    {SHOWCASE_CARDS[1].tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white/90 text-[11px] sm:text-xs font-mono uppercase tracking-wider select-none">
                  02 / {SHOWCASE_CARDS[1].title}
                </div>
              </div>
            </div>

            {/* Card 3 (Final topmost image that moves to screen center) */}
            <div
              ref={card3Ref}
              className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_28px_70px_-12px_rgba(0,0,0,0.4)] border border-black/10 dark:border-white/10 bg-neutral-900 z-30 will-change-[clip-path]"
              style={{ clipPath: "inset(100% 0% 0% 0%)" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={SHOWCASE_CARDS[2].src}
                  alt={SHOWCASE_CARDS[2].alt}
                  fill
                  sizes="(max-width: 768px) 85vw, 560px"
                  className="object-cover pointer-events-none select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <span className="text-sm font-mono text-white/95 font-semibold">
                    {SHOWCASE_CARDS[2].title}
                  </span>
                  <span className="text-xs font-mono text-[#DC143C]">
                    {SHOWCASE_CARDS[2].tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white/90 text-[11px] sm:text-xs font-mono uppercase tracking-wider select-none">
                  03 / {SHOWCASE_CARDS[2].title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const whoIsRavenSection = WhoIsRavenSection;
export default WhoIsRavenSection;
