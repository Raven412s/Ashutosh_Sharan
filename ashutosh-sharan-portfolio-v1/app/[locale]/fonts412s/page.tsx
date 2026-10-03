"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HybridFontLab } from "@/components/typography/HybridFontLab";
import { DistressedFontLab } from "@/components/typography/DistressedFontLab";

interface FontItem {
  id: string;
  name: string;
  className: string;
  variable: string;
  category: "Display / Heading" | "Monospace" | "Body / Sans" | "Experimental";
  description: string;
  weights: string;
  sampleUse: string;
}

const FONTS_DATA: FontItem[] = [
  {
    id: "stalinist-one",
    name: "Stalinist One",
    className: "font-stalinist-one",
    variable: "--font-stalinist-one",
    category: "Display / Heading",
    description: "Ultra-heavy brutalist display font with mechanical curves & high structural weight.",
    weights: "400",
    sampleUse: "Hero Headings, Loud Impact Badges, Poster Titles",
  },
  {
    id: "passero-one",
    name: "Passero One",
    className: "font-passero-one",
    variable: "--font-passero-one",
    category: "Display / Heading",
    description: "Casual yet chiseled low-contrast sans with organic handcrafted warmth.",
    weights: "400",
    sampleUse: "Card Titles, Human-Centric UI, Feature Highlights",
  },
  {
    id: "rubik-maze",
    name: "Rubik Maze",
    className: "font-rubik-maze",
    variable: "--font-rubik-maze",
    category: "Experimental",
    description: "Labyrinthine 3D optical maze letterforms with intricate path detailing.",
    weights: "400",
    sampleUse: "Background Watermarks, Giant Numerals, Creative Showcase",
  },
  {
    id: "frijole",
    name: "Frijole",
    className: "font-frijole",
    variable: "--font-frijole",
    category: "Experimental",
    description: "Distressed ink-blot texture display font with raw grunge aesthetics.",
    weights: "400",
    sampleUse: "Artistic Tags, Distressed Stencils, Grungy Accents",
  },
  {
    id: "space-mono",
    name: "Space Mono",
    className: "font-space-mono",
    variable: "--font-space-mono",
    category: "Monospace",
    description: "Eccentric fixed-width typeface created by Colophon for editorial and tech headlines.",
    weights: "400, 700",
    sampleUse: "System Readouts, Timestamps, Tech Metadata",
  },
  {
    id: "quicksand",
    name: "Quicksand",
    className: "font-quicksand",
    variable: "--font-quicksand",
    category: "Body / Sans",
    description: "Rounded geometric display sans with friendly curves and clear open terminals.",
    weights: "300 — 700",
    sampleUse: "Longform Paragraphs, Friendly Body Text, Descriptions",
  },
];

