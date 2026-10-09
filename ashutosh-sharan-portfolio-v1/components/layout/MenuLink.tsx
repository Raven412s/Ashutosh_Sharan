"use client";

import Link from "next/link";
import React from "react";

interface MenuLinkProps {
  href: string;
  label: string;
  number?: string;
  onClick?: () => void;
  external?: boolean;
}

export function MenuLink({ href, label, number, onClick, external }: MenuLinkProps) {
  return (
    <div className="overflow-hidden py-1">
      {external ? (
        <a
          href={href}
          onClick={onClick}
          target="_blank"
          rel="noopener noreferrer"
          className="menu-item-anim group relative flex items-center w-fit py-1 pl-0 hover:pl-10 gap-1.5 transition-[padding] duration-300 ease-out select-none"
        >
          {/* Sliding Brand Crimson Pill with Arrow Icon */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-0 w-6 h-6 md:w-10 md:h-8 rounded-sm bg-[#DC143C] flex items-center justify-center transition-transform duration-300 ease-out shadow-md">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950 translate-x-[0.5px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-[clamp(1.2rem,2.1vw,1.85rem)] font-[family-name:var(--font-stalinist-one)] max-w-max ml-0 group-hover:ml-1.5 uppercase tracking-tight text-white leading-tight block">
            {label}
          </span>
        </a>
      ) : (
        <Link
          href={href}
          onClick={onClick}
          className="menu-item-anim group relative flex items-center w-fit py-1 pl-0 hover:pl-10 gap-1.5 transition-[padding] duration-300 ease-out select-none"
        >
          {/* Sliding Brand Crimson Pill with Arrow Icon */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-0 w-6 h-6 md:w-10 md:h-8 rounded-sm bg-[#DC143C] flex items-center justify-center transition-transform duration-300 ease-out shadow-md">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950 translate-x-[0.5px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-[clamp(1.2rem,2.1vw,1.85rem)] font-[family-name:var(--font-stalinist-one)] max-w-max ml-0 group-hover:ml-1.5 uppercase tracking-tight text-white leading-tight block">
            {label}
          </span>
        </Link>
      )}
    </div>
  );
}
