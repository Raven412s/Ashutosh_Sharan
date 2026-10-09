"use client";

import React, { useRef } from "react";
import { useMenu } from "./MenuContext";
import { gsap, useGSAP } from "@/lib/gsap";
import { MenuLink } from "./MenuLink";

export function MenuDrawer() {
  const { isMenuOpen, closeMenu } = useMenu();
  const drawerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const drawer = drawerRef.current;
      if (!drawer) return;

      if (isMenuOpen) {
        gsap.to(drawer, {
          height: "min(44vh, 410px)",
          paddingTop: "5.25rem",
          paddingBottom: "1.5rem",
          duration: 0.65,
          ease: "menuEase",
        });
      } else {
        gsap.to(drawer, {
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.65,
          ease: "menuEase",
        });
      }
    },
    { dependencies: [isMenuOpen], scope: drawerRef }
  );

  return (
    <div
      ref={drawerRef}
      aria-hidden={!isMenuOpen}
      className="fixed top-0 left-0 right-0 z-40 h-0 min-h-0 overflow-hidden bg-[#111113]/95 text-zinc-100 backdrop-blur-2xl border-b border-white/10 shadow-2xl flex flex-col justify-end px-6 sm:px-12 md:px-16 pt-0 pb-0 select-none pointer-events-auto"
      style={{
        pointerEvents: isMenuOpen ? "auto" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 py-4 sm:py-6">
        {/* Column 1: Primary Editorial Links (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-2.5 sm:gap-3.5 justify-center">
          <MenuLink
            href="/works"
            label="Work"
            number="01"
            onClick={closeMenu}
          />
          <MenuLink
            href="/about"
            label="About"
            number="02"
            onClick={closeMenu}
          />
          <MenuLink
            href="/lab"
            label="Lab"
            number="03"
            onClick={closeMenu}
          />
          <MenuLink
            href="mailto:ashutoshsharan412@gmail.com"
            label="Contact"
            number="04"
            external
            onClick={closeMenu}
          />
        </div>

        {/* Column 2: Secondary Exploration & System Status (4 cols) */}
        <div className="md:col-span-4 flex flex-col justify-between gap-5 py-1">
          <div className="flex flex-col gap-2.5">
            <MenuLink
              href="/"
              label="Home"
              number="00"
              onClick={closeMenu}
            />
            <MenuLink
              href="/fonts412s"
              label="Fonts Lab"
              number="05"
              onClick={closeMenu}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-zinc-300 font-semibold">
                Available for Q2/Q3 2026
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-400">
              Creative Developer &amp; Systems Designer
            </p>
          </div>
        </div>

        {/* Column 3: Social Links & Meta Info (3 cols) */}
        <div className="md:col-span-3 flex flex-col justify-between gap-5 py-1 border-t md:border-t-0 md:border-l border-white/10 md:pl-8">
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">
              Connect
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-xs sm:text-[13px] text-zinc-300">
              <a
                href="https://github.com/Raven412s"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#DC143C] transition-colors py-0.5 inline-block w-fit"
              >
                GitHub ↗
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#DC143C] transition-colors py-0.5 inline-block w-fit"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#DC143C] transition-colors py-0.5 inline-block w-fit"
              >
                Twitter / X ↗
              </a>
              <a
                href="mailto:ashutoshsharan412@gmail.com"
                className="hover:text-[#DC143C] transition-colors py-0.5 inline-block w-fit"
              >
                Email ↗
              </a>
            </div>
          </div>

          <div className="font-mono text-[11px] text-zinc-400">
            <span>New Delhi, India</span>
            <br />
            <span>UTC+5:30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
