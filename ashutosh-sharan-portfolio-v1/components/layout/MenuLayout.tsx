"use client";

import React, { useRef, useEffect, useState } from "react";
import { useMenu } from "./MenuContext";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { usePathname } from "@/i18n/routing";
import { Navbar } from "./Navbar";
import { MenuLink } from "./MenuLink";
import { AnimatePresence, motion } from "framer-motion";
import { FrozenRoute } from "./FrozenRoute";
import { FaInstagram, FaLinkedin, FaYoutube, FaTwitter, FaPinterest } from "react-icons/fa";

interface MenuItem {
  label: string;
  href: string;
}

interface MenuColumn {
  links: MenuItem[];
  showSocials?: boolean;
}

const MENU_COLUMNS: MenuColumn[] = [
  {
    links: [
      { label: "What We Do", href: "/works" },
      { label: "Our Process", href: "/about" },
      { label: "Our Creations", href: "/works" },
    ],
  },
  {
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/lab" },
      { label: "Contact", href: "mailto:ashutoshsharan412@gmail.com" },
    ],
  },
  {
    links: [{ label: "Meet the Team", href: "/about" }],
    showSocials: true,
  },
];

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com", icon: <FaInstagram /> },
  { name: "LinkedIn", href: "https://linkedin.com", icon: <FaLinkedin /> },
  { name: "YouTube", href: "https://youtube.com", icon: <FaYoutube /> },
  { name: "X", href: "https://x.com", icon: <FaTwitter /> },
  { name: "Pinterest", href: "https://pinterest.com", icon: <FaPinterest /> },
];

interface MenuLayoutProps {
  children: React.ReactNode;
}