const PRESETS = [
  { label: "Classic Pangram", text: "The quick brown fox jumps over the lazy dog" },
  { label: "All Caps Pangram", text: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG" },
  { label: "Numbers & Symbols", text: "0123456789 • !@#$%^&*()_+{}[]:;<>?" },
  { label: "Editorial Headline", text: "AVANT-GARDE ARCHITECTURAL TYPOGRAPHY" },
  { label: "Portfolio Intro", text: "Ashutosh Sharan — Creative Technologist & Full Stack Developer" },
];

const CATEGORIES = ["All", "Display / Heading", "Monospace", "Body / Sans", "Experimental"] as const;

export default function FontsTestPage() {
  const [selectedFontId, setSelectedFontId] = useState<string>("stalinist-one");
  const [customText, setCustomText] = useState<string>("The quick brown fox jumps over the lazy dog");
  const [fontSize, setFontSize] = useState<number>(44);
  const [fontWeight, setFontWeight] = useState<number>(400);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.2);
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase" | "capitalize">("none");
  const [textStyle, setTextStyle] = useState<"default" | "gold" | "stroke-light" | "stroke-gold" | "stroke-zinc">("default");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedFont = FONTS_DATA.find((f) => f.id === selectedFontId) || FONTS_DATA[0];

  const filteredFonts = FONTS_DATA.filter((f) => {
    const matchesCategory = activeCategory === "All" || f.category === activeCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const scrollToStudio = (fontId: string) => {
    setSelectedFontId(fontId);
    const studioEl = document.getElementById("interactive-studio");
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getStyleClass = () => {
    switch (textStyle) {
      case "gold":
        return "text-[#D9A441]";
      case "stroke-light":
        return "text-stroke-light";
      case "stroke-gold":
        return "text-stroke-gold";
      case "stroke-zinc":
        return "text-stroke-zinc";
      default:
        return "text-[#EDEDED]";
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-[#EDEDED] antialiased selection:bg-[#D9A441]/30 selection:text-[#EDEDED] pb-24">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#1F1F21]/80 bg-[#0B0B0C]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-base font-bold tracking-tight text-[#EDEDED] transition-colors hover:text-[#D9A441]"
            >
              <span>Ashutosh</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
            </Link>
            <span className="text-[#3A3A3D]">/</span>
            <span className="font-mono text-xs text-[#8B8B8F] tracking-wide uppercase">
              Typography Lab
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#hybrid-font-lab"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-3 py-1 font-mono text-xs text-[#D9A441] transition-all hover:bg-[#D9A441]/20"
            >
              <span>⚡</span>
              <span>Doodle Triangles</span>
            </a>
            <a
              href="#distressed-font-lab"
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 font-mono text-xs text-red-400 transition-all hover:bg-red-500/20"
            >
              <span>☠</span>
              <span>Distressed Mask</span>
            </a>
            <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#2A2A2D] bg-[#141416] px-3 py-1 font-mono text-xs text-[#8B8B8F]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              6 Active Fonts
            </span>
            <Link
              href="/"
              className="rounded-full border border-[#2A2A2D] bg-[#141416] px-4 py-1.5 font-mono text-xs text-[#EDEDED] transition-all hover:border-[#D9A441] hover:text-[#D9A441]"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <header className="mx-auto max-w-7xl px-6 pt-12 pb-8 sm:px-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-[#D9A441] uppercase">
            <span>[ SYSTEM SPEC ]</span>
            <span>•</span>
            <span>NEXT/FONT + TAILWIND V4 INLINE THEME</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-[#EDEDED]">
            Typography Lab & Font Inspector
          </h1>
          <p className="max-w-3xl text-sm sm:text-base text-[#8B8B8F] leading-relaxed">
            The 6 selected fonts configured in <code className="rounded bg-[#17171A] px-1.5 py-0.5 font-mono text-xs text-[#D9A441]">app/fonts/index.tsx</code> and exposed via Tailwind classes (<code className="rounded bg-[#17171A] px-1.5 py-0.5 font-mono text-xs text-[#EDEDED]">font-*</code>). Test custom inputs, font sizes, weights, and inspect full character pangrams in real-time.
          </p>
        </div>
      </header>

      {/* ==========================================================================
          SECTION 1: INTERACTIVE STUDIO (TOP HERO TESTER)
         ========================================================================== */}
      <section
        id="interactive-studio"
        className="mx-auto max-w-7xl px-6 sm:px-10 scroll-mt-24 mb-16"
      >
        <div className="overflow-hidden rounded-2xl border border-[#222225] bg-[#111113] shadow-2xl backdrop-blur-xl">
          {/* Studio Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222225] bg-[#161619] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-3 w-3 items-center justify-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/80" />
              </div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#EDEDED]">
                Interactive Font Studio
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-[#8B8B8F]">Active Class:</span>
              <code className="rounded border border-[#2A2A2D] bg-[#0B0B0C] px-2.5 py-1 font-mono text-xs text-[#D9A441]">
                {selectedFont.className}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(selectedFont.className, "active-class")}
                className="cursor-pointer rounded-lg border border-[#2A2A2D] bg-[#1F1F23] px-3 py-1 font-mono text-xs text-[#EDEDED] transition-colors hover:border-[#D9A441] hover:text-[#D9A441]"
              >
                {copiedKey === "active-class" ? "✓ Copied" : "Copy Class"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#222225]">
            {/* Control Panel (Left 5 Cols on desktop) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col gap-6 bg-[#131316]">
              {/* 1. Select Font */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs font-medium uppercase tracking-wider text-[#8B8B8F] flex items-center justify-between">
                  <span>1. Choose Font ({FONTS_DATA.length})</span>
                  <span className="text-[#D9A441]">{selectedFont.category}</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedFontId}
                    onChange={(e) => setSelectedFontId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#2A2A2D] bg-[#0B0B0C] px-4 py-3 font-mono text-sm text-[#EDEDED] focus:border-[#D9A441] focus:outline-none transition-colors cursor-pointer"
                  >
                    {FONTS_DATA.map((f) => (
                      <option key={f.id} value={f.id} className="bg-[#111113] text-[#EDEDED]">
                        {f.name} — ({f.className})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8B8B8F]">
                    ▼
                  </div>
                </div>

                {/* Quick font pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {FONTS_DATA.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFontId(f.id)}
                      className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-mono transition-colors ${
                        selectedFontId === f.id
                          ? "bg-[#D9A441] text-[#0B0B0C] font-bold"
                          : "bg-[#1E1E22] text-[#8B8B8F] hover:text-[#EDEDED]"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Custom Words Input */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs font-medium uppercase tracking-wider text-[#8B8B8F]">
                    2. Custom Words / Text Input
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomText("")}
                    className="cursor-pointer font-mono text-[10px] text-[#8B8B8F] hover:text-[#EF4444]"
                  >
                    Clear Text
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type anything to test in this font..."
                  className="w-full resize-y rounded-xl border border-[#2A2A2D] bg-[#0B0B0C] p-3 text-sm text-[#EDEDED] placeholder-[#4A4A50] focus:border-[#D9A441] focus:outline-none transition-colors"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-mono text-[10px] text-[#6E6E73] mr-1">Presets:</span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCustomText(p.text)}
                      className="cursor-pointer rounded border border-[#222225] bg-[#18181B] px-2 py-0.5 text-[10px] font-mono text-[#A1A1A6] transition-colors hover:border-[#D9A441] hover:text-[#D9A441]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Typography Sliders: Size & Weight */}
              <div className="space-y-4 pt-2 border-t border-[#1F1F23]">
                {/* Font Size */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#8B8B8F]">Font Size</span>
                    <span className="rounded bg-[#1F1F24] px-2 py-0.5 text-[#D9A441] font-semibold">
                      {fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={120}
                    step={1}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="h-2 w-full appearance-none rounded-lg bg-[#222226] accent-[#D9A441] cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[10px] text-[#636368]">
                    <span>14px</span>
                    <button type="button" onClick={() => setFontSize(24)} className="hover:text-[#EDEDED]">24</button>
                    <button type="button" onClick={() => setFontSize(36)} className="hover:text-[#EDEDED]">36</button>
                    <button type="button" onClick={() => setFontSize(48)} className="hover:text-[#EDEDED]">48</button>
                    <button type="button" onClick={() => setFontSize(64)} className="hover:text-[#EDEDED]">64</button>
                    <span>120px</span>
                  </div>
                </div>

                {/* Font Weight */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#8B8B8F]">Font Weight</span>
                    <span className="rounded bg-[#1F1F24] px-2 py-0.5 text-[#D9A441] font-semibold">
                      {fontWeight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={900}
                    step={100}
                    value={fontWeight}
                    onChange={(e) => setFontWeight(Number(e.target.value))}
                    className="h-2 w-full appearance-none rounded-lg bg-[#222226] accent-[#D9A441] cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[10px] text-[#636368]">
                    <span>100 (Thin)</span>
                    <span>400 (Regular)</span>
                    <span>700 (Bold)</span>
                    <span>900 (Black)</span>
                  </div>
                  <p className="text-[10px] text-[#636368]">
                    * Note: This font natively imports weights: <span className="text-[#A1A1A6] font-mono">{selectedFont.weights}</span>. Variable simulation applies to others.
                  </p>
                </div>

                {/* Letter Spacing & Line Height */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#8B8B8F]">Tracking</span>
                      <span className="text-[#A1A1A6]">{letterSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={16}
                      step={1}
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(Number(e.target.value))}
                      className="h-2 w-full appearance-none rounded-lg bg-[#222226] accent-[#D9A441] cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#8B8B8F]">Leading</span>
                      <span className="text-[#A1A1A6]">{lineHeight}</span>
                    </div>
                    <input
                      type="range"
                      min={0.8}
                      max={2.0}
                      step={0.1}
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="h-2 w-full appearance-none rounded-lg bg-[#222226] accent-[#D9A441] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Text Transform & Style Presets */}
                <div className="flex flex-col gap-2 pt-2">
                  <span className="font-mono text-xs text-[#8B8B8F]">Transform & Style</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["none", "uppercase", "lowercase", "capitalize"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTextTransform(t)}
                        className={`cursor-pointer rounded py-1 font-mono text-[10px] uppercase transition-colors ${
                          textTransform === t
                            ? "bg-[#D9A441] text-[#0B0B0C] font-bold"
                            : "bg-[#1E1E22] text-[#8B8B8F] hover:text-[#EDEDED]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setTextStyle("default")}
                      className={`cursor-pointer rounded py-1 font-mono text-[10px] transition-colors ${
                        textStyle === "default"
                          ? "border border-[#D9A441] text-[#EDEDED]"
                          : "bg-[#18181B] text-[#8B8B8F]"
                      }`}
                    >
                      Default Solid
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextStyle("gold")}
                      className={`cursor-pointer rounded py-1 font-mono text-[10px] transition-colors ${
                        textStyle === "gold"
                          ? "border border-[#D9A441] text-[#D9A441]"
                          : "bg-[#18181B] text-[#D9A441]/80"
                      }`}
                    >
                      Gold Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextStyle("stroke-light")}
                      className={`cursor-pointer rounded py-1 font-mono text-[10px] transition-colors ${
                        textStyle === "stroke-light"
                          ? "border border-[#D9A441] text-[#EDEDED]"
                          : "bg-[#18181B] text-[#8B8B8F]"
                      }`}
                    >
                      Outline Stroke
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Render Canvas (Right 7 Cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col bg-[#0C0C0E] relative min-h-[380px]">
              {/* Canvas Header Info */}
              <div className="flex items-center justify-between border-b border-[#1C1C20] px-6 py-3 bg-[#0F0F12]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#EDEDED]">
                    {selectedFont.name}
                  </span>
                  <span className="rounded bg-[#202025] px-2 py-0.5 font-mono text-[10px] text-[#A1A1A6]">
                    var({selectedFont.variable})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#8B8B8F]">
                  <span>{fontSize}px</span>
                  <span>•</span>
                  <span>wt {fontWeight}</span>
                  <span>•</span>
                  <span>{selectedFont.category}</span>
                </div>
              </div>

              {/* Canvas Preview Area with subtle dot-matrix background */}
              <div
                className="flex-1 p-6 sm:p-10 flex items-center justify-center overflow-x-auto min-h-[320px]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="w-full text-center sm:text-left transition-all duration-150">
                  <p
                    className={`${selectedFont.className} ${getStyleClass()} break-words transition-all duration-75`}
                    style={{
                      fontFamily: `var(${selectedFont.variable})`,
                      fontSize: `${fontSize}px`,
                      fontWeight: fontWeight,
                      letterSpacing: `${letterSpacing}px`,
                      lineHeight: lineHeight,
                      textTransform: textTransform,
                    }}
                  >
                    {customText || (
                      <span className="text-[#4A4A50] italic font-sans text-lg">
                        (Type in the input box on the left to see live rendering)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Canvas Footer specs */}
              <div className="border-t border-[#1C1C20] px-6 py-3 bg-[#0F0F12] flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#8B8B8F]">
                <div>
                  <span className="text-[#636368]">Description: </span>
                  <span className="text-[#A1A1A6]">{selectedFont.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#636368]">Tailwind:</span>
                  <code className="text-[#D9A441]">&lt;div className=&quot;{selectedFont.className}&quot;&gt;</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 1.5: HYBRID FONT ENGINE (STALINIST ONE × RUBIK DOODLE TRIANGLES)
         ========================================================================== */}
      <section id="hybrid-font-lab" className="mx-auto max-w-7xl px-6 sm:px-10 mb-16 scroll-mt-24">
        <div className="mb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-[#D9A441] uppercase tracking-wider mb-2">
            <span>[ EXPERIMENTAL COMPOSITOR ]</span>
            <span>•</span>
            <span>STALINIST ONE × RUBIK DOODLE TRIANGLES</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#EDEDED] sm:text-3xl">
            Hybrid Font Engine &amp; Live Studio
          </h2>
          <p className="mt-1 text-sm text-[#8B8B8F]">
            Combining Stalinist One brutalist geometry with Rubik Doodle Triangles procedural vector mesh. Tune density, pattern size, stroke width, and jitter in real-time.
          </p>
        </div>
        <HybridFontLab />
      </section>

      {/* ==========================================================================
          SECTION 1.6: DISTRESSED FONT ENGINE (STALINIST ONE × RUBIK DISTRESSED)
         ========================================================================== */}
      <section id="distressed-font-lab" className="mx-auto max-w-7xl px-6 sm:px-10 mb-16 scroll-mt-24">
        <div className="mb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-red-400 uppercase tracking-wider mb-2">
            <span>[ PROCEDURAL MASK ENGINE ]</span>
            <span>•</span>
            <span>STALINIST ONE × RUBIK DISTRESSED</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#EDEDED] sm:text-3xl">
            Distressed Font Engine &amp; Erosion Studio
          </h2>
          <p className="mt-1 text-sm text-[#8B8B8F]">
            Carving heavy Stalinist One glyphs with procedural SVG alpha masks. Simulates Rubik Distressed by cleanly cutting irregular solid chunks, hairline fractures, and chipped boundaries.
          </p>
        </div>
        <DistressedFontLab />
      </section>

      {/* ==========================================================================
          SECTION 2: ALL 6 FONTS SHOWCASE (THE QUICK BROWN FOX & FULL SPEC)
         ========================================================================== */}
      <section id="all-fonts-section" className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[#222225] pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#D9A441] uppercase tracking-wider mb-2">
              <span>[ FONT CATALOGUE ]</span>
              <span>•</span>
              <span>6 SELECTED TYPOGRAPHIC FAMILIES</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#EDEDED] sm:text-3xl">
              Selected Fonts Showcase
            </h2>
            <p className="mt-1 text-sm text-[#8B8B8F]">
              The 6 retained project fonts rendered with the classic pangram statement and full character set.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search font by name..."
                className="w-full sm:w-60 rounded-xl border border-[#2A2A2D] bg-[#141416] px-3.5 py-2 font-mono text-xs text-[#EDEDED] placeholder-[#6E6E73] focus:border-[#D9A441] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#8B8B8F] hover:text-[#EDEDED]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                    activeCategory === cat
                      ? "bg-[#D9A441] text-[#0B0B0C] font-semibold"
                      : "border border-[#2A2A2D] bg-[#141416] text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs font-mono text-[#8B8B8F]">
          <span>
            Showing <strong className="text-[#EDEDED]">{filteredFonts.length}</strong> of {FONTS_DATA.length} fonts
          </span>
          {activeCategory !== "All" && (
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className="text-[#D9A441] hover:underline cursor-pointer"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        {/* Font Cards Grid */}
        <div className="flex flex-col gap-6">
          {filteredFonts.map((font, idx) => (
            <div
              key={font.id}
              className="group overflow-hidden rounded-2xl border border-[#222225] bg-[#121214] transition-all hover:border-[#38383D] hover:shadow-xl"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E1E22] bg-[#161619] px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#6E6E73]">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-bold text-[#EDEDED]">{font.name}</h3>
                  <span className="rounded-full border border-[#2A2A2D] bg-[#0E0E10] px-2.5 py-0.5 font-mono text-[10px] text-[#A1A1A6]">
                    {font.category}
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-[#6E6E73]">
                    Weights: {font.weights}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(font.className, `class-${font.id}`)}
                    className="cursor-pointer rounded-lg border border-[#2A2A2D] bg-[#0E0E10] px-3 py-1.5 font-mono text-xs text-[#D9A441] transition-colors hover:border-[#D9A441]"
                    title="Click to copy Tailwind class"
                  >
                    {copiedKey === `class-${font.id}` ? "✓ Copied" : font.className}
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToStudio(font.id)}
                    className="cursor-pointer rounded-lg bg-[#D9A441] px-3 py-1.5 font-mono text-xs font-semibold text-[#0B0B0C] transition-opacity hover:opacity-90"
                  >
                    Test in Studio ↑
                  </button>
                </div>
              </div>

              {/* Card Body: Pangrams & Character Sets */}
              <div className="p-6 sm:p-8 flex flex-col gap-6">
                {/* 1. Main Pangram (Quick Brown Fox) */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] text-[#6E6E73] uppercase tracking-wider">
                    Primary Statement (The Quick Brown Fox)
                  </span>
                  <p
                    className={`${font.className} text-2xl sm:text-4xl text-[#EDEDED] leading-tight break-words`}
                    style={{ fontFamily: `var(${font.variable})` }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>

                {/* 2. Uppercase Pangram */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-[#1C1C20]">
                  <span className="font-mono text-[11px] text-[#6E6E73] uppercase tracking-wider">
                    All-Caps Pangram
                  </span>
                  <p
                    className={`${font.className} text-xl sm:text-2xl text-[#C4C4C8] uppercase tracking-wider leading-snug break-words`}
                    style={{ fontFamily: `var(${font.variable})` }}
                  >
                    THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG
                  </p>
                </div>

                {/* 3. Character Sets: Alphabet, Numerals, Symbols */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#1C1C20]">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-[#6E6E73] uppercase">
                      Alphabet (A-Z / a-z)
                    </span>
                    <p
                      className={`${font.className} text-base sm:text-lg text-[#EDEDED] tracking-wide break-words`}
                      style={{ fontFamily: `var(${font.variable})` }}
                    >
                      A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                    </p>
                    <p
                      className={`${font.className} text-sm sm:text-base text-[#9E9EA4] tracking-wide break-words`}
                      style={{ fontFamily: `var(${font.variable})` }}
                    >
                      a b c d e f g h i j k l m n o p q r s t u v w x y z
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-[#6E6E73] uppercase">
                      Numerals & Symbols
                    </span>
                    <p
                      className={`${font.className} text-base sm:text-lg text-[#D9A441] tracking-wide break-words`}
                      style={{ fontFamily: `var(${font.variable})` }}
                    >
                      0 1 2 3 4 5 6 7 8 9
                    </p>
                    <p
                      className={`${font.className} text-sm sm:text-base text-[#8B8B8F] tracking-wide break-words`}
                      style={{ fontFamily: `var(${font.variable})` }}
                    >
                      ! @ # $ % ^ &amp; * ( ) _ + - = [ ] &#123; &#125; : ; &quot; &apos; &lt; &gt; , . ? /
                    </p>
                  </div>
                </div>

                {/* Card Meta / Recommendation */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1C1C20] font-mono text-xs text-[#8B8B8F]">
                  <div>
                    <span className="text-[#6E6E73]">Best For: </span>
                    <span className="text-[#EDEDED]">{font.sampleUse}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6E73]">Variable: </span>
                    <code className="text-[#A1A1A6]">var({font.variable})</code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}