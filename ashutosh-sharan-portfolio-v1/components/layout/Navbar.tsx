"use client";

import { useRef, useEffect, useState } from "react";
import { useMenu } from "./MenuContext";
import { usePathname } from "@/i18n/routing";
import { gsap, useGSAP, CustomEase } from "@/lib/gsap";
import { TextMaskHover } from "./TextMaskHover";

interface NavbarProps {
  brandName?: string;
  brandHref?: string;
}

export function Navbar({ brandHref = "/" }: NavbarProps) {
  const menuTextRef = useRef<HTMLDivElement>(null);
  const menuCircleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const pathname = usePathname();

  const lastScrollY = useRef(0);
  const accumulatedScrollUp = useRef(0);
  const isVisible = useRef(true);

  // Circle internal animation refs
  const circleBgRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);

  // Toggle & Hover Animations
  useGSAP(
    () => {
      try {
        CustomEase.create("menuEase", "M0,0 C0.16,1 0.3,1 1,1");
      } catch {}

      const circleBg = circleBgRef.current;
      const circleBorder = menuCircleRef.current;
      const line1 = line1Ref.current;
      const line2 = line2Ref.current;
      const iconContainer = iconContainerRef.current;

      if (!circleBg || !circleBorder || !line1 || !line2 || !iconContainer) return;

      if (isMenuOpen) {
        // Open state: lines form 'X'
        gsap.to(line1, { y: 0, rotation: 45, duration: 0.5, ease: "menuEase" });
        gsap.to(line2, { y: 0, rotation: 135, duration: 0.5, ease: "menuEase" });

        if (isHovered) {
          gsap.to(circleBg, { backgroundColor: "#DC143C", duration: 0.45, ease: "menuEase" });
          gsap.to(circleBorder, { borderColor: "transparent", duration: 0.45, ease: "menuEase" });
          gsap.to([line1, line2], { backgroundColor: "#000000", duration: 0.45, ease: "menuEase" });
          gsap.to(iconContainer, { rotation: 360, duration: 0.65, ease: "menuEase" });
        } else {
          gsap.to(circleBg, { backgroundColor: "transparent", duration: 0.45, ease: "menuEase" });
          gsap.to(circleBorder, { borderColor: "#ffffff", duration: 0.45, ease: "menuEase" });
          gsap.to([line1, line2], { backgroundColor: "#ffffff", duration: 0.45, ease: "menuEase" });
          gsap.to(iconContainer, { rotation: 0, duration: 0.65, ease: "menuEase" });
        }
      } else {
        // Closed state
        gsap.to(iconContainer, { rotation: 0, duration: 0.5, ease: "menuEase" });

        if (isHovered) {
          // Hover: solid Crimson fill + morph to plus '+'
          gsap.to(circleBg, { backgroundColor: "#DC143C", duration: 0.45, ease: "menuEase" });
          gsap.to(circleBorder, { borderColor: "transparent", duration: 0.45, ease: "menuEase" });
          gsap.to([line1, line2], { backgroundColor: "#000000", duration: 0.45, ease: "menuEase" });
          gsap.to(line1, { y: 0, rotation: 0, duration: 0.5, ease: "menuEase" });
          gsap.to(line2, { y: 0, rotation: 90, duration: 0.5, ease: "menuEase" });
        } else if (isScrolled) {
          // Scrolled reveal state: solid Crimson circle with '+' icon
          gsap.to(circleBg, { backgroundColor: "#DC143C", duration: 0.45, ease: "menuEase" });
          gsap.to(circleBorder, { borderColor: "transparent", duration: 0.45, ease: "menuEase" });
          gsap.to([line1, line2], { backgroundColor: "#000000", duration: 0.45, ease: "menuEase" });
          gsap.to(line1, { y: 0, rotation: 0, duration: 0.5, ease: "menuEase" });
          gsap.to(line2, { y: 0, rotation: 90, duration: 0.5, ease: "menuEase" });
        } else {
          // Normal top-of-page state: transparent circle with white border + two parallel bars
          gsap.to(circleBg, { backgroundColor: "transparent", duration: 0.45, ease: "menuEase" });
          gsap.to(circleBorder, { borderColor: "#ffffff", duration: 0.45, ease: "menuEase" });
          gsap.to([line1, line2], { backgroundColor: "#ffffff", duration: 0.45, ease: "menuEase" });
          gsap.to(line1, { y: -3, rotation: 0, duration: 0.5, ease: "menuEase" });
          gsap.to(line2, { y: 3, rotation: 0, duration: 0.5, ease: "menuEase" });
        }
      }
    },
    { dependencies: [isHovered, isMenuOpen, isScrolled] }
  );

  // Scroll Direction Listener (Hide on scroll down, Show on scroll up)
  useEffect(() => {
    isVisible.current = true;
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
    accumulatedScrollUp.current = 0;

    if (menuTextRef.current && menuCircleRef.current && buttonRef.current) {
      gsap.set([menuTextRef.current, menuCircleRef.current, buttonRef.current], {
        clearProps: "transform,opacity",
      });
    }

    if (isMenuOpen) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible at the top
      if (currentScrollY <= 15) {
        setIsScrolled(false);
        if (!isVisible.current) {
          isVisible.current = true;
          if (menuTextRef.current && menuCircleRef.current && buttonRef.current) {
            gsap.to([menuTextRef.current, menuCircleRef.current, buttonRef.current], {
              x: 0,
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        }
        accumulatedScrollUp.current = 0;
        lastScrollY.current = currentScrollY;
        return;
      }

      setIsScrolled(true);
      const diff = currentScrollY - lastScrollY.current;

      if (diff > 0) {
        // Scrolling down -> Hide Navbar
        accumulatedScrollUp.current = 0;
        if (isVisible.current) {
          isVisible.current = false;
          if (menuTextRef.current && menuCircleRef.current && buttonRef.current) {
            gsap.to([menuTextRef.current, menuCircleRef.current, buttonRef.current], {
              x: 100,
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        }
      } else if (diff < 0) {
        // Scrolling up -> Check 25px threshold
        accumulatedScrollUp.current += Math.abs(diff);
        if (accumulatedScrollUp.current >= 25 && !isVisible.current) {
          isVisible.current = true;
          if (menuTextRef.current && menuCircleRef.current && buttonRef.current) {
            gsap.to([menuTextRef.current, menuCircleRef.current, buttonRef.current], {
              x: 0,
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen, pathname]);

  return (
    <>
      {/* 1. Right Corner: Text Layer (mix-blend-difference) */}
      <div
        ref={menuTextRef}
        data-navbar-item
        className="fixed top-6 right-[96px] z-50 mix-blend-difference pointer-events-none select-none text-[14px] uppercase font-mono tracking-widest text-white leading-none flex items-center h-12"
      >
        <TextMaskHover text={isMenuOpen ? "CLOSE" : "MENU"} isHovered={isHovered} />
      </div>

      {/* 3. Right Corner: Circle Indicator Layer */}
      <div
        ref={menuCircleRef}
        data-navbar-item
        className={`fixed top-6 right-8 z-50 pointer-events-none w-12 h-12 rounded-full border-2 border-white flex items-center justify-center overflow-hidden transition-all duration-300 ${
          !isHovered && !isScrolled ? "mix-blend-difference" : ""
        }`}
      >
        {/* Inner background fill on hover or scrolled state */}
        <div ref={circleBgRef} className="absolute inset-0 bg-transparent" />

        {/* Lines */}
        <div ref={iconContainerRef} className="w-5 h-5 relative flex items-center justify-center">
          <span
            ref={line1Ref}
            className="absolute w-5 h-[1.5px] bg-white rounded-full transition-transform"
          />
          <span
            ref={line2Ref}
            className="absolute w-5 h-[1.5px] bg-white rounded-full transition-transform"
          />
        </div>
      </div>

      {/* 4. Interactive Overlay Trigger (Handles Hover & Click smoothly) */}
      <button
        ref={buttonRef}
        data-navbar-item
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-6 right-8 w-40 h-12 z-50 bg-transparent cursor-pointer focus:outline-none"
        aria-label={isMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
      />
    </>
  );
}