"use client";

import React, { useRef, ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "@/i18n/routing";
import { usePreloader } from "@/components/providers/PreloaderProvider";

interface PageTransitionProps {
  children: ReactNode;
}

// Set to true to re-enable page transition animations
const IS_ENABLED = false;

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { isLoading } = usePreloader();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!IS_ENABLED) return;
      // Avoid running page transition while initial preloader is still running
      if (isLoading) return;

      const tl = gsap.timeline();

      // -------------------------------------------------------------
      // Step-by-Step Page Transition Animation Boilerplate
      // You can customize enter/exit effects, wipes, and fades here:
      // -------------------------------------------------------------

      // Step 1: Smooth page content reveal
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    },
    { scope: containerRef, dependencies: [pathname, isLoading] }
  );

  if (!IS_ENABLED) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="w-full flex-1 flex flex-col">
      {/* Optional Page Transition Overlay / Curtain for wipe transitions */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-50 bg-black opacity-0"
      />
      {children}
    </div>
  );
}
