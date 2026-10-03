"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { usePreloader } from "../providers/PreloaderProvider";
import { DistressedText } from "@/components/typography/DistressedText";

type NavItem = {
  name: string;
  href: string;
  external?: boolean;
};

// Shown in the collapsed top-right quick nav — Work, About, Lab only.
const quickNavLinks: NavItem[] = [
  { name: "work", href: "/works" },
  { name: "about", href: "/about" },
  { name: "lab", href: "/lab" },
];

// Shown in the fullscreen overlay — Home first, Contact last.
const menuLinks: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/works" },
  { name: "About", href: "/about" },
  { name: "Lab", href: "/lab" },
  { name: "Contact", href: "mailto:ashutoshsharan412@gmail.com", external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();
  const { stop, start } = useSmoothScroll();
  const { isLoading } = usePreloader();
  const isHomepage = pathname === "/" || pathname === "/en";

  // Controlled visibility: On homepage, revealed when Step 4 triggers; on other pages, visible when preloader finishes
  const [homepageRevealed, setHomepageRevealed] = useState(false);
  const isNavbarVisible = isHomepage ? homepageRevealed : !isLoading;

  useEffect(() => {
    const handleReveal = () => {
      setHomepageRevealed(true);
    };
    const handleHide = () => {
      setHomepageRevealed(false);
    };

    window.addEventListener("navbar-reveal", handleReveal);
    window.addEventListener("navbar-hide", handleHide);

    return () => {
      window.removeEventListener("navbar-reveal", handleReveal);
      window.removeEventListener("navbar-hide", handleHide);
    };
  }, []);

  // Sync state on route change (React 19 pattern avoiding cascading renders)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    if (pathname === "/" || pathname === "/en") {
      setHomepageRevealed(false);
    }
  }

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock scroll via Lenis smoothly without window resize / ScrollTrigger thrashing
  useEffect(() => {
    if (isOpen) {
      stop();
    } else {
      start();
    }
    return () => {
      start();
    };
  }, [isOpen, stop, start]);

  // Animate open/close with a small delay to allow CSS transitions to run
  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsOpen((prev) => !prev);
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <>
      <style>{`
        /* Menu overlay: clip-path curtain reveal from top */
        .menu-overlay {
          clip-path: inset(0 0 100% 0);
          transition:
            clip-path 0.65s cubic-bezier(0.77, 0, 0.18, 1),
            opacity 0.1s linear;
          opacity: 0;
          pointer-events: none;
          visibility: hidden;
        }
        .menu-overlay.is-open {
          clip-path: inset(0 0 0% 0);
          opacity: 1;
          pointer-events: auto;
          visibility: visible;
        }

        /* Menu links: slide up from below on open */
        .menu-link-row {
          opacity: 0;
          transform: translateY(48px);
          transition:
            opacity 0.5s ease,
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .menu-overlay.is-open .menu-link-row {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stagger each row */
        .menu-overlay.is-open .menu-link-row:nth-child(1) { transition-delay: 0.18s; }
        .menu-overlay.is-open .menu-link-row:nth-child(2) { transition-delay: 0.26s; }
        .menu-overlay.is-open .menu-link-row:nth-child(3) { transition-delay: 0.34s; }
        .menu-overlay.is-open .menu-link-row:nth-child(4) { transition-delay: 0.42s; }
        .menu-overlay.is-open .menu-link-row:nth-child(5) { transition-delay: 0.50s; }

        /* Header + footer inside overlay */
        .menu-overlay .menu-header,
        .menu-overlay .menu-footer {
          opacity: 0;
          transform: translateY(-12px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .menu-overlay.is-open .menu-header,
        .menu-overlay.is-open .menu-footer {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.12s;
        }
      `}</style>

      {/* Top-Left Nav Logo on non-homepage pages */}
      {!isHomepage && (
        <div
          className={`fixed top-5 left-5 sm:top-8 sm:left-8 z-50 transition-all duration-500 ${
            isNavbarVisible
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none -translate-y-2"
          }`}
        >
          <Link
            href="/"
            className="inline-flex flex-col items-end select-none group cursor-pointer"
            title="Raven Ships — Homepage"
          >
            <div className="relative inline-block font-stalinist-one leading-[0.88] tracking-tight text-[28px] sm:text-[32px] text-foreground">
              <span>R</span>
              <DistressedText
                color="#DC143C"
                inlineChar
                className="mr-[-0.06em] text-[#DC143C]"
              >
                a
              </DistressedText>
              <span>ven</span>
            </div>
            <div
              className="inline-block font-stalinist-one leading-[0.88] tracking-tight text-right text-[10px] sm:text-[11px]"
              style={{ transform: "translate3d(0, 3px, 0)" }}
            >
              <span className="inline-block text-transparent [-webkit-text-stroke:0.45px_currentColor]">
                Ships
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Top-Right Navbar Container: Desktop = Column, Mobile = Row */}
      <header
        className={`fixed top-5 right-5 sm:top-8 sm:right-8 z-50 transition-all duration-500 navbar-header ${
          isNavbarVisible
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <nav
          aria-label="Primary Navigation"
          className="flex flex-row sm:flex-col items-center sm:items-end gap-3.5 sm:gap-2.5"
        >
          {/* Quick Nav Links (Visible when menu is closed) — always precedes the toggle */}
          <ul
            className={`order-1 navbar-quick-links flex flex-row sm:flex-col items-center sm:items-end gap-3.5 sm:gap-1.5 transition-all duration-300 ${
              isOpen
                ? "opacity-0 pointer-events-none -translate-x-2 sm:translate-x-0 sm:-translate-y-2"
                : "opacity-100 pointer-events-auto translate-x-0 translate-y-0"
            }`}
          >
            {quickNavLinks.map((link) => (
              <li key={link.name} className="navbar-link-item">
                <Link
                  href={link.href}
                  className="font-mono text-xs sm:text-[13px] tracking-widest text-foreground/80 hover:text-foreground transition-all duration-200 py-1 px-1.5 relative group inline-block"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 right-1.5 left-1.5 h-[1.5px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Interactive 3-Dot Morphing Menu Toggle — always last in the list */}
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className={`order-2 navbar-toggle-btn nav-dot-btn ${isOpen ? "is-open" : ""}`}
          >
            <span className="nav-dot nav-dot-left" aria-hidden="true" />
            <span className="nav-dot nav-dot-center" aria-hidden="true">
              <span className="nav-cross-line nav-cross-line-1" />
              <span className="nav-cross-line nav-cross-line-2" />
            </span>
            <span className="nav-dot nav-dot-right" aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Fullscreen Editorial Menu Overlay — Curtain clip-path reveal */}
      <div
        data-lenis-prevent
        className={`menu-overlay fixed inset-0 z-40 bg-[#F8F5F0]/98 backdrop-blur-md flex flex-col justify-between p-6 sm:p-12 md:p-16 ${
          isOpen ? "is-open" : ""
        }`}
        aria-hidden={!isOpen}
      >
        {/* Top Header inside Overlay */}
        <div className="menu-header flex items-center justify-between border-b border-foreground/10 pb-6 pt-2">
          <div className="flex flex-col">
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">
              Navigation
            </span>
            <span className="font-mono text-xs font-medium text-foreground">
              Ashutosh Sharan
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/60">
              Available for Q2/Q3 2026
            </span>
          </div>
        </div>

        {/* Center Editorial Links */}
        <div className="my-auto py-8">
          <ul className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            {menuLinks.map((link, i) => {
              const index = String(i + 1).padStart(2, "0");

              const content = (
                <>
                  <span className="font-mono text-xs sm:text-sm text-foreground/40 group-hover:text-[#DC143C] transition-colors">
                    {index}
                  </span>
                  <span className="font-stalinist-one text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground group-hover:text-[#DC143C] transition-colors duration-200">
                    {link.name}
                  </span>
                </>
              );

              return (
                <li key={link.name} className="menu-link-row overflow-hidden">
                  {link.external ? (
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-baseline gap-4 sm:gap-8 transition-transform duration-300 hover:translate-x-3"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-baseline gap-4 sm:gap-8 transition-transform duration-300 hover:translate-x-3"
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Metadata & Socials */}
        <div className="menu-footer border-t border-foreground/10 pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-foreground/60">
          <div>
            <p className="text-foreground">Creative Developer &amp; Systems Designer</p>
            <p className="mt-1 text-foreground/50">New Delhi, India · UTC+5:30</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-foreground/80">
            <a
              href="https://github.com/Raven412s"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              GitHub ↗
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Twitter / X ↗
            </a>
            <a
              href="mailto:ashutoshsharan412@gmail.com"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Email ↗
            </a>
          </div>
        </div>
      </div>
    </>
  );
}