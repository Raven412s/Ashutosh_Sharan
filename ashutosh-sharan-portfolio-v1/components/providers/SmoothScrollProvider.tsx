"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import Lenis, { LenisOptions } from "lenis";
import { useMediaQuery, useWindowSize } from "hamo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin with GSAP on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollToOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
  lock?: boolean;
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
  getLenis: () => Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
  stop: () => void;
  start: () => void;
  resize: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  getLenis: () => null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
  resize: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
  options?: Partial<LenisOptions>;
}

export function SmoothScrollProvider({
  children,
  options,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  // Responsive & device-specific detection via hamo
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useEffect(() => {
    // Determine optimized settings based on device capabilities & accessibility
    const isReduced = prefersReducedMotion === true;
    const isTouch = isTouchDevice === true || isMobile === true;

    // Device-by-device tuned configuration
    const lenis = new Lenis({
      // Respect accessibility preferences
      duration: isReduced ? 0.001 : isTouch ? 1.0 : 1.2,
      easing: isReduced
        ? (t) => t
        : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth cubic exponential deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !isReduced,
      // For touch devices: Keep momentum natural without CPU-intensive virtual touch lag
      touchMultiplier: isTouch ? 1.2 : 1.5,
      wheelMultiplier: 1.0,
      autoResize: true,
      syncTouch: false, // Prevents interfering with native 120Hz mobile touch momentum
      ...options,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll events with GSAP ScrollTrigger
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    // Connect GSAP ticker to Lenis requestAnimationFrame loop with lag smoothing disabled for perfect lockstep
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateRaf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isTouchDevice, isMobile, prefersReducedMotion, options]);

  // Recalculate dimensions & ScrollTrigger whenever window dimensions change via hamo
  useEffect(() => {
    if (!lenisRef.current) return;

    lenisRef.current.resize();
    ScrollTrigger.refresh();
  }, [windowWidth, windowHeight]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, scrollOptions?: ScrollToOptions) => {
      lenisRef.current?.scrollTo(target, scrollOptions);
    },
    []
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const resize = useCallback(() => {
    lenisRef.current?.resize();
    ScrollTrigger.refresh();
  }, []);

  const getLenis = useCallback(() => lenisRef.current, []);

  const contextValue = useMemo(() => {
    return {
      get lenis() {
        return lenisRef.current;
      },
      getLenis,
      scrollTo,
      stop,
      start,
      resize,
    };
  }, [getLenis, scrollTo, stop, start, resize]);

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