export function MenuLayout({ children }: MenuLayoutProps) {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const pathname = usePathname();

  const layoutRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const clipWrapperRef = useRef<HTMLDivElement>(null);
  const innerPageRef = useRef<HTMLDivElement>(null);
  const backdropSvgRef = useRef<SVGSVGElement>(null);
  const maskCutoutRef = useRef<SVGRectElement>(null);
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  // Track page transitions: any persistent CSS transform breaks position: sticky and position: fixed
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-close menu gracefully on route change and reset scroll
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setIsTransitioning(true);
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
      if (isMenuOpen) {
        const timer = setTimeout(() => {
          setIsMenuOpen(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isMenuOpen, setIsMenuOpen]);

  // Lock body scroll ONLY when menu is active
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isMenuOpen) {
      document.documentElement.classList.add("scrollbar-none");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.classList.remove("scrollbar-none");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.classList.remove("scrollbar-none");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Helper to accurately compute sticky compensation within containing block without upward jumps
  const getStickyCompensation = (
    el: HTMLElement,
    container: HTMLElement,
    scrollY: number
  ): number => {
    const parent = el.parentElement;
    if (!parent) return 0;

    let parentTop = 0;
    let curr: HTMLElement | null = parent;
    while (curr && curr !== container) {
      parentTop += curr.offsetTop;
      curr = curr.offsetParent as HTMLElement | null;
    }

    const parentHeight = parent.offsetHeight;
    const elHeight = el.offsetHeight;
    const maxStick = Math.max(0, parentHeight - elHeight);
    const scrollRel = scrollY - parentTop;

    return Math.max(0, Math.min(scrollRel, maxStick));
  };

  // Sync mask dimensions if window is resized while menu is open
  useEffect(() => {
    const handleResize = () => {
      if (!maskCutoutRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const vh50 = h * 0.5;
      const pad = w < 640 ? 16 : 24;
      if (isMenuOpen) {
        gsap.set(maskCutoutRef.current, {
          attr: {
            x: pad,
            y: vh50 + pad,
            width: Math.max(0, w - pad * 2),
            height: Math.max(0, vh50 - pad * 2),
            rx: pad,
            ry: pad,
          },
        });
      } else {
        gsap.set(maskCutoutRef.current, {
          attr: {
            x: 0,
            y: 0,
            width: w,
            height: h,
            rx: 0,
            ry: 0,
          },
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  useGSAP(
    () => {
      const menu = menuRef.current;
      const page = pageContainerRef.current;
      const clip = clipWrapperRef.current;
      const inner = innerPageRef.current;
      const backdropSvg = backdropSvgRef.current;
      const maskCutout = maskCutoutRef.current;

      if (!menu || !page || !clip || !inner || !backdropSvg || !maskCutout) return;

      const w = typeof window !== "undefined" ? window.innerWidth : 1920;
      const h = typeof window !== "undefined" ? window.innerHeight : 1080;
      const vh50 = h * 0.5;
      const pad = w < 640 ? 16 : 24;
      const targetH = Math.max(0, vh50 - pad * 2);

      if (isFirstRender.current) {
        if (!isMenuOpen) {
          gsap.set(".menu-item-anim", { yPercent: 110 });
          gsap.set(maskCutout, {
            attr: { x: 0, y: 0, width: w, height: h, rx: 0, ry: 0 },
          });
          gsap.set(backdropSvg, { visibility: "hidden" });
          isFirstRender.current = false;
          return;
        }
        isFirstRender.current = false;
      }

      if (isMenuOpen) {
        gsap.set(menu, { visibility: "visible" });
        gsap.set(backdropSvg, { visibility: "visible" });

        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        const targetY = vh50 + scrollY;

        // Compensate for CSS position: sticky elements accurately within their containing sections
        const stickyElements = inner.querySelectorAll<HTMLElement>(".sticky, [class*='sticky']");
        stickyElements.forEach((el) => {
          const comp = getStickyCompensation(el, inner, scrollY);
          el.dataset.menuStickyOffset = String(comp);
          el.style.transform = `translate3d(0, ${comp}px, 0)`;
        });

        // 1. Expand 50vh top drawer (transparent background so it uses the unified backdrop)
        gsap.to(menu, {
          height: "50vh",
          paddingTop: "6rem",
          paddingBottom: "2.5rem",
          duration: 0.75,
          ease: "menuEase",
        });

        // 2. Synchronously morph the backdrop mask cutout in lockstep with page shift
        gsap.to(maskCutout, {
          attr: {
            x: pad,
            y: vh50 + pad,
            width: Math.max(0, w - pad * 2),
            height: targetH,
            rx: pad,
            ry: pad,
          },
          duration: 0.75,
          ease: "menuEase",
        });

        // 3. Shift page wrapper down by 50vh + scrollY into a framed container
        gsap.to(page, {
          y: targetY,
          paddingTop: `${pad}px`,
          paddingBottom: `${pad}px`,
          paddingLeft: `${pad}px`,
          paddingRight: `${pad}px`,
          duration: 0.75,
          ease: "menuEase",
        });

        // 4. Shrink preview wrapper height to fit preview card
        gsap.to(clip, {
          height: targetH,
          duration: 0.75,
          ease: "menuEase",
        });

        // 5. Counter-translate inner content by -scrollY (zero jump, perfectly centered!)
        gsap.to(inner, {
          y: -scrollY,
          duration: 0.75,
          ease: "menuEase",
        });

        gsap.set(clip, { overflow: "hidden" });

        // 6. Reveal menu links upward from masked container
        gsap.fromTo(
          ".menu-item-anim",
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.75,
            ease: "power4.out",
            delay: 0.1,
          }
        );
      } else {
        // 1. Mask links back downward
        gsap.to(".menu-item-anim", {
          yPercent: 110,
          duration: 0.45,
          ease: "power3.in",
        });

        // 2. Collapse menu
        gsap.to(menu, {
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.75,
          ease: "menuEase",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });

        // 3. Expand backdrop mask cutout back to full screen seamlessly
        gsap.to(maskCutout, {
          attr: {
            x: 0,
            y: 0,
            width: w,
            height: h,
            rx: 0,
            ry: 0,
          },
          duration: 0.75,
          ease: "menuEase",
          onComplete: () => {
            gsap.set(backdropSvg, { visibility: "hidden" });
          },
        });

        // 4. Animate preview wrapper height back to full
        gsap.to(clip, {
          height: h,
          duration: 0.75,
          ease: "menuEase",
        });

        // 5. Animate page wrapper back to top & clear props so sticky and fixed are uninhibited
        gsap.to(page, {
          y: 0,
          paddingTop: "0px",
          paddingBottom: "0px",
          paddingLeft: "0px",
          paddingRight: "0px",
          duration: 0.75,
          ease: "menuEase",
          onComplete: () => {
            gsap.set(page, { clearProps: "all" });
            gsap.set(clip, { clearProps: "all" });
            if (page) page.style.overflow = "visible";
            if (clip) clip.style.overflow = "visible";

            // Revert sticky compensation transforms seamlessly
            const stickyElements = inner.querySelectorAll<HTMLElement>(".sticky, [class*='sticky']");
            stickyElements.forEach((el) => {
              el.style.transform = "";
              delete el.dataset.menuStickyOffset;
            });

            if (typeof document !== "undefined") {
              const frames = document.querySelectorAll(".page-frame");
              frames.forEach((frame) => {
                (frame as HTMLElement).style.transform = "";
                (frame as HTMLElement).style.willChange = "";
                gsap.set(frame, { clearProps: "overflowY,overflow,transform,willChange" });
              });
            }
            if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
            }
          },
        });

        // 6. Reset inner content offset
        gsap.to(inner, {
          y: 0,
          duration: 0.75,
          ease: "menuEase",
          onComplete: () => {
            gsap.set(inner, { clearProps: "all" });
            if (inner) inner.style.overflow = "visible";
          },
        });
      }
    },
    { dependencies: [isMenuOpen], scope: layoutRef }
  );

  return (
    <div
      ref={layoutRef}
      className={`min-h-screen text-foreground flex flex-col relative scrollbar-none ${
        isMenuOpen ? "overflow-hidden" : "overflow-visible"
      }`}
    >
      <Navbar />

      {/* Unified Dark Backdrop Overlay with Synchronized Mask Cutout */}
      <svg
        ref={backdropSvgRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-30"
        style={{ visibility: "hidden" }}
      >
        <defs>
          <mask id="portal-backdrop-mask">
            {/* White renders zinc-900 (#18181b) everywhere outside the container */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout reveals the fluid canvas gradient and children within the card */}
            <rect
              ref={maskCutoutRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx="0"
              ry="0"
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="#18181b" mask="url(#portal-backdrop-mask)" />
      </svg>

      {/* 50vh Menu Top Drawer */}
      <div
        ref={menuRef}
        style={{
          visibility: isMenuOpen ? "visible" : "hidden",
        }}
        className={`h-0 w-full overflow-hidden bg-transparent flex flex-col justify-center px-8 pt-0 pb-0 fixed top-0 left-0 z-40 scrollbar-none ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="max-w-full mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-x-8 pt-6 lg:px-2.5">
          {MENU_COLUMNS.map((column, colIndex) => (
            <div
              key={colIndex}
              className={`flex flex-col ${column.showSocials ? "gap-2 lg:gap-4 text-left" : "lg:gap-1"}`}
            >
              {column.links.map((link) => (
                <MenuLink
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  label={link.label}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}

              {column.showSocials && (
                <div className="overflow-hidden">
                  <div className="menu-item-anim flex items-center gap-2 lg:gap-1.5 mt-2">
                    {SOCIAL_LINKS.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={social.name}
                        className="w-8 h-8 rounded-md border border-zinc-700 hover:border-[#DC143C] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Padded Page container holding child segments */}
      <div
        ref={pageContainerRef}
        className="flex-1 w-full bg-transparent text-foreground relative flex flex-col scrollbar-none"
      >
        {/* Floating Box with White Border transition */}
        <div
          ref={clipWrapperRef}
          className={`flex-1 w-full h-full relative flex flex-col scrollbar-none transition-[border-radius,border-color] duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] border-2 ${
            isMenuOpen
              ? "border-white rounded-[24px] overflow-hidden shadow-2xl"
              : "border-transparent rounded-[0px] overflow-visible"
          }`}
        >
          {/* Inner Page with Counter-Scroll Offset */}
          <div
            ref={innerPageRef}
            className="flex-1 w-full min-h-full relative z-10 flex flex-col scrollbar-none bg-transparent"
            style={{
              transform: isMenuOpen ? undefined : "none",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={pathname}
                initial={{ x: "calc(100% + 10vw)", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100% - 10vw)", opacity: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                onAnimationStart={() => setIsTransitioning(true)}
                onAnimationComplete={() => {
                  setIsTransitioning(false);
                  if (typeof document !== "undefined") {
                    const frames = document.querySelectorAll(".page-frame");
                    frames.forEach((frame) => {
                      (frame as HTMLElement).style.transform = "";
                      (frame as HTMLElement).style.willChange = "";
                    });
                    if (typeof ScrollTrigger !== "undefined") {
                      ScrollTrigger.refresh();
                    }
                  }
                }}
                style={{
                  transform: isTransitioning ? undefined : "none",
                }}
                className="flex-1 flex flex-col w-full min-h-full relative z-[10] page-frame scrollbar-none bg-transparent"
              >
                <FrozenRoute>{children}</FrozenRoute>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
