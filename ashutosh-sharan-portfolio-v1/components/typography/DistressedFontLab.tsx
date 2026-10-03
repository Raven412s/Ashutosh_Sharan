"use client";

import React, { useState } from "react";
import { DistressedText, type DistressedPreset } from "./DistressedText";

interface PresetItem {
  id: string;
  name: string;
  preset: DistressedPreset;
  intensity: number;
  chunkSize: number;
  edgeDamage: boolean;
  scratches: boolean;
  speckles: boolean;
  desc: string;
}

const PRESETS: PresetItem[] = [
  {
    id: "subtle",
    name: "Subtle Weathered",
    preset: "subtle",
    intensity: 0.18,
    chunkSize: 18,
    edgeDamage: true,
    scratches: true,
    speckles: true,
    desc: "Light surface abrasions and hairline cracks, preserving maximum typographic legibility.",
  },
  {
    id: "medium",
    name: "Industrial Stencil",
    preset: "medium",
    intensity: 0.38,
    chunkSize: 26,
    edgeDamage: true,
    scratches: true,
    speckles: true,
    desc: "Balanced rugged gouges and edge bites matching the authentic Rubik Distressed look.",
  },
  {
    id: "heavy",
    name: "Heavy Destruction",
    preset: "heavy",
    intensity: 0.62,
    chunkSize: 34,
    edgeDamage: true,
    scratches: true,
    speckles: true,
    desc: "Deep angular chunks severed from the stems and corners. High impact brutalist decay.",
  },
  {
    id: "apocalyptic",
    name: "Apocalyptic Ruins",
    preset: "apocalyptic",
    intensity: 0.82,
    chunkSize: 42,
    edgeDamage: true,
    scratches: true,
    speckles: true,
    desc: "Extreme erosion with shattered silhouettes, scattered shrapnel, and eroded voids.",
  },
];

const COLOR_OPTIONS = [
  { name: "Chalk White", value: "#EDEDED" },
  { name: "Cyber Gold", value: "#D9A441" },
  { name: "Blood Crimson", value: "#EF4444" },
  { name: "Neon Emerald", value: "#10B981" },
  { name: "Titanium Zinc", value: "#A1A1AA" },
];

const SAMPLE_WORDS = ["RAVEN", "UNLEASHED", "DISTRESSED", "BRUTALIST", "ASHUTOSH"];

