"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "@/i18n/routing";
import { usePreloader } from "@/components/providers/PreloaderProvider";
import { PRELOADER_CONFIG } from "@/config/preloader";

export function Preloader() {
  const pathname = usePathname();
  const { isLoading, completePreloader } = usePreloader();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoBoxRef = useRef<HTMLDivElement>(null);
  const ravenWrapRef = useRef<HTMLDivElement>(null);
  const ravenStrokedRef = useRef<HTMLSpanElement>(null);
  const ravenFilledRef = useRef<HTMLSpanElement>(null);
  const shipsWrapRef = useRef<HTMLDivElement>(null);

  // Homepage handles the full 4-step sequence inside its own HeroSection
  const isHomepage = pathname === "/" || pathname === "/en";

  useGSAP(
    () => {
      // If disabled, not loading, or on homepage, do not run the layout preloader
      if (!PRELOADER_CONFIG.ENABLED || !isLoading || isHomepage) {
        completePreloader();
        return;
      }

      const container = containerRef.current;
      const logoBox = logoBoxRef.current;
      const ravenWrap = ravenWrapRef.current;
      const ravenStroked = ravenStrokedRef.current;
      const ravenFilled = ravenFilledRef.current;
      const shipsWrap = shipsWrapRef.current;

      if (!container || !logoBox || !ravenWrap || !ravenStroked || !ravenFilled || !shipsWrap) {
        completePreloader();
        return;
      }

      // Fluid Clamp Utility: mimics CSS clamp(min, val, max)
      const clampPx = (min: number, preferredVw: number, max: number) =>
        Math.round(Math.min(Math.max((window.innerWidth * preferredVw) / 100, min), max));

      const initialFontSize = clampPx(24, 2.5, 36);
      const step3RavenSize = clampPx(48, 6.5, 102);

      // Initial state with fluid clamp sizing
      gsap.set(logoBox, { opacity: 0 });
      gsap.set([ravenWrap, shipsWrap], { fontSize: `${initialFontSize}px` });
      gsap.set(ravenFilled, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(ravenStroked, { clipPath: "inset(0 0 0 0%)" });

      const shipsWidth = shipsWrap.offsetWidth || 140;
      const ravenHeight = ravenWrap.offsetHeight || 36;
      gsap.set(shipsWrap, {
        x: shipsWidth + 18,
        y: -ravenHeight,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          completePreloader();
        },
      });

      // -------------------------------------------------------------
      // STEP 1: Blank Screen -> Centered "Raven Ships" at fluid clamp (Outline only)
      // -------------------------------------------------------------
      tl.to(logoBox, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });

      tl.to({}, { duration: 0.2 });

      // -------------------------------------------------------------
      // STEP 2: Left-to-Right Stencil Wipe Fill on "Raven" (#1e1e1e)
      // -------------------------------------------------------------
      const wipe = { progress: 0 };
      tl.to(wipe, {
        progress: 100,
        duration: 0.85,
        ease: "power2.inOut",
        onUpdate: () => {
          const p = wipe.progress;
          ravenFilled.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
          ravenStroked.style.clipPath = `inset(0 0 0 ${p}%)`;
        },
      });

      tl.to({}, { duration: 0.2 });

      // -------------------------------------------------------------
      // STEP 3: "Raven" grows to fluid clamp (clamp(48px, 6.5vw, 102px))
      // -------------------------------------------------------------
      tl.to(
        ravenWrap,
        {
          fontSize: `${step3RavenSize}px`,
          duration: 0.8,
          ease: "power3.inOut",
        },
        "step3"
      );

      tl.to(
        shipsWrap,
        {
          x: 0,
          y: 6,
          duration: 0.65,
          ease: "power2.out",
        },
        "step3+=0.15"
      );

      tl.to({}, { duration: 0.35 });

      // Fade out preloader to reveal the other page
      tl.to(container, {
        opacity: 0,
        duration: 0.6,
        ease: "power3.inOut",
      });
    },
    { scope: containerRef, dependencies: [isLoading, isHomepage] }
  );

  if (!PRELOADER_CONFIG.ENABLED || !isLoading || isHomepage) return null;

  return (
    <div
      ref={containerRef}
      id="site-preloader"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-background  select-none pointer-events-auto"
    >
      <div
        ref={logoBoxRef}
        className="relative inline-flex flex-col items-end will-change-transform"
      >
        {/* Raven */}
        <div
          ref={ravenWrapRef}
          className="relative inline-block font-stalinist-one leading-[0.88] tracking-tight"
        >
          <span
            ref={ravenStrokedRef}
            className="inline-block text-transparent [-webkit-text-stroke:1.6px_#1e1e1e]"
          >
            Raven
          </span>
          <span
            ref={ravenFilledRef}
            className="absolute inset-0 inline-block text-[#1e1e1e]"
          >
            Raven
          </span>
        </div>

        {/* Ships */}
        <div
          ref={shipsWrapRef}
          className="inline-block font-stalinist-one leading-[0.88] tracking-tight text-right will-change-transform"
        >
          <span className="inline-block text-transparent [-webkit-text-stroke:1.5px_#1e1e1e]">
            Ships
          </span>
        </div>
      </div>
    </div>
  );
}
