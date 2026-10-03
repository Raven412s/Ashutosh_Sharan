"use client";

import React, { useState } from "react";
import { HybridText, type HybridTextVariant } from "./HybridText";

interface PresetItem {
  id: string;
  name: string;
  variant: HybridTextVariant;
  density: number;
  patternSize: number;
  strokeWidth: number;
  jitter: number;
  outline: boolean;
  outlineColor: string;
  outlineWidth: string;
  desc: string;
}

const PRESETS: PresetItem[] = [
  {
    id: "brutalist-dark",
    name: "Brutalist Monochrome",
    variant: "dark",
    density: 6,
    patternSize: 80,
    strokeWidth: 1.2,
    jitter: 0.28,
    outline: true,
    outlineColor: "#111111",
    outlineWidth: "1.5px",
    desc: "Solid dark silhouette filled with chalk-white geometric doodle triangles & crisp outer contour.",
  },
  {
    id: "classic-light",
    name: "Rubik Doodle Paper",
    variant: "light",
    density: 6,
    patternSize: 80,
    strokeWidth: 1.3,
    jitter: 0.26,
    outline: true,
    outlineColor: "#121214",
    outlineWidth: "1.5px",
    desc: "Paper-white fill with dark ink hand-drawn triangle crosshatching like Rubik Doodle Triangles.",
  },
  {
    id: "cyber-gold",
    name: "Cyberpunk Gold",
    variant: "gold",
    density: 9,
    patternSize: 75,
    strokeWidth: 1.2,
    jitter: 0.22,
    outline: true,
    outlineColor: "#D9A441",
    outlineWidth: "1.5px",
    desc: "Luxurious obsidian core laced with radiant amber-gold triangular vector lattice.",
  },
  {
    id: "blueprint",
    name: "Architect Blueprint",
    variant: "blueprint",
    density: 10,
    patternSize: 70,
    strokeWidth: 1.1,
    jitter: 0.18,
    outline: true,
    outlineColor: "#38BDF8",
    outlineWidth: "1.5px",
    desc: "CAD schematic style with precise isometric cyan Delaunay triangulation.",
  },
  {
    id: "raw-doodle",
    name: "Raw Doodle Grunge",
    variant: "raw",
    density: 4,
    patternSize: 90,
    strokeWidth: 1.8,
    jitter: 0.38,
    outline: true,
    outlineColor: "#18181B",
    outlineWidth: "2px",
    desc: "Heavy lines with wild organic vertex jitter for an unpolished hand-sketched aesthetic.",
  },
];

const SAMPLE_WORDS = ["RAVEN", "UNLEASHED", "412 SHARAN", "CREATIVE TECH", "BRUTALIST"];