export function DistressedFontLab() {
  const [text, setText] = useState<string>("RAVEN");
  const [fontSize, setFontSize] = useState<number>(72);
  const [activePreset, setActivePreset] = useState<string>("medium");
  const [intensity, setIntensity] = useState<number>(0.38);
  const [chunkSize, setChunkSize] = useState<number>(26);
  const [edgeDamage, setEdgeDamage] = useState<boolean>(true);
  const [scratches, setScratches] = useState<boolean>(true);
  const [speckles, setSpeckles] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(412);
  const [textColor, setTextColor] = useState<string>("#EDEDED");
  const [hoverEffect, setHoverEffect] = useState<boolean>(true);
  const [activeCodeTab, setActiveCodeTab] = useState<"react" | "css" | "tailwind">("react");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const applyPreset = (p: PresetItem) => {
    setActivePreset(p.id);
    setIntensity(p.intensity);
    setChunkSize(p.chunkSize);
    setEdgeDamage(p.edgeDamage);
    setScratches(p.scratches);
    setSpeckles(p.speckles);
  };

  const rollNewSeed = () => {
    setSeed(Math.floor(Math.random() * 99999) + 1);
  };

  const copyToClipboard = (code: string, tabName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 1800);
  };

  const reactSnippet = `<DistressedText
  as="h1"
  intensity={${intensity}}
  seed={${seed}}
  color="${textColor}"
  className="text-7xl font-normal"
>
  ${text}
</DistressedText>`;

  const cssSnippet = `/* 1. HTML / JSX */
<h1 className="distressed-font text-7xl text-[${textColor}]">
  ${text}
</h1>

/* 2. CSS (Stalinist One glyphs + Procedural Distressed Mask) */
.distressed-font {
  font-family: var(--font-stalinist-one), sans-serif;
  display: inline-block;
  mask-image: url("/patterns/distressed-mask.svg");
  mask-size: 100% 100%;
  mask-position: center;
  mask-repeat: no-repeat;
  -webkit-mask-image: url("/patterns/distressed-mask.svg");
  -webkit-mask-size: 100% 100%;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
}`;

  const tailwindSnippet = `<h1
  className="
    font-[var(--font-stalinist-one)]
    text-7xl
    text-[${textColor}]
    [mask-image:url('/patterns/distressed-mask.svg')]
    [mask-size:100%_100%]
    [mask-repeat:no-repeat]
    [-webkit-mask-image:url('/patterns/distressed-mask.svg')]
    [-webkit-mask-size:100%_100%]
    [-webkit-mask-repeat:no-repeat]
  "
>
  ${text}
</h1>`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2B2B30] bg-[#101013] shadow-2xl backdrop-blur-xl">
      {/* Lab Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222226] bg-[#151518] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
            <span className="font-mono text-sm font-bold">☠</span>
          </div>
          <div>
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#EDEDED]">
              Distressed Font Engine: Stalinist One × Rubik Distressed
            </h3>
            <p className="font-mono text-[11px] text-[#8B8B8F]">
              Procedural SVG Mask Cutting Irregular Solid Chunks, Cracks &amp; Broken Edges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={rollNewSeed}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs text-red-300 transition-all hover:bg-red-500/20 active:scale-95"
          >
            <span>🎲</span>
            <span>Reroll Damage (Seed: #{seed})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#222226]">
        {/* Left Column: Preset Switcher & Parametric Sliders (5 cols) */}
        <div className="lg:col-span-5 p-6 flex flex-col gap-6 bg-[#121215]">
          {/* Preset Buttons */}
          <div>
            <label className="font-mono text-[11px] text-[#A1A1A6] uppercase tracking-wider block mb-2">
              Damage Presets (Subtle → Destroyed)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`cursor-pointer text-left px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                      isSelected
                        ? "border-red-500/80 bg-red-500/10 text-[#EDEDED] shadow-sm shadow-red-500/10"
                        : "border-[#222226] bg-[#18181C] text-[#8B8B8F] hover:border-[#38383E] hover:text-[#EDEDED]"
                    }`}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[10px] text-[#71717A] truncate mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Word Triggers */}
          <div>
            <label className="font-mono text-[11px] text-[#A1A1A6] uppercase tracking-wider block mb-2">
              Sample Text / Quick Words
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {SAMPLE_WORDS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setText(w)}
                  className={`cursor-pointer px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
                    text === w
                      ? "border-red-500/60 bg-red-500/15 text-[#EDEDED]"
                      : "border-[#222226] bg-[#18181C] text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type custom text..."
              className="w-full rounded-xl border border-[#2B2B30] bg-[#0E0E10] px-3.5 py-2 font-mono text-sm text-[#EDEDED] placeholder-[#6E6E73] focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="font-mono text-[11px] text-[#A1A1A6] uppercase tracking-wider block mb-2">
              Glyph Fill Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setTextColor(c.value)}
                  className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
                    textColor === c.value
                      ? "border-red-500 bg-red-500/10 text-[#EDEDED]"
                      : "border-[#222226] bg-[#18181C] text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: c.value }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders: Intensity, Chunk Size */}
          <div className="space-y-4 pt-4 border-t border-[#222226]">
            {/* Font Size */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Font Size</span>
                <span className="text-red-400">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={120}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Damage Intensity */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Damage Intensity (Cutout Density)</span>
                <span className="text-red-400">{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.9}
                step={0.03}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6E6E73] mt-0.5">
                <span>Subtle Weathering</span>
                <span>Balanced Distressed</span>
                <span>Apocalyptic Void</span>
              </div>
            </div>

            {/* Chunk Size */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Missing Chunk Scale (Bite Size)</span>
                <span className="text-red-400">{chunkSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={52}
                step={2}
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Toggles: Edge Damage, Scratches, Speckles, Hover Effect */}
          <div className="pt-4 border-t border-[#222226] grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setEdgeDamage(!edgeDamage)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                edgeDamage
                  ? "border-red-500/70 bg-red-500/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Edge Bites</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {edgeDamage ? "Breaks Outer Contour" : "Smooth Edges"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScratches(!scratches)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                scratches
                  ? "border-red-500/70 bg-red-500/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Cracks &amp; Slashes</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {scratches ? "Hairline Fractures" : "No Cracks"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSpeckles(!speckles)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                speckles
                  ? "border-red-500/70 bg-red-500/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Micro-Speckles</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {speckles ? "Stipple Pepper Erosion" : "Clean Surfaces"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHoverEffect(!hoverEffect)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                hoverEffect
                  ? "border-emerald-500/70 bg-emerald-500/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Hover Glitch FX</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {hoverEffect ? "Brightness Surge" : "Static"}
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Live Stage & Exported Code (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0B0B0D]">
          {/* Live Preview Stage */}
          <div
            className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.08) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <div className="h-64 w-64 rounded-full bg-red-600 blur-[130px]" />
            </div>

            {/* The Distressed Text Component */}
            <div className="relative z-10 text-center max-w-full overflow-x-auto py-6">
              <DistressedText
                as="h1"
                intensity={intensity}
                chunkSize={chunkSize}
                edgeDamage={edgeDamage}
                scratches={scratches}
                speckles={speckles}
                seed={seed}
                color={textColor}
                hoverEffect={hoverEffect}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.1,
                  letterSpacing: "0.03em",
                }}
              >
                {text || "RAVEN"}
              </DistressedText>
            </div>

            {/* Micro spec readout */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#71717A]">
              <span>Base: Stalinist One</span>
              <span>Engine: NaN Tectonic Plate Vector Displacement</span>
              <span>Seed: #{seed}</span>
            </div>
          </div>

          {/* Code Export Tabs */}
          <div className="border-t border-[#222226] bg-[#111114]">
            <div className="flex items-center justify-between border-b border-[#1C1C20] px-4 py-2.5 bg-[#141418]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#8B8B8F] uppercase tracking-wider">
                  Export Implementation:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("react")}
                  className={`cursor-pointer px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeCodeTab === "react"
                      ? "bg-red-500 text-white font-semibold"
                      : "text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  React &lt;DistressedText&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("css")}
                  className={`cursor-pointer px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeCodeTab === "css"
                      ? "bg-red-500 text-white font-semibold"
                      : "text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  Pure CSS Mask
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("tailwind")}
                  className={`cursor-pointer px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeCodeTab === "tailwind"
                      ? "bg-red-500 text-white font-semibold"
                      : "text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  Tailwind v4
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const content =
                    activeCodeTab === "react"
                      ? reactSnippet
                      : activeCodeTab === "css"
                      ? cssSnippet
                      : tailwindSnippet;
                  copyToClipboard(content, activeCodeTab);
                }}
                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-[#2A2A2E] bg-[#18181C] px-3 py-1 font-mono text-xs text-[#EDEDED] transition-all hover:border-red-500 hover:text-red-400"
              >
                {copiedTab === activeCodeTab ? "✓ Copied!" : "📋 Copy Code"}
              </button>
            </div>

            {/* Code Block */}
            <div className="p-4 overflow-x-auto max-h-[170px]">
              <pre className="font-mono text-xs text-[#A1A1A6] leading-relaxed">
                <code>
                  {activeCodeTab === "react"
                    ? reactSnippet
                    : activeCodeTab === "css"
                    ? cssSnippet
                    : tailwindSnippet}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Phase 2 Visual Validation Showcase Section */}
        <div className="lg:col-span-12 border-t border-[#222226] bg-[#0E0E11] p-6 sm:p-8 space-y-8">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-red-400 font-semibold mb-1">
              Phase 2 Visual Validation Showcase
            </h3>
            <p className="text-xs text-[#8B8B8F]">
              Testing complete character set, true advance width spacing, kerning pairs, responsive scaling, and color inheritance.
            </p>
          </div>

          {/* 1. Word Tests */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
              1. Typographic Multi-Word & Kerning Tests
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#222226] bg-[#141418]">
                <div className="text-[10px] font-mono text-[#71717A] mb-2">&quot;RAVEN&quot;</div>
                <div className="text-4xl text-white">
                  <DistressedText>RAVEN</DistressedText>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#222226] bg-[#141418]">
                <div className="text-[10px] font-mono text-[#71717A] mb-2">&quot;NEXT LEVEL&quot; (Multi-word space test)</div>
                <div className="text-3xl text-emerald-400">
                  <DistressedText>NEXT LEVEL</DistressedText>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#222226] bg-[#141418]">
                <div className="text-[10px] font-mono text-[#71717A] mb-2">&quot;STALINIST&quot;</div>
                <div className="text-3xl text-cyan-400">
                  <DistressedText>STALINIST</DistressedText>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#222226] bg-[#141418]">
                <div className="text-[10px] font-mono text-[#71717A] mb-2">&quot;DISTRESSED&quot;</div>
                <div className="text-3xl text-amber-400">
                  <DistressedText>DISTRESSED</DistressedText>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Side-by-Side: Normal Stalinist One vs Distressed Stalinist One */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
              2. Side-by-Side: Normal Stalinist One vs Distressed Stalinist One
            </h4>
            <div className="p-5 rounded-xl border border-[#222226] bg-[#141418] space-y-4">
              <div>
                <div className="text-[10px] font-mono text-[#8B8B8F] mb-1">Original Stalinist One (Solid Reference)</div>
                <div className="text-3xl sm:text-4xl font-stalinist-one text-white tracking-wider">
                  RAVEN 412
                </div>
              </div>
              <div className="pt-3 border-t border-[#1F1F24]">
                <div className="text-[10px] font-mono text-red-400 mb-1">Distressed Stalinist One (Tectonic Plates & Negative Space Fissures)</div>
                <div className="text-3xl sm:text-4xl text-white">
                  <DistressedText>RAVEN 412</DistressedText>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Responsive Size Scales */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
              3. Responsive Scaling Tests (Vector Sharpness Across Scales)
            </h4>
            <div className="p-5 rounded-xl border border-[#222226] bg-[#141418] space-y-4 overflow-x-auto">
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-mono text-[#71717A] w-20">text-2xl:</span>
                <DistressedText className="text-2xl text-white">RAVEN</DistressedText>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-mono text-[#71717A] w-20">text-4xl:</span>
                <DistressedText className="text-4xl text-white">RAVEN</DistressedText>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-mono text-[#71717A] w-20">text-6xl:</span>
                <DistressedText className="text-6xl text-white">RAVEN</DistressedText>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-mono text-[#71717A] w-20">text-7xl:</span>
                <DistressedText className="text-7xl text-white">RAVEN</DistressedText>
              </div>
            </div>
          </div>

          {/* 4. Color Inheritance Tests */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
              4. Text Color Inheritance (Tailwind currentColor)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-[#222226] bg-[#141418] text-center">
                <div className="text-[10px] font-mono text-[#71717A] mb-1">text-[#F5F5F5] (White)</div>
                <DistressedText className="text-2xl text-[#F5F5F5]">RAVEN</DistressedText>
              </div>
              <div className="p-3 rounded-lg border border-[#222226] bg-[#141418] text-center">
                <div className="text-[10px] font-mono text-[#71717A] mb-1">text-red-500 (Red)</div>
                <DistressedText className="text-2xl text-red-500">RAVEN</DistressedText>
              </div>
              <div className="p-3 rounded-lg border border-[#222226] bg-[#141418] text-center">
                <div className="text-[10px] font-mono text-[#71717A] mb-1">text-cyan-400 (Cyan)</div>
                <DistressedText className="text-2xl text-cyan-400">RAVEN</DistressedText>
              </div>
              <div className="p-3 rounded-lg border border-[#222226] bg-[#222228] text-center">
                <div className="text-[10px] font-mono text-[#71717A] mb-1">text-neutral-900 (Dark on Slate)</div>
                <DistressedText className="text-2xl text-neutral-900">RAVEN</DistressedText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistressedFontLab;
