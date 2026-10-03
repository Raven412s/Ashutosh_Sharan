"use client";

import React, { useMemo } from "react";
import {
  DISTRESSED_GLYPHS,
  DISTRESSED_STALINIST_METRICS,
  getKerning,
} from "@/lib/typography/distressedStalinistData";

export type DistressedPreset = "subtle" | "medium" | "heavy" | "apocalyptic" | "custom";

export interface DistressedTextProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML Tag to render (default: "span") */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";
  /** Text content to distress */
  children: React.ReactNode;
  /** Extra CSS classes (e.g. text-white, text-red-500, text-6xl) */
  className?: string;
  /** Damage intensity (default: 0.35) */
  intensity?: number;
  /** Deterministic PRNG seed (default: 412) */
  seed?: number;
  /** Text color override */
  color?: string;
  /** Character color overrides (by char, e.g. { A: "#DC143C" }, or function) */
  charColors?: Record<string, string> | ((char: string, index: number, word: string) => string | undefined);
  /** Render as wireframe outline stroke */
  stroked?: boolean;
  /** When used as an inline character with font text, scale height to match capHeight */
  inlineChar?: boolean;
  /** Stroke width for outline rendering */
  strokeWidth?: number | string;
  /** Stroke color override */
  strokeColor?: string;
  /** Interactive hover effect */
  hoverEffect?: boolean;
  /** Backward-compatible preset */
  preset?: DistressedPreset;
  /** Backward-compatible chunkSize */
  chunkSize?: number;
  /** Backward-compatible edgeDamage */
  edgeDamage?: boolean;
  /** Backward-compatible scratches */
  scratches?: boolean;
  /** Backward-compatible speckles */
  speckles?: boolean;
}

interface WordGlyphPlacement {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
}

interface WordLayout {
  glyphs: WordGlyphPlacement[];
  totalWidth: number;
  viewBox: string;
  hasDescender: boolean;
}

/**
 * Computes exact typographic advance positions and kerning for a word of Stalinist One glyphs.
 */
function layoutWord(word: string): WordLayout {
  const chars = Array.from(word);
  const glyphs: WordGlyphPlacement[] = [];
  let currentX = 0;
  let hasDescender = false;

  for (let i = 0; i < chars.length; i++) {
    const rawChar = chars[i];
    const glyphData = DISTRESSED_GLYPHS[rawChar] || DISTRESSED_GLYPHS[rawChar.toUpperCase()];

    if (!glyphData) {
      // Non-supported character: fallback advance
      currentX += DISTRESSED_STALINIST_METRICS.spaceWidth;
      continue;
    }

    if ("qQgjpy".includes(rawChar)) {
      hasDescender = true;
    }

    // Apply kerning with previous character
    if (i > 0) {
      const prevChar = chars[i - 1];
      const kern = getKerning(prevChar, rawChar);
      currentX += kern;
    }

    glyphs.push({
      char: rawChar,
      x: currentX,
      y: 0,
      width: glyphData.width,
      height: glyphData.height,
      path: glyphData.path,
    });

    currentX += glyphData.advanceWidth;
  }

  // Cap height reference is 700. Standard SVG frame height is 780; with Q descender: 940.
  const frameHeight = hasDescender ? 940 : 780;
  const padX = 25;
  const totalW = Math.max(10, currentX + padX * 2);
  const viewBox = `${-padX} -40 ${totalW} ${frameHeight}`;

  return {
    glyphs,
    totalWidth: totalW,
    viewBox,
    hasDescender,
  };
}

export function DistressedText({
  as: Component = "span",
  children,
  className = "",
  color,
  charColors,
  stroked = false,
  inlineChar = false,
  strokeWidth = 1.5,
  strokeColor,
  hoverEffect = false,
  style,
  ...rest
}: DistressedTextProps) {
  const textContent = typeof children === "string" ? children : String(children ?? "");

  // Tokenize text into words and whitespace
  const wordsAndSpaces = useMemo(() => {
    // Split by whitespace preserving spaces
    const tokens = textContent.split(/(\s+)/);
    return tokens.map((token, index) => {
      if (/^\s+$/.test(token)) {
        // Whitespace token: calculate typographic space width
        const spaceCount = token.length;
        const spaceEm = (DISTRESSED_STALINIST_METRICS.spaceWidth / DISTRESSED_STALINIST_METRICS.capHeight) * spaceCount;
        return {
          type: "space" as const,
          id: `space-${index}`,
          widthEm: Number(spaceEm.toFixed(3)),
          raw: token,
        };
      }

      // Word token
      const layout = layoutWord(token);
      return {
        type: "word" as const,
        id: `word-${index}-${token}`,
        word: token,
        layout,
      };
    });
  }, [textContent]);

  const isInline = inlineChar;
  const firstWordLayout = wordsAndSpaces.find((w) => w.type === "word")?.layout;
  const baselineOffset = firstWordLayout?.hasDescender ? "-0.16em" : "-0.04em";

  return (
    <Component
      className={`${
        isInline ? "inline-block" : "inline-flex flex-wrap items-baseline"
      } select-none font-normal leading-none ${
        hoverEffect ? "transition-all duration-300 hover:brightness-125 hover:scale-[1.01]" : ""
      } ${className}`}
      style={{
        color: color || undefined,
        verticalAlign: isInline ? baselineOffset : undefined,
        ...style,
      }}
      role="img"
      aria-label={textContent}
      {...rest}
    >
      {wordsAndSpaces.map((item) => {
        if (item.type === "space") {
          return (
            <span
              key={item.id}
              className="inline-block"
              style={{ width: `${item.widthEm}em` }}
              aria-hidden="true"
            >
              &nbsp;
            </span>
          );
        }

        const { layout } = item;
        const aspectRatio = layout.totalWidth / (layout.hasDescender ? 940 : 780);
        const hScale = inlineChar ? 0.78 : 1.0;

        return (
          <span
            key={item.id}
            className="inline-block relative fill-current leading-none"
            style={{
              height: `${hScale}em`,
              width: `calc(${hScale}em * ${aspectRatio.toFixed(3)})`,
              verticalAlign: isInline ? "baseline" : (layout.hasDescender ? "-0.16em" : "-0.04em"),
            }}
            aria-hidden="true"
          >
            <svg
              viewBox={layout.viewBox}
              className="w-full h-full fill-current overflow-visible"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              {layout.glyphs.map((g, gIdx) => {
                const charKeyUpper = g.char.toUpperCase();
                const charKeyLower = g.char.toLowerCase();
                const specificColor =
                  typeof charColors === "function"
                    ? charColors(g.char, gIdx, item.word)
                    : charColors?.[charKeyUpper] ??
                      charColors?.[charKeyLower] ??
                      charColors?.[String(gIdx)];

                const fillValue = stroked
                  ? "none"
                  : (specificColor || color || "currentColor");

                const strokeValue = stroked
                  ? (specificColor || strokeColor || color || "currentColor")
                  : undefined;

                return (
                  <g key={`g-${gIdx}-${g.char}`} transform={`translate(${g.x}, 0)`}>
                    <path
                      d={g.path}
                      fill={fillValue}
                      stroke={strokeValue}
                      strokeWidth={stroked ? strokeWidth : undefined}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fillRule="nonzero"
                    />
                  </g>
                );
              })}
            </svg>
          </span>
        );
      })}
    </Component>
  );
}

export const RavenDistressedText = DistressedText;
export default DistressedText;