export function HybridFontLab() {
  const [text, setText] = useState<string>("RAVEN");
  const [fontSize, setFontSize] = useState<number>(72);
  const [activePreset, setActivePreset] = useState<string>("brutalist-dark");
  const [density, setDensity] = useState<number>(6);
  const [patternSize, setPatternSize] = useState<number>(80);
  const [strokeWidth, setStrokeWidth] = useState<number>(1.2);
  const [jitter, setJitter] = useState<number>(0.28);
  const [hasOutline, setHasOutline] = useState<boolean>(true);
  const [outlineColor, setOutlineColor] = useState<string>("#111111");
  const [outlineWidth, setOutlineWidth] = useState<string>("1.5px");
  const [doubleLayer, setDoubleLayer] = useState<boolean>(true);
  const [hoverEffect, setHoverEffect] = useState<boolean>(true);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"react" | "css" | "tailwind">("react");

  const applyPreset = (preset: PresetItem) => {
    setActivePreset(preset.id);
    setDensity(preset.density);
    setPatternSize(preset.patternSize);
    setStrokeWidth(preset.strokeWidth);
    setJitter(preset.jitter);
    setHasOutline(preset.outline);
    setOutlineColor(preset.outlineColor);
    setOutlineWidth(preset.outlineWidth);
  };

  const copyToClipboard = (code: string, tabName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 1800);
  };

  const currentVariant = PRESETS.find((p) => p.id === activePreset)?.variant || "dark";

  const reactSnippet = `<HybridText
  as="h1"
  variant="${currentVariant}"
  density={${density}}
  patternSize={${patternSize}}
  strokeWidth={${strokeWidth}}
  jitter={${jitter}}
  outline={${hasOutline ? `"${outlineColor}"` : "false"}}
  outlineWidth="${outlineWidth}"
  doubleLayer={${doubleLayer}}
  className="text-7xl font-normal tracking-wide"
>
  ${text}
</HybridText>`;

  const cssSnippet = `/* 1. HTML / JSX */
<h1 className="hybrid-font text-7xl">
  ${text}
</h1>

/* 2. CSS (Stalinist One glyphs + Rubik Doodle Triangles pattern) */
.hybrid-font {
  font-family: var(--font-stalinist-one), sans-serif;
  color: transparent;
  background-image: url("/patterns/triangle-doodle.svg");
  background-repeat: repeat;
  background-size: ${patternSize}px ${patternSize}px;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ${hasOutline ? `-webkit-text-stroke: ${outlineWidth} ${outlineColor};` : ""}
}`;

  const tailwindSnippet = `<h1
  className="
    font-[var(--font-stalinist-one)]
    text-7xl
    text-transparent
    bg-[url('/patterns/triangle-doodle.svg')]
    bg-repeat
    bg-[length:${patternSize}px_${patternSize}px]
    bg-clip-text
    [-webkit-background-clip:text]
    [-webkit-text-fill-color:transparent]
    ${hasOutline ? `[-webkit-text-stroke:${outlineWidth}_${outlineColor}]` : ""}
  "
>
  ${text}
</h1>`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2B2B30] bg-[#101013] shadow-2xl backdrop-blur-xl">
      {/* Lab Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222226] bg-[#151518] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30">
            <span className="font-mono text-sm font-bold">⚡</span>
          </div>
          <div>
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#EDEDED]">
              Hybrid Font Engine: Stalinist One × Rubik Doodle Triangles
            </h3>
            <p className="font-mono text-[11px] text-[#8B8B8F]">
              Stalinist One Glyph Geometry + Procedural Rubik Doodle Triangle Texture Fill
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400">
            ● Next.js 16 + React 19 Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#222226]">
        {/* Left Column: Preset Switcher & Parametric Sliders (5 cols) */}
        <div className="lg:col-span-5 p-6 flex flex-col gap-6 bg-[#121215]">
          {/* Preset Buttons */}
          <div>
            <label className="font-mono text-[11px] text-[#A1A1A6] uppercase tracking-wider block mb-2">
              Curated Style Presets
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
                        ? "border-[#D9A441] bg-[#D9A441]/10 text-[#EDEDED] shadow-sm shadow-[#D9A441]/10"
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
                      ? "border-[#D9A441] bg-[#D9A441]/15 text-[#EDEDED]"
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
              className="w-full rounded-xl border border-[#2B2B30] bg-[#0E0E10] px-3.5 py-2 font-mono text-sm text-[#EDEDED] placeholder-[#6E6E73] focus:border-[#D9A441] focus:outline-none"
            />
          </div>

          {/* Sliders: Density, Pattern Size, Stroke Width, Jitter */}
          <div className="space-y-4 pt-4 border-t border-[#222226]">
            {/* Font Size */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Font Size</span>
                <span className="text-[#D9A441]">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={120}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#D9A441] cursor-pointer"
              />
            </div>

            {/* Density */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Triangle Density (Divisions)</span>
                <span className="text-[#D9A441]">{density}</span>
              </div>
              <input
                type="range"
                min={3}
                max={16}
                step={1}
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full accent-[#D9A441] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6E6E73] mt-0.5">
                <span>Low (Sparse Doodle)</span>
                <span>Medium</span>
                <span>High (Dense Mesh)</span>
              </div>
            </div>

            {/* Pattern Size */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Pattern Tile Size</span>
                <span className="text-[#D9A441]">{patternSize}px</span>
              </div>
              <input
                type="range"
                min={40}
                max={160}
                step={5}
                value={patternSize}
                onChange={(e) => setPatternSize(Number(e.target.value))}
                className="w-full accent-[#D9A441] cursor-pointer"
              />
            </div>

            {/* Stroke Width */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Triangle Line Stroke</span>
                <span className="text-[#D9A441]">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={3.0}
                step={0.1}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-[#D9A441] cursor-pointer"
              />
            </div>

            {/* Jitter / Doodle Noise */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#A1A1A6] mb-1">
                <span>Organic Jitter / Doodle Noise</span>
                <span className="text-[#D9A441]">{Math.round(jitter * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.45}
                step={0.02}
                value={jitter}
                onChange={(e) => setJitter(Number(e.target.value))}
                className="w-full accent-[#D9A441] cursor-pointer"
              />
            </div>
          </div>

          {/* Toggles: Outline, Double Layer, Hover Effect */}
          <div className="pt-4 border-t border-[#222226] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setHasOutline(!hasOutline)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                hasOutline
                  ? "border-[#D9A441] bg-[#D9A441]/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Silhouette Outline</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {hasOutline ? "Active (Sharp)" : "Disabled"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDoubleLayer(!doubleLayer)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                doubleLayer
                  ? "border-emerald-500/50 bg-emerald-500/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Dual Contour</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {doubleLayer ? "No Clipping" : "Single Layer"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHoverEffect(!hoverEffect)}
              className={`cursor-pointer px-3 py-2 rounded-xl border text-xs font-mono transition-colors text-left ${
                hoverEffect
                  ? "border-sky-500/50 bg-sky-500/10 text-[#EDEDED]"
                  : "border-[#222226] bg-[#18181C] text-[#8B8B8F]"
              }`}
            >
              <div className="font-semibold">Hover Micro-FX</div>
              <div className="text-[10px] text-[#71717A] mt-0.5">
                {hoverEffect ? "Scale & Glow" : "Static"}
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Live Stage & Ready Code (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0B0B0D]">
          {/* Live Preview Stage */}
          <div
            className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.06) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="h-64 w-64 rounded-full bg-[#D9A441] blur-[120px]" />
            </div>

            {/* The Hybrid Text Component */}
            <div className="relative z-10 text-center max-w-full overflow-x-auto py-6">
              <HybridText
                as="h1"
                variant={currentVariant}
                density={density}
                patternSize={patternSize}
                strokeWidth={strokeWidth}
                jitter={jitter}
                outline={hasOutline ? outlineColor : false}
                outlineWidth={outlineWidth}
                doubleLayer={doubleLayer}
                hoverEffect={hoverEffect}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.1,
                  letterSpacing: "0.03em",
                }}
              >
                {text || "RAVEN"}
              </HybridText>
            </div>

            {/* Micro spec readout */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#71717A]">
              <span>Shape: Stalinist One</span>
              <span>Texture: Rubik Doodle Triangles Mesh</span>
              <span>Scale: {patternSize}px Tile</span>
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
                      ? "bg-[#D9A441] text-[#0B0B0C] font-semibold"
                      : "text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  React &lt;HybridText&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("css")}
                  className={`cursor-pointer px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeCodeTab === "css"
                      ? "bg-[#D9A441] text-[#0B0B0C] font-semibold"
                      : "text-[#8B8B8F] hover:text-[#EDEDED]"
                  }`}
                >
                  Pure CSS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("tailwind")}
                  className={`cursor-pointer px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                    activeCodeTab === "tailwind"
                      ? "bg-[#D9A441] text-[#0B0B0C] font-semibold"
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
                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-[#2A2A2E] bg-[#18181C] px-3 py-1 font-mono text-xs text-[#EDEDED] transition-all hover:border-[#D9A441] hover:text-[#D9A441]"
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
      </div>
    </div>
  );
}

export default HybridFontLab;
