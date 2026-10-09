"use client";

import React, { useRef, useEffect } from "react";
import { gsap, CustomEase } from "@/lib/gsap";

interface TextMaskHoverProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

export function TextMaskHover({ text, isHovered, className = "" }: TextMaskHoverProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      CustomEase.create("menuEase", "M0,0 C0.16,1 0.3,1 1,1");
    } catch {}

    const charsOriginal = containerRef.current.querySelectorAll(".char-original");
    const charsClone = containerRef.current.querySelectorAll(".char-clone");

    if (isHovered) {
      gsap.to(charsOriginal, { yPercent: -130, duration: 0.55, stagger: 0.02, ease: "menuEase", overwrite: "auto" });
      gsap.to(charsClone, { yPercent: -130, duration: 0.55, stagger: 0.02, ease: "menuEase", overwrite: "auto" });
    } else {
      gsap.to(charsOriginal, { yPercent: 0, duration: 0.55, stagger: 0.02, ease: "menuEase", overwrite: "auto" });
      gsap.to(charsClone, { yPercent: 0, duration: 0.55, stagger: 0.02, ease: "menuEase", overwrite: "auto" });
    }
  }, [isHovered, text]);

  const characters = text.split("");

  return (
    <span
      ref={containerRef}
      className={`inline-flex overflow-hidden h-[1em] relative select-none leading-none items-center ${className}`}
    >
      {characters.map((char, index) => (
        <span
          key={index}
          className="relative inline-grid overflow-hidden h-[1em] leading-none pointer-events-none grid-cols-1 grid-rows-1"
        >
          <span className="char-original inline-block leading-none pointer-events-none col-start-1 row-start-1">
            {char === " " ? "\u00A0" : char}
          </span>
          <span className="char-clone translate-y-[130%] inline-block leading-none pointer-events-none col-start-1 row-start-1">
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}
