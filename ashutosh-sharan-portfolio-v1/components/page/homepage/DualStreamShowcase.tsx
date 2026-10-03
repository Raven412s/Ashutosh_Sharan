"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";

export interface ExperienceItem {
  id: number;
  title: string;
  category: string;
  year: string;
  src: string;
}

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: 1,
    title: "Voyager 2",
    category: "Generative Media & Editorial UI",
    year: "2025",
    src: "/experince-images/1.png",
  },
  {
    id: 2,
    title: "The Wild Life",
    category: "Interactive Spatial Storytelling",
    year: "2025",
    src: "/experince-images/2.png",
  },
  {
    id: 3,
    title: "Water Space",
    category: "Fluid Audio-Visual Interface",
    year: "2025",
    src: "/experince-images/3.png",
  },
  {
    id: 4,
    title: "Nat Geo Snake",
    category: "High-Craft WebGL Brand Identity",
    year: "2024",
    src: "/experince-images/4.png",
  },
  {
    id: 5,
    title: "Forma Studio",
    category: "Industrial E-Commerce Architecture",
    year: "2025",
    src: "/experince-images/5.png",
  },
  {
    id: 6,
    title: "Fossil Gen 5",
    category: "Precision Hardware Web Experience",
    year: "2024",
    src: "/experince-images/6.png",
  },
];

interface DualStreamShowcaseProps {
  progress: number; // 0.0 to 1.0 (Phase 3 scroll)
  active: boolean;
  className?: string;
}

export function DualStreamShowcase({
  progress,
  active,
  className = "",
}: DualStreamShowcaseProps) {
  // Responsive window width — updates on resize / orientation change
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Card dimensions: 1:1 Square Ratio (Smaller, punchy aesthetic)
  const cardSize = useMemo(() => {
    if (windowWidth < 640) return Math.min(windowWidth * 0.56, 210);
    if (windowWidth < 1024) return Math.min(windowWidth * 0.28, 240);
    return Math.min(windowWidth * 0.18, 270);
  }, [windowWidth]);

  const cardWidth = cardSize;
  const cardHeight = cardSize;
  const cardGap = isMobile ? 52 : 84;
  const stride = cardWidth + cardGap;
  const totalCount = EXPERIENCE_ITEMS.length;

  // Total horizontal travel distance from entrance on right to exit on left
  const startX = windowWidth * 0.88;
  const totalTravel = startX + totalCount * stride + windowWidth * 0.5;

  // Screen center coordinates for magnetic repulsion
  const screenCenterX = windowWidth / 2;

  // Maximum vertical deflection distance when parting around "EXPERIENCES"
  // Generous clearance ensures cards NEVER overlap the ASCII text at center
  const maxRepelDist = isMobile ? 200 : 280;
  // Repulsion influence sigma (how wide the avoidance zone is)
  const sigma = isMobile ? 220 : 340;

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Horizontal track of 1:1 Square cards */}
      <div className="absolute inset-0 pointer-events-none">
        {EXPERIENCE_ITEMS.map((item, index) => {
          // Base X coordinate as progress moves 0 -> 1
          const baseX =
            startX + index * stride - progress * totalTravel;

          // Card center X
          const cardCenterX = baseX + cardWidth / 2;
          const deltaX = cardCenterX - screenCenterX;

          // Gaussian repulsion factor around the center text
          const repelEnvelope = Math.exp(
            -(deltaX * deltaX) / (2 * sigma * sigma)
          );

          // Odd cards (0, 2, 4) arc UPWARDS (-Y), Even cards (1, 3, 5) arc DOWNWARDS (+Y)
          const isOdd = index % 2 === 0;
          const sign = isOdd ? -1 : 1;
          const repelY = sign * maxRepelDist * repelEnvelope;

          // Dynamic aerodynamic tilt as cards dodge the center obstacle
          const rotZ = sign * (deltaX / sigma) * 3.5 * repelEnvelope;

          // Subtle scale compression under high repulsion
          const scale = 1.0 - 0.03 * repelEnvelope;

          // Opacity fade at extreme edges
          const distFromCenter = Math.abs(deltaX);
          const opacity = Math.max(
            0,
            Math.min(1, 1.4 - distFromCenter / (windowWidth * 0.85))
          );

          // Skip rendering if completely offscreen to save GPU
          if (
            baseX + cardWidth < -200 ||
            baseX > windowWidth + 200 ||
            opacity <= 0.01
          ) {
            return null;
          }

          return (
            <div
              key={item.id}
              className="absolute top-1/2 left-0 pointer-events-auto will-change-transform select-none group"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                transform: `translate3d(${baseX}px, calc(-50% + ${repelY}px), 0) rotate(${rotZ}deg) scale(${scale})`,
                opacity,
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
              }}
            >
              {/* Card Container with Brutalist Glass Border */}
              <div className="relative w-full h-full aspect-square rounded-2xl overflow-hidden border-2 border-foreground/15 bg-background/85 backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:border-foreground/40 group-hover:scale-[1.03]">
                {/* 1:1 Square Image */}
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 60vw, 300px"
                  priority={index < 3}
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none"
                  draggable={false}
                />

                {/* Subtle vignette shadow gradient for text contrast */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Card Header Tag */}
                <div className="absolute top-3.5 left-4 flex items-center gap-2">
                  <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-black/50 text-white/90 backdrop-blur-sm border border-white/10">
                    [0{item.id} / 06]
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/70">
                    {item.year}
                  </span>
                </div>

                {/* Card Footer Info */}
                <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between pointer-events-none">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60">
                      {item.category}
                    </span>
                    <h3 className="font-stalinist-one text-sm sm:text-lg text-white tracking-wide leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
