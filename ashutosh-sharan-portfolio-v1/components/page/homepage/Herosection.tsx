"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DistressedText } from "@/components/typography/DistressedText";
import { useMenu } from "@/components/layout/MenuContext";

// Lazy-load heavy canvas & showcase components to drastically shrink initial JS bundle and TBT
const AsciiHeroCanvas = dynamic(
  () => import("./AsciiHeroCanvas").then((mod) => mod.AsciiHeroCanvas),
  { ssr: false }
);

const AsciiParticleMorphCanvas = dynamic(
  () => import("./AsciiParticleMorphCanvas").then((mod) => mod.AsciiParticleMorphCanvas),
  { ssr: false }
);

const DualStreamShowcase = dynamic(
  () => import("./DualStreamShowcase").then((mod) => mod.DualStreamShowcase),
  { ssr: false }
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const stickyStageRef = useRef<HTMLDivElement | null>(null);
  const logoContainerRef = useRef<HTMLDivElement | null>(null);
  const ravenWrapRef = useRef<HTMLDivElement | null>(null);
  const ravenStrokedRef = useRef<HTMLSpanElement | null>(null);
  const ravenFilledRef = useRef<HTMLSpanElement | null>(null);
  const shipsWrapRef = useRef<HTMLDivElement | null>(null);
  const shipsTextRef = useRef<HTMLSpanElement | null>(null);
  const asciiWrapRef = useRef<HTMLDivElement | null>(null);

  const { isMenuOpen } = useMenu();
  const isMenuOpenRef = useRef(isMenuOpen);
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
    const strokeColor = isMenuOpen ? "#ffffff" : "#1e1e1e";
    if (shipsTextRef.current) {
      const curStroke = shipsTextRef.current.style.webkitTextStroke.split(" ")[0] || "1.6px";
      shipsTextRef.current.style.webkitTextStroke = `${curStroke} ${strokeColor}`;
    }
    if (ravenStrokedRef.current) {
      const curStroke = ravenStrokedRef.current.style.webkitTextStroke.split(" ")[0] || "2px";
      ravenStrokedRef.current.style.webkitTextStroke = `${curStroke} ${strokeColor}`;
    }
  }, [isMenuOpen]);

  const [isRevealed, setIsRevealed] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop, { passive: true });
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Allow pressing 'R' in dev mode to re-trigger reveal smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "r" || e.key === "R") &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        setIsRevealed(false);
        setScrollProgress(0);
        window.dispatchEvent(new CustomEvent("navbar-hide"));
        setAnimationKey((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // GSAP Step 1-4 Intro Reveal Timeline
  useGSAP(
    () => {
      const logoContainer = logoContainerRef.current;
      const ravenWrap = ravenWrapRef.current;
      const ravenStroked = ravenStrokedRef.current;
      const ravenFilled = ravenFilledRef.current;
      const shipsWrap = shipsWrapRef.current;
      const shipsText = shipsTextRef.current;
      const asciiWrap = asciiWrapRef.current;

      if (
        !logoContainer ||
        !ravenWrap ||
        !ravenStroked ||
        !ravenFilled ||
        !shipsWrap ||
        !shipsText ||
        !asciiWrap
      )
        return;

      const clampPx = (min: number, preferredVw: number, max: number) =>
        Math.round(
          Math.min(Math.max((window.innerWidth * preferredVw) / 100, min), max)
        );

      const isMobile = window.innerWidth < 640;

      // Responsive fluid target sizes for hero reveal
      const targetRavenSize = clampPx(72, 12.5, 240);
      const targetShipsSize = clampPx(25, 4.38, 84);

      // Target Y lift in Step 4: Horizontally centered, vertically lifted
      const targetLiftY = -Math.round(
        Math.min(Math.max(window.innerHeight * 0.22, 64), 190)
      );

      const initialFontSize = clampPx(24, 2.5, 36);
      const step3RavenSize = clampPx(48, 6.5, 102);

      gsap.set(logoContainer, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0,
      });

      gsap.set([ravenWrap, shipsWrap], {
        fontSize: `${initialFontSize}px`,
      });

      gsap.set(shipsWrap, { x: 0, y: 0 });
      const ravenRect = ravenWrap.getBoundingClientRect();
      const shipsRect = shipsWrap.getBoundingClientRect();

      // Perfectly center-align Ships vertically with Raven side-by-side
      const ravenCenter = ravenRect.top + ravenRect.height / 2;
      const shipsCenter = shipsRect.top + shipsRect.height / 2;
      const sideBySideY = Math.round(ravenCenter - shipsCenter);
      const sideBySideX = Math.round((ravenRect.right + 14) - shipsRect.left);

      gsap.set(shipsWrap, {
        x: sideBySideX,
        y: sideBySideY,
      });

      gsap.set(ravenFilled, {
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set(ravenStroked, {
        clipPath: "inset(0 0% 0 0)",
      });

      gsap.set(asciiWrap, {
        opacity: 0,
      });

      // Master GSAP Reveal Timeline
      const tl = gsap.timeline({
        onComplete: () => {
          setIsRevealed(true);
          ravenWrap.style.fontSize = `${targetRavenSize}px`;
          shipsWrap.style.fontSize = `${targetShipsSize}px`;
        },
      });

      // STEP 1: Centered Outline Logo
      tl.to(logoContainer, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });

      tl.to({}, { duration: 0.08 });

      // STEP 2: Left-to-Right Stencil Wipe Fill
      const wipe = { progress: 0 };
      tl.to(wipe, {
        progress: 100,
        duration: 0.45,
        ease: "power2.inOut",
        onUpdate: () => {
          const p = wipe.progress;
          ravenFilled.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
          ravenStroked.style.clipPath = `inset(0 0 0 ${p}%)`;
        },
      });

      tl.to({}, { duration: 0.08 });

      // STEP 3: Raven grows, Ships moves under
      tl.to(
        ravenWrap,
        {
          fontSize: `${step3RavenSize}px`,
          duration: 0.35,
          ease: "power3.inOut",
        },
        "step3"
      );

      tl.to(
        shipsWrap,
        {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "step3+=0.06"
      );

      tl.to({}, { duration: 0.1 });

      // STEP 4: Fullscreen Climax
      tl.to(
        logoContainer,
        {
          x: 0,
          y: targetLiftY,
          duration: 0.55,
          ease: "power3.inOut",
        },
        "step4"
      );

      tl.to(
        ravenWrap,
        {
          fontSize: `${targetRavenSize}px`,
          duration: 0.55,
          ease: "power3.inOut",
        },
        "step4"
      );

      tl.to(
        shipsWrap,
        {
          fontSize: `${targetShipsSize}px`,
          y: isMobile ? 0 : 2,
          duration: 0.55,
          ease: "power3.inOut",
        },
        "step4"
      );

      // Trigger Navbar reveal
      tl.call(
        () => {
          window.dispatchEvent(new CustomEvent("navbar-reveal"));
        },
        [],
        "step4+=0.15"
      );

      // Waterfall stagger on Quick Nav
      const navLinkElements = document.querySelectorAll(".navbar-link-item");
      if (navLinkElements.length > 0) {
        tl.fromTo(
          navLinkElements,
          { y: -18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.35,
            ease: "power2.out",
          },
          "step4+=0.18"
        );
      }

      const navToggleElement = document.querySelector(".navbar-toggle-btn");
      if (navToggleElement) {
        tl.fromTo(
          navToggleElement,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.4)" },
          "step4+=0.2"
        );
      }

      // Hero Canvas & Image unmasks promptly
      tl.to(
        asciiWrap,
        {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
        },
        "step4+=0.12"
      );
    },
    { scope: heroContainerRef, dependencies: [animationKey] }
  );

  // GSAP ScrollTrigger for the Multi-Phase Experiences Flow
  useEffect(() => {
    if (!isRevealed || !heroContainerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
        onUpdate: (self) => {
          if (isMenuOpenRef.current) return;
          const p = self.progress;
          setScrollProgress(p);

          // Direct DOM transformation for the Raven Ships Logo
          // Phase 1 (p: 0 -> 0.18): Moves smoothly from hero center to navbar top-left
          // Raven resizes directly to 32px, Ships resizes proportionally, no clipping outside screen
          const logo = logoContainerRef.current;
          const raven = ravenWrapRef.current;
          const ships = shipsWrapRef.current;
          const ravenStroked = ravenStrokedRef.current;
          const shipsText = shipsTextRef.current;

          if (logo && raven && ships) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 640;

            const clampPx = (min: number, preferredVw: number, max: number) =>
              Math.round(
                Math.min(Math.max((w * preferredVw) / 100, min), max)
              );

            const targetRavenSize = clampPx(72, 12.5, 240);
            const targetShipsSize = clampPx(25, 4.38, 84);

            const targetLiftY = -Math.round(
              Math.min(Math.max(h * 0.22, 64), 190)
            );

            // Docking target: 32px Raven font size, Ships = 32 * (25/72) = 11.1px
            const finalRavenSize = 32;
            const finalShipsSize = Math.round(32 * (25 / 72)); // ~11px

            // Padding from viewport top-left edge (matching Navbar top-5/top-8)
            const padLeft = isMobile ? 20 : 32;
            const padTop = isMobile ? 20 : 32;

            const u1 = Math.min(1, Math.max(0, p / 0.18));
            const ease = u1 * u1 * (3 - 2 * u1); // smooth cubic ease

            // Interpolate font sizes directly (clean typography without scale blur)
            const curRavenFont =
              targetRavenSize + (finalRavenSize - targetRavenSize) * ease;
            const curShipsFont =
              targetShipsSize + (finalShipsSize - targetShipsSize) * ease;

            raven.style.fontSize = `${curRavenFont}px`;
            ships.style.fontSize = `${curShipsFont}px`;

            // Proportional stroke width interpolation (prevents chunky stroke blobs at small font size)
            const strokeColor = isMenuOpenRef.current ? "#ffffff" : "#1e1e1e";
            if (shipsText) {
              const curShipsStroke = 1.6 + (0.45 - 1.6) * ease;
              shipsText.style.webkitTextStroke = `${curShipsStroke}px ${strokeColor}`;
            }

            if (ravenStroked) {
              const curRavenStroke = 2.0 + (0.8 - 2.0) * ease;
              ravenStroked.style.webkitTextStroke = `${curRavenStroke}px ${strokeColor}`;
            }

            // Proportional vertical gap between Raven and Ships
            const startGap = isMobile ? 0 : 2;
            const finalGap = isMobile ? 2.5 : 3.5;
            const curShipsY = startGap + (finalGap - startGap) * ease;
            ships.style.transform = `translate3d(0, ${curShipsY}px, 0)`;

            // Accurate docked logo dimensions for target coordinate calculation
            // In Stalinist One at 32px, "Raven" is ~146px wide, total height with Ships is ~38px
            const finalLogoW = isMobile ? 132 : 146;
            const finalLogoH = isMobile ? 34 : 38;

            const targetCenterX = -w / 2 + padLeft + finalLogoW / 2;
            const targetCenterY = -h / 2 + padTop + finalLogoH / 2;

            const curX = 0 + (targetCenterX - 0) * ease;
            const curY = targetLiftY + (targetCenterY - targetLiftY) * ease;

            gsap.set(logo, {
              x: curX,
              y: curY,
            });
          }
        },
      });
    }, heroContainerRef);

    return () => ctx.revert();
  }, [isRevealed, animationKey]);

  // Derived sub-phase progress values
  const {
    asciiProgress,
    asciiOpacity,
    particleProgress,
    particleOpacity,
    particleActive,
    galleryProgress,
    galleryActive,
  } = useMemo(() => {
    const p = scrollProgress;

    // Phase 1: Real Photo to ASCII top-to-bottom wipe (p: 0.0 -> 0.22)
    const u1 = Math.min(1, Math.max(0, p / 0.22));

    // Ascii canvas opacity: fades out cleanly as particles scatter
    let aOpacity = 1;
    if (p > 0.22) {
      aOpacity = Math.max(0, 1 - (p - 0.22) / 0.05);
    }

    // Phase 2 & 3: Particle Morph Canvas
    // Stays active throughout Phase 2 AND Phase 3 (p: 0.18 -> 0.98)
    // Assembles into EXPERIENCES quickly, then remains firmly at screen center during card stream!
    const pActive = p >= 0.18 && p <= 0.98;
    let pProgress = 0;
    let pOpacity = 1;

    if (p >= 0.22) {
      if (p <= 0.34) {
        // Shatter & assemble — compressed to 12% of scroll for a snappy, quick morph
        const raw = (p - 0.22) / 0.12;
        // Power-2 ease-in: starts slow, accelerates hard into formation
        pProgress = raw * raw;
      } else {
        // Locked in place as the ASCII word "EXPERIENCES"
        pProgress = 1.0;
      }
    }

    if (p > 0.90) {
      // Smooth fade out right as showcase stream completes and next section unpins
      pOpacity = Math.max(0, 1 - (p - 0.90) / 0.08);
    }

    // Phase 3: Square Showcase Cards Stream (p: 0.35 -> 0.93)
    const gActive = p >= 0.32 && p <= 0.96;
    let gProgress = 0;
    if (p >= 0.35) {
      gProgress = Math.min(1, Math.max(0, (p - 0.35) / 0.58));
    }

    return {
      asciiProgress: u1,
      asciiOpacity: aOpacity,
      particleProgress: pProgress,
      particleOpacity: pOpacity,
      particleActive: pActive,
      galleryProgress: gProgress,
      galleryActive: gActive,
    };
  }, [scrollProgress]);

  return (
    <div
      ref={heroContainerRef}
      id="hero-scroll-container"
      className="relative w-full h-[340vh] bg-transparent text-foreground select-none"
    >
      {/* Sticky Pinned Stage Viewport */}
      <section
        ref={stickyStageRef}
        id="hero-section"
        className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-transparent"
      >
        {/* Stage Content: Canvas, particles & showcase cards seamlessly unpin into next section */}
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center overflow-hidden"
        >
          {/* Layer 2: WebGL Photo & ASCII Transition Canvas (z-20: IN FRONT OF the logo initially!) */}
          <div
            ref={asciiWrapRef}
            className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center will-change-opacity"
            style={{ opacity: asciiOpacity }}
          >
            {/* Desktop WebGL GLSL Shader Canvas — conditionally mounted on desktop only */}
            {isDesktop && (
              <div className="hidden md:block w-full h-full pointer-events-none">
                <AsciiHeroCanvas
                  isRevealed={isRevealed}
                  asciiProgress={asciiProgress}
                  opacity={asciiOpacity}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Mobile Fallback: Static hero image — visible on sm/md, hidden on md+ */}
            <div className="flex md:hidden w-full h-full items-end justify-center pointer-events-none overflow-hidden">
              <Image
                src="/hero.webp"
                alt="Ashutosh Sharan - Raven"
                width={1086}
                height={724}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="h-[72vh] sm:h-[80vh] w-auto max-w-none object-contain object-bottom select-none translate-x-[8%]"
                draggable={false}
              />
            </div>
          </div>

          {/* Layer 3: Pure ASCII Particle "EXPERIENCES" Morph Canvas (z-25, strictly ASCII letters only!) */}
          <AsciiParticleMorphCanvas
            active={particleActive}
            progress={particleProgress}
            opacity={particleOpacity}
            className="absolute inset-0 z-25"
          />

          {/* Layer 4: Dual Stream Square Showcase Cards (z-30, square 1:1 aspect with vertical clearance) */}
          <DualStreamShowcase
            active={galleryActive}
            progress={galleryProgress}
          />

        </div>

        {/* Layer 1: "Raven Ships" Nav Logo - FIXED so it NEVER leaves the screen! */}
        <div
          className={`fixed inset-x-0 top-0 h-screen flex flex-col items-center justify-center pointer-events-none ${
            scrollProgress > 0.22 ? "z-[100]" : "z-10"
          } px-4 sm:px-8`}
        >
          <div
            ref={logoContainerRef}
            onClick={() => {
              if (scrollProgress > 0.15) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`relative inline-flex flex-col gap-0 items-end select-none will-change-transform ${
              scrollProgress > 0.15 ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
            }`}
            title={scrollProgress > 0.15 ? "Raven Ships — Scroll to top" : undefined}
          >
            {/* RAVEN */}
            <div
              ref={ravenWrapRef}
              className="relative inline-block font-stalinist-one leading-none tracking-tight will-change-transform"
              style={{
                fontSize: isRevealed ? "clamp(72px, 12.5vw, 240px)" : undefined,
              }}
            >
              <span
                ref={ravenStrokedRef}
                className="inline-block will-change-[clip-path]"
              >
                <span
                  className="inline-block text-transparent transition-colors duration-300"
                  style={{
                    WebkitTextStroke: `2px ${isMenuOpen ? "#ffffff" : "#1e1e1e"}`,
                  }}
                >
                  R
                </span>
                <DistressedText
                  stroked
                  strokeWidth={2}
                  strokeColor="#DC143C"
                  color="#DC143C"
                  inlineChar
                  className="mr-[-0.06em] text-[#DC143C]"
                >
                  a
                </DistressedText>
                <span
                  className="inline-block text-transparent transition-colors duration-300"
                  style={{
                    WebkitTextStroke: `2px ${isMenuOpen ? "#ffffff" : "#1e1e1e"}`,
                  }}
                >
                  ven
                </span>
              </span>
              <span
                ref={ravenFilledRef}
                className="absolute inset-0 inline-block will-change-[clip-path]"
              >
                <span
                  className={`inline-block transition-colors duration-300 ${
                    isMenuOpen ? "text-white" : "text-[#1e1e1e]"
                  }`}
                >
                  R
                </span>
                <DistressedText
                  color="#DC143C"
                  inlineChar
                  className="mr-[-0.06em] text-[#DC143C]"
                >
                  a
                </DistressedText>
                <span
                  className={`inline-block transition-colors duration-300 ${
                    isMenuOpen ? "text-white" : "text-[#1e1e1e]"
                  }`}
                >
                  ven
                </span>
              </span>
            </div>

            {/* SHIPS */}
            <div
              ref={shipsWrapRef}
              className="inline-block font-stalinist-one leading-none tracking-tight text-right will-change-transform"
              style={{
                fontSize: isRevealed ? "clamp(25px, 4.38vw, 84px)" : undefined,
              }}
            >
              <span
                ref={shipsTextRef}
                className="inline-block text-transparent transition-colors duration-300"
                style={{
                  WebkitTextStroke: `1.6px ${isMenuOpen ? "#ffffff" : "#1e1e1e"}`,
                }}
              >
                Ships
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}