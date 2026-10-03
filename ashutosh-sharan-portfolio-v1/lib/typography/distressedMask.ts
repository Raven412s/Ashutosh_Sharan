/**
 * Procedural Glyph-Aware Distressed Mask Engine
 * Recreates the physical chiseled & fractured erosion of Rubik Distressed on Stalinist One.
 *
 * Algorithm:
 * 1. Analyzes actual glyph stroke silhouette (via offscreen Canvas sampling on client, with SSR fallback).
 * 2. Identifies exact edge contour pixels and internal stroke core pixels.
 * 3. Spawns non-uniform damage clusters (damage foci) containing:
 *    - Large angular chisel bites (3-6 vertices) cutting into the outer boundary.
 *    - Internal fracture chunks.
 *    - Thin hairline stress cracks.
 *    - Rare micro-erosion speckles clustered near the break.
 * 4. Leaves ~70% of the glyph intact at medium intensity (0.35) for crisp typographic legibility.
 * 5. Uses deterministic PRNG with seed for reproducible layout per character.
 */

export interface GlyphDistressOptions {
  /** The single character to distress */
  char: string;
  /** Global seed */
  seed?: number;
  /** Damage intensity: 0.1 (subtle) to 0.85 (ruins) (default: 0.35) */
  intensity?: number;
  /** Bite chunk scale in relative units (default: 26) */
  chunkSize?: number;
  /** Whether to cut angular bites from outer contour (default: true) */
  edgeDamage?: boolean;
  /** Whether to propagate hairline cracks (default: true) */
  scratches?: boolean;
  /** Whether to add micro stipple speckles near fracture zones (default: true) */
  speckles?: boolean;
  /** Canvas sampling resolution (default: 100) */
  resolution?: number;
}

// Deterministic Mulberry32 PRNG
export function createPrng(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PixelPoint {
  x: number;
  y: number;
  nx?: number;
  ny?: number;
}

// In-memory cache for client-side sampled glyph masks
const MASK_CACHE = new Map<string, string>();

/**
 * Probes the actual rendered Stalinist One glyph on an offscreen canvas to locate
 * exact edge contour pixels and internal solid pixels.
 */
function probeGlyphSilhouette(
  char: string,
  res: number
): { edgePixels: PixelPoint[]; solidPixels: PixelPoint[] } {
  if (typeof document === "undefined" || !char || char.trim() === "") {
    return { edgePixels: [], solidPixels: [] };
  }

  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { edgePixels: [], solidPixels: [] };

  // Render character centered in canvas with Stalinist One
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(res * 0.76)}px "Stalinist One", var(--font-stalinist-one), sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, res / 2, res / 2);

  const imgData = ctx.getImageData(0, 0, res, res);
  const data = imgData.data;

  const isSolid = (px: number, py: number): boolean => {
    if (px < 0 || px >= res || py < 0 || py >= res) return false;
    const idx = (py * res + px) * 4 + 3; // alpha channel
    return data[idx] > 110;
  };

  const edgePixels: PixelPoint[] = [];
  const solidPixels: PixelPoint[] = [];

  for (let y = 1; y < res - 1; y++) {
    for (let x = 1; x < res - 1; x++) {
      if (isSolid(x, y)) {
        solidPixels.push({ x, y });

        // Check 4-neighborhood for boundary transition
        const topEmpty = !isSolid(x, y - 1);
        const botEmpty = !isSolid(x, y + 1);
        const leftEmpty = !isSolid(x - 1, y);
        const rightEmpty = !isSolid(x + 1, y);

        if (topEmpty || botEmpty || leftEmpty || rightEmpty) {
          // Normal pointing inward towards solid interior
          let nx = 0;
          let ny = 0;
          if (leftEmpty) nx += 1;
          if (rightEmpty) nx -= 1;
          if (topEmpty) ny += 1;
          if (botEmpty) ny -= 1;

          const len = Math.hypot(nx, ny) || 1;
          edgePixels.push({
            x,
            y,
            nx: nx / len,
            ny: ny / len,
          });
        }
      }
    }
  }

  return { edgePixels, solidPixels };
}

/**
 * Fallback contour generator for SSR when canvas is unavailable.
 * Generates geometric boundary points based on typical Stalinist One letter bounding zones.
 */
function getSsrFallbackPoints(char: string, res: number): { edgePixels: PixelPoint[]; solidPixels: PixelPoint[] } {
  const edgePixels: PixelPoint[] = [];
  const solidPixels: PixelPoint[] = [];

  // Approximate thick brutalist outer ring
  const pad = res * 0.16;
  const w = res - pad * 2;
  const h = res - pad * 2;

  // Top, bottom, left, right perimeter samples
  for (let i = 0; i <= 20; i++) {
    const frac = i / 20;
    // Top stroke
    edgePixels.push({ x: pad + frac * w, y: pad, nx: 0, ny: 1 });
    // Bottom stroke
    edgePixels.push({ x: pad + frac * w, y: pad + h, nx: 0, ny: -1 });
    // Left stem
    edgePixels.push({ x: pad, y: pad + frac * h, nx: 1, ny: 0 });
    // Right stem
    edgePixels.push({ x: pad + w, y: pad + frac * h, nx: -1, ny: 0 });

    solidPixels.push({ x: pad + frac * w, y: pad + h * 0.5 });
  }

  return { edgePixels, solidPixels };
}

