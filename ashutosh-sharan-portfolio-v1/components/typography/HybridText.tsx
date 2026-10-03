"use client";

import React, { useMemo } from "react";
import {
  getTrianglePatternDataUri,
  PATTERN_PRESETS,
  type TrianglePatternOptions,
} from "@/lib/patterns/trianglePattern";

export type HybridTextVariant = "dark" | "light" | "gold" | "blueprint" | "raw" | "custom";

export interface HybridTextProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML Tag to render (default: "span") */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";
  /** Content to render */
  children: React.ReactNode;
  /** Extra CSS classes */
  className?: string;
  /** Colorway preset */
  variant?: HybridTextVariant;
  /** Density of the triangle doodle lattice ('low' | 'medium' | 'high' | 'ultra' or number) */
  density?: "low" | "medium" | "high" | "ultra" | number;
  /** Size in pixels of each repeating pattern square (default: 80) */
  patternSize?: number;
  /** Stroke width of individual triangle lines inside glyphs (default: 1.2) */
  strokeWidth?: number;
  /** Custom stroke color for triangles (overrides variant) */
  patternColor?: string;
  /** Custom background fill color inside glyph behind triangles (overrides variant) */
  bgColor?: string;
  /** Randomness/jitter level for hand-drawn look (0 to 0.45, default: 0.28) */
  jitter?: number;
  /** Random seed for reproducible geometric layout */
  seed?: number;
  /** Optional static SVG pattern URL (e.g. '/patterns/triangle-doodle.svg') */
  patternUrl?: string;
  /** Outer glyph silhouette outline/stroke (boolean or hex color) */
  outline?: boolean | string;
  /** Width of the outer outline stroke (default: "1.5px") */
  outlineWidth?: string | number;
  /** Whether to render a dual-layer contour to prevent inner clipping (default: true when outline active) */
  doubleLayer?: boolean;
  /** Subtle hover micro-animation effect */
  hoverEffect?: boolean;
}

export function HybridText({
  as: Component = "span",
  children,
  className = "",
  variant = "dark",
  density,
  patternSize = 80,
  strokeWidth,
  patternColor,
  bgColor,
  jitter,
  seed = 412,
  patternUrl,
  outline = false,
  outlineWidth = "1.5px",
  doubleLayer = true,
  hoverEffect = false,
  style,
  ...rest
}: HybridTextProps) {
  // Resolve variant presets
  const variantConfig = useMemo(() => {
    switch (variant) {
      case "light":
        return PATTERN_PRESETS.classicLight;
      case "gold":
        return PATTERN_PRESETS.cyberGold;
      case "blueprint":
        return PATTERN_PRESETS.blueprint;
      case "raw":
        return PATTERN_PRESETS.rawDoodle;
      case "dark":
      default:
        return PATTERN_PRESETS.brutalistDark;
    }
  }, [variant]);

  // Generate pattern data-uri or use static URL
  const patternUri = useMemo(() => {
    if (patternUrl) return patternUrl;

    const patternOptions: TrianglePatternOptions = {
      size: patternSize,
      density: density ?? variantConfig.density,
      strokeWidth: strokeWidth ?? variantConfig.strokeWidth,
      strokeColor: patternColor ?? variantConfig.strokeColor,
      bgColor: bgColor ?? variantConfig.bgColor,
      jitter: jitter ?? variantConfig.jitter,
      seed,
    };

    return getTrianglePatternDataUri(patternOptions);
  }, [
    patternUrl,
    patternSize,
    density,
    strokeWidth,
    patternColor,
    bgColor,
    jitter,
    seed,
    variantConfig,
  ]);

  // Determine outline stroke color
  const resolvedOutlineColor = useMemo(() => {
    if (!outline) return null;
    if (typeof outline === "string") return outline;
    if (variant === "light") return "#121214";
    if (variant === "gold") return "#D9A441";
    if (variant === "blueprint") return "#38BDF8";
    return "#111111";
  }, [outline, variant]);

  const outlineWidthStr = typeof outlineWidth === "number" ? `${outlineWidth}px` : outlineWidth;

  // Text fill layer with background-clip: text
  const textureStyle: React.CSSProperties = {
    backgroundImage: `url("${patternUri}")`,
    backgroundRepeat: "repeat",
    backgroundSize: `${patternSize}px ${patternSize}px`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    display: "inline-block",
  };

  // If simple single-layer outline is preferred (without doubleLayer)
  if (resolvedOutlineColor && !doubleLayer) {
    textureStyle.WebkitTextStroke = `${outlineWidthStr} ${resolvedOutlineColor}`;
  }

  // Base font style
  const baseFontStyle: React.CSSProperties = {
    fontFamily: "var(--font-stalinist-one), sans-serif",
    ...style,
  };

  // If doubleLayer outline is enabled, render backdrop contour + foreground pattern
  if (resolvedOutlineColor && doubleLayer) {
    return (
      <Component
        className={`relative inline-block select-none ${hoverEffect ? "group transition-transform duration-300 hover:scale-[1.02]" : ""} ${className}`}
        style={baseFontStyle}
        {...rest}
      >
        {/* Layer 1: Razor-sharp structural silhouette outline */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none text-transparent"
          style={{
            WebkitTextStroke: `${outlineWidthStr} ${resolvedOutlineColor}`,
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {children}
        </span>

        {/* Layer 2: Clipped Rubik Doodle Triangle texture */}
        <span
          className={`relative ${hoverEffect ? "transition-all duration-500 group-hover:brightness-110" : ""}`}
          style={textureStyle}
        >
          {children}
        </span>
      </Component>
    );
  }

  // Single layer clipped text
  return (
    <Component
      className={`relative inline-block select-none ${hoverEffect ? "transition-transform duration-300 hover:scale-[1.02]" : ""} ${className}`}
      style={{
        ...baseFontStyle,
        ...textureStyle,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

// Friendly aliases
export const RavenHybridText = HybridText;
export const HybridFont = HybridText;
export default HybridText;
