"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePathname } from "@/i18n/routing";

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      // Smooth entrance transition on route change
      gsap.fromTo(
        container,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "transform", // Ensures transform is cleared so position: sticky is never broken
        }
      );
    },
    { scope: containerRef, dependencies: [pathname] }
  );

  return (
    <div ref={containerRef} className="w-full bg-transparent">
      {children}
    </div>
  );
}