/**
 * Generates an SVG mask Data URI specifically tailored to the given character's geometry.
 */
export function getGlyphDistressMaskDataUri(options: GlyphDistressOptions): string {
  const {
    char,
    seed = 412,
    intensity = 0.35,
    chunkSize = 26,
    edgeDamage = true,
    scratches = true,
    speckles = true,
    resolution = 100,
  } = options;

  if (!char || char === " ") {
    // Empty character needs no mask
    return "";
  }

  const cacheKey = `${char}_${seed}_${intensity.toFixed(2)}_${chunkSize}_${edgeDamage}_${scratches}_${speckles}`;
  if (MASK_CACHE.has(cacheKey)) {
    return MASK_CACHE.get(cacheKey)!;
  }

  const rand = createPrng(seed);

  // 1. Probe actual glyph silhouette
  let { edgePixels, solidPixels } = probeGlyphSilhouette(char, resolution);
  if (edgePixels.length === 0) {
    const fallback = getSsrFallbackPoints(char, resolution);
    edgePixels = fallback.edgePixels;
    solidPixels = fallback.solidPixels;
  }

  const elements: string[] = [];

  // 2. Determine number of damage clusters based on intensity
  // At 0.35 (medium): 2 or 3 edge clusters, 1 internal
  // At 0.55 (heavy): 3 or 4 edge clusters, 2 internal
  const clampedIntensity = Math.min(Math.max(intensity, 0.05), 0.95);
  const numEdgeClusters = edgeDamage
    ? Math.max(1, Math.round(1 + clampedIntensity * 4.2))
    : 0;
  const numInternalClusters = Math.round(clampedIntensity * 2.2);

  // Helper to pick a point far from already chosen cluster centers
  const chosenCenters: { x: number; y: number }[] = [];
  const pickClusterCenter = (pool: PixelPoint[]): PixelPoint | null => {
    if (pool.length === 0) return null;
    let bestPoint = pool[Math.floor(rand() * pool.length)];
    let bestDist = 0;

    // Try up to 10 candidates to find one with good spatial separation
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = pool[Math.floor(rand() * pool.length)];
      let minDist = Infinity;
      for (const c of chosenCenters) {
        const d = Math.hypot(candidate.x - c.x, candidate.y - c.y);
        if (d < minDist) minDist = d;
      }
      if (chosenCenters.length === 0 || minDist > bestDist) {
        bestDist = minDist;
        bestPoint = candidate;
        if (minDist > resolution * 0.28) break; // Good separation reached
      }
    }

    chosenCenters.push({ x: bestPoint.x, y: bestPoint.y });
    return bestPoint;
  };

  // 3. Generate Edge Bites (Angular triangular/polygonal chunks breaking the outer contour)
  for (let c = 0; c < numEdgeClusters; c++) {
    const center = pickClusterCenter(edgePixels);
    if (!center) break;

    const nx = center.nx ?? (rand() - 0.5);
    const ny = center.ny ?? (rand() - 0.5);
    const len = Math.hypot(nx, ny) || 1;
    const inX = nx / len;
    const inY = ny / len;
    // Tangent vector along edge
    const tx = -inY;
    const ty = inX;

    // Relative bite depth & width scaled by chunkSize and intensity
    const biteScale = (chunkSize / 26) * (0.8 + rand() * 0.6) * (0.7 + clampedIntensity * 0.7);
    const depth = (resolution * 0.16) * biteScale;
    const halfWidth = (resolution * 0.14) * biteScale;

    // 4 to 6 vertex irregular chisel bite
    // Polygon starts outside edge, digs sharply into the glyph along inX/inY, then exits
    const p1 = {
      x: center.x - tx * (halfWidth * (0.8 + rand() * 0.4)) - inX * (depth * 0.2),
      y: center.y - ty * (halfWidth * (0.8 + rand() * 0.4)) - inY * (depth * 0.2),
    };
    // Deep penetration apex point(s)
    const pApex1 = {
      x: center.x + inX * (depth * (0.85 + rand() * 0.35)) - tx * (halfWidth * 0.25),
      y: center.y + inY * (depth * (0.85 + rand() * 0.35)) - ty * (halfWidth * 0.25),
    };
    const pApex2 = {
      x: center.x + inX * (depth * (0.65 + rand() * 0.4)) + tx * (halfWidth * 0.3),
      y: center.y + inY * (depth * (0.65 + rand() * 0.4)) + ty * (halfWidth * 0.3),
    };
    const p2 = {
      x: center.x + tx * (halfWidth * (0.8 + rand() * 0.4)) - inX * (depth * 0.2),
      y: center.y + ty * (halfWidth * (0.8 + rand() * 0.4)) - inY * (depth * 0.2),
    };
    // Outside boundary anchor to ensure full silhouette severance
    const pOut = {
      x: center.x - inX * (depth * 0.5),
      y: center.y - inY * (depth * 0.5),
    };

    const pts = [pOut, p1, pApex1, pApex2, p2]
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");

    elements.push(`<polygon points="${pts}" fill="black" />`);

    // 4. Hairline stress crack radiating from this edge crater
    if (scratches && rand() > 0.25) {
      let crackX = pApex1.x;
      let crackY = pApex1.y;
      const crackLen = depth * (0.9 + rand() * 0.8);
      const crackAngle = Math.atan2(inY, inX) + (rand() - 0.5) * 0.7;
      const sw = (1.2 + rand() * 1.3).toFixed(1);

      let d = `M${crackX.toFixed(1)},${crackY.toFixed(1)}`;
      const segments = Math.floor(rand() * 2) + 2;
      const segStep = crackLen / segments;

      for (let s = 0; s < segments; s++) {
        const segAngle = crackAngle + (rand() - 0.5) * 0.8;
        crackX += Math.cos(segAngle) * segStep;
        crackY += Math.sin(segAngle) * segStep;
        d += ` L${crackX.toFixed(1)},${crackY.toFixed(1)}`;
      }

      elements.push(
        `<path d="${d}" stroke="black" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none" />`
      );
    }

    // 5. Micro-erosion speckles clustered strictly near the crater
    if (speckles) {
      const dotCount = Math.floor(rand() * 4) + 2;
      for (let i = 0; i < dotCount; i++) {
        const dotR = 0.9 + rand() * 1.3;
        const angle = rand() * Math.PI * 2;
        const dist = depth * (0.5 + rand() * 0.8);
        const dx = (center.x + Math.cos(angle) * dist).toFixed(1);
        const dy = (center.y + Math.sin(angle) * dist).toFixed(1);
        elements.push(`<circle cx="${dx}" cy="${dy}" r="${dotR.toFixed(1)}" fill="black" />`);
      }
    }
  }

  // 6. Generate Internal Fractures (Chipped gouges inside solid stems)
  for (let c = 0; c < numInternalClusters; c++) {
    const center = pickClusterCenter(solidPixels);
    if (!center) break;

    const numVerts = Math.floor(rand() * 3) + 3; // 3 to 5 vertices
    const shardRadius = (chunkSize / 26) * (resolution * 0.08) * (0.6 + rand() * 0.7) * (0.7 + clampedIntensity * 0.6);
    const pts: string[] = [];

    for (let v = 0; v < numVerts; v++) {
      const a = (v / numVerts) * Math.PI * 2 + (rand() - 0.5) * 0.8;
      const r = shardRadius * (0.4 + rand() * 0.8);
      pts.push(`${(center.x + Math.cos(a) * r).toFixed(1)},${(center.y + Math.sin(a) * r).toFixed(1)}`);
    }

    elements.push(`<polygon points="${pts.join(" ")}" fill="black" />`);

    if (scratches && rand() > 0.4) {
      const sx = center.x;
      const sy = center.y;
      const crackAngle = rand() * Math.PI * 2;
      const crackLen = shardRadius * (1.2 + rand() * 1.5);
      const sw = (1.1 + rand() * 1.1).toFixed(1);
      const ex = sx + Math.cos(crackAngle) * crackLen;
      const ey = sy + Math.sin(crackAngle) * crackLen;
      elements.push(
        `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}" stroke="black" stroke-width="${sw}" stroke-linecap="round" fill="none" />`
      );
    }
  }

  // Final SVG: Base is white (opaque). Black shapes carved out become 100% transparent.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${resolution}" height="${resolution}" viewBox="0 0 ${resolution} ${resolution}">
<defs>
  <mask id="g-distress">
    <rect width="${resolution}" height="${resolution}" fill="white" />
    ${elements.join("\n    ")}
  </mask>
</defs>
<rect width="${resolution}" height="${resolution}" fill="black" mask="url(#g-distress)" />
</svg>`;

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const dataUri = `data:image/svg+xml;charset=utf-8,${encoded}`;

  MASK_CACHE.set(cacheKey, dataUri);
  return dataUri;
}

export const DISTRESSED_PRESETS = {
  subtle: {
    intensity: 0.18,
    chunkSize: 20,
    edgeDamage: true,
    scratches: true,
    speckles: true,
  },
  medium: {
    intensity: 0.35,
    chunkSize: 28,
    edgeDamage: true,
    scratches: true,
    speckles: true,
  },
  heavy: {
    intensity: 0.55,
    chunkSize: 36,
    edgeDamage: true,
    scratches: true,
    speckles: true,
  },
  apocalyptic: {
    intensity: 0.78,
    chunkSize: 44,
    edgeDamage: true,
    scratches: true,
    speckles: true,
  },
} as const;
