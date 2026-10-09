"use client";

import React, { useRef, useState } from "react";
import { useMenu } from "./MenuContext";
import { gsap, useGSAP } from "@/lib/gsap";
import { TextMaskHover } from "./TextMaskHover";

interface MenuButtonProps {
  className?: string;
}

export function MenuButton({ className }: MenuButtonProps) {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const [isHovered, setIsHovered] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const circle = circleRef.current;
      const line1 = line1Ref.current;
      const line2 = line2Ref.current;
      const iconContainer = iconContainerRef.current;
      const text = textRef.current;

      if (!circle || !line1 || !line2 || !iconContainer || !text) return;

      // Circle fill & line colors syncing on hover
      if (isHovered) {
        gsap.to(circle, {
          backgroundColor: "#DC143C",
          borderColor: "transparent",
          duration: 0.38,
          ease: "menuEase",
        });
        gsap.to([line1, line2], {
          backgroundColor: "#FFFFFF",
          duration: 0.38,
          ease: "menuEase",
        });
      } else {
        gsap.to(circle, {
          backgroundColor: "transparent",
          borderColor: "rgba(30, 30, 30, 0.35)",
          duration: 0.38,
          ease: "menuEase",
        });
        gsap.to([line1, line2], {
          backgroundColor: "#1A1A1A",
          duration: 0.38,
          ease: "menuEase",
        });
      }

      // Line kinematics & morphing
      if (isMenuOpen) {
        // Cross state 'X'
        gsap.to(line1, {
          y: 0,
          rotation: 45,
          duration: 0.45,
          ease: "menuEase",
        });
        gsap.to(line2, {
          y: 0,
          rotation: 135,
          duration: 0.45,
          ease: "menuEase",
        });

        // Spin complete 360 on hover when menu is open
        if (isHovered) {
          gsap.to(iconContainer, {
            rotation: 360,
            duration: 0.6,
            ease: "menuEase",
          });
        } else {
          gsap.to(iconContainer, {
            rotation: 0,
            duration: 0.6,
            ease: "menuEase",
          });
        }
      } else {
        // Reset container rotation
        gsap.to(iconContainer, {
          rotation: 0,
          duration: 0.45,
          ease: "menuEase",
        });

        if (isHovered) {
          // Morph into plus '+' on hover
          gsap.to(line1, {
            y: 0,
            rotation: 0,
            duration: 0.45,
            ease: "menuEase",
          });
          gsap.to(line2, {
            y: 0,
            rotation: 90,
            duration: 0.45,
            ease: "menuEase",
          });
        } else {
          // Standard parallel lines
          gsap.to(line1, {
            y: -2.5,
            rotation: 0,
            duration: 0.45,
            ease: "menuEase",
          });
          gsap.to(line2, {
            y: 2.5,
            rotation: 0,
            duration: 0.45,
            ease: "menuEase",
          });
        }
      }
    },
    { dependencies: [isHovered, isMenuOpen], scope: buttonRef }
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsMenuOpen((prev) => !prev)}
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      aria-expanded={isMenuOpen}
      className={`group flex items-center gap-2.5 sm:gap-3 cursor-pointer focus:outline-none py-1 select-none text-foreground transition-opacity ${
        className || ""
      }`}
    >
      {/* Dynamic text using custom text mask hover effect */}
      <span
        ref={textRef}
        className="text-xs sm:text-[13px] uppercase font-mono tracking-widest text-foreground group-hover:text-[#DC143C] transition-colors duration-300 font-semibold"
      >
        <TextMaskHover text={isMenuOpen ? "CLOSE" : "MENU"} isHovered={isHovered} />
      </span>

      {/* Circle with two dynamic lines (resized to match portfolio layout: ~36-38px) */}
      <div
        ref={circleRef}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-foreground/35 flex items-center justify-center relative overflow-hidden transition-colors"
      >
        <div ref={iconContainerRef} className="w-4 h-4 relative flex items-center justify-center">
          <span
            ref={line1Ref}
            className="absolute w-4 h-[1.5px] bg-foreground rounded-full pointer-events-none"
          />
          <span
            ref={line2Ref}
            className="absolute w-4 h-[1.5px] bg-foreground rounded-full pointer-events-none"
          />
        </div>
      </div>
    </button>
  );
}
