/**
 * Procedural SVG Triangle Doodle Pattern Generator
 * Creates seamless, toroidal tileable triangle meshes inspired by Rubik Doodle Triangles.
 */

export interface TrianglePatternOptions {
  /** Size in pixels of the square SVG pattern tile (default: 100) */
  size?: number;
  /** Subdivisions per axis: number (e.g. 4 to 16) or semantic level */
  density?: "low" | "medium" | "high" | "ultra" | number;
  /** Stroke width of the triangle edges (default: 1.2) */
  strokeWidth?: number;
  /** Stroke color of the triangle lines (default: "#EDEDED") */
  strokeColor?: string;
  /** Background color behind the triangles (default: "#111111" or "transparent") */
  bgColor?: string;
  /** Jitter/noise intensity between 0 (rigid grid) and 0.45 (wild doodle) (default: 0.28) */
  jitter?: number;
  /** Randomization seed for reproducible organic looks (default: 412) */
  seed?: number;
  /** Opacity of the stroke lines (0 to 1, default: 0.92) */
  opacity?: number;
  /** Include inner micro-triangles/doodle centers inside each cell (default: true) */
  rubikMicroDoodles?: boolean;
}

// Simple deterministic PRNG
function pseudoRandom(seed: number) {
  const s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

export function generateTrianglePatternSvg(options: TrianglePatternOptions = {}): string {
  const size = options.size ?? 100;
  const strokeWidth = options.strokeWidth ?? 1.2;
  const strokeColor = options.strokeColor ?? "#EDEDED";
  const bgColor = options.bgColor ?? "#111111";
  const jitterFactor = Math.min(Math.max(options.jitter ?? 0.28, 0), 0.45);
  const seed = options.seed ?? 412;
  const opacity = options.opacity ?? 0.92;
  const withMicroDoodles = options.rubikMicroDoodles ?? true;

  let divisions = 6;
  if (typeof options.density === "number") {
    divisions = Math.max(2, Math.min(24, Math.round(options.density)));
  } else if (options.density === "low") {
    divisions = 4;
  } else if (options.density === "medium") {
    divisions = 6;
  } else if (options.density === "high") {
    divisions = 10;
  } else if (options.density === "ultra") {
    divisions = 14;
  }

  const step = size / divisions;

  // Generate toroidal jittered grid vertices
  // Grid size is (divisions + 1) x (divisions + 1)
  // Toroidal wrapping: vertex at (divisions, j) must equal vertex (0, j) + size on X
  const vertices: { x: number; y: number }[][] = [];

  for (let i = 0; i <= divisions; i++) {
    vertices[i] = [];
    for (let j = 0; j <= divisions; j++) {
      const baseX = i * step;
      const baseY = j * step;

      // Wrap indices for toroidal seamless continuity
      const wrapI = i % divisions;
      const wrapJ = j % divisions;
      const cellSeed = seed + wrapI * 37.13 + wrapJ * 71.97;

      const rX = (pseudoRandom(cellSeed) - 0.5) * 2;
      const rY = (pseudoRandom(cellSeed + 13.5) - 0.5) * 2;

      // For seamless boundaries, boundary nodes only jitter along the boundary or identically wrap
      const dx = rX * step * jitterFactor;
      const dy = rY * step * jitterFactor;

      vertices[i][j] = {
        x: Number((baseX + dx).toFixed(2)),
        y: Number((baseY + dy).toFixed(2)),
      };
    }
  }

  // Paths collection
  const paths: string[] = [];

  for (let i = 0; i < divisions; i++) {
    for (let j = 0; j < divisions; j++) {
      const p00 = vertices[i][j];
      const p10 = vertices[i + 1][j];
      const p01 = vertices[i][j + 1];
      const p11 = vertices[i + 1][j + 1];

      // Alternate diagonal direction deterministically for natural doodle triangulation
      const flipDiag = (i + j) % 2 === 0;

      if (flipDiag) {
        // Triangle 1: p00 -> p10 -> p11
        // Triangle 2: p00 -> p11 -> p01
        paths.push(`M${p00.x},${p00.y} L${p10.x},${p10.y} L${p11.x},${p11.y} Z`);
        paths.push(`M${p00.x},${p00.y} L${p11.x},${p11.y} L${p01.x},${p01.y} Z`);

        if (withMicroDoodles && divisions <= 10) {
          // Centroid micro-doodle in triangle 1
          const c1x = Number(((p00.x + p10.x + p11.x) / 3).toFixed(2));
          const c1y = Number(((p00.y + p10.y + p11.y) / 3).toFixed(2));
          const scale = 0.35;
          const m1a = { x: (c1x + (p00.x - c1x) * scale).toFixed(2), y: (c1y + (p00.y - c1y) * scale).toFixed(2) };
          const m1b = { x: (c1x + (p10.x - c1x) * scale).toFixed(2), y: (c1y + (p10.y - c1y) * scale).toFixed(2) };
          const m1c = { x: (c1x + (p11.x - c1x) * scale).toFixed(2), y: (c1y + (p11.y - c1y) * scale).toFixed(2) };
          paths.push(`M${m1a.x},${m1a.y} L${m1b.x},${m1b.y} L${m1c.x},${m1c.y} Z`);
        }
      } else {
        // Triangle 1: p00 -> p10 -> p01
        // Triangle 2: p10 -> p11 -> p01
        paths.push(`M${p00.x},${p00.y} L${p10.x},${p10.y} L${p01.x},${p01.y} Z`);
        paths.push(`M${p10.x},${p10.y} L${p11.x},${p11.y} L${p01.x},${p01.y} Z`);

        if (withMicroDoodles && divisions <= 10) {
          const c2x = Number(((p10.x + p11.x + p01.x) / 3).toFixed(2));
          const c2y = Number(((p10.y + p11.y + p01.y) / 3).toFixed(2));
          const scale = 0.35;
          const m2a = { x: (c2x + (p10.x - c2x) * scale).toFixed(2), y: (c2y + (p10.y - c2y) * scale).toFixed(2) };
          const m2b = { x: (c2x + (p11.x - c2x) * scale).toFixed(2), y: (c2y + (p11.y - c2y) * scale).toFixed(2) };
          const m2c = { x: (c2x + (p01.x - c2x) * scale).toFixed(2), y: (c2y + (p01.y - c2y) * scale).toFixed(2) };
          paths.push(`M${m2a.x},${m2a.y} L${m2b.x},${m2b.y} L${m2c.x},${m2c.y} Z`);
        }
      }
    }
  }

  const bgRect = bgColor && bgColor !== "transparent"
    ? `<rect width="${size}" height="${size}" fill="${bgColor}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${bgRect}
<g fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">
<path d="${paths.join(" ")}"/>
</g>
</svg>`;
}

/**
 * Returns an encoded Data URI ready for CSS `background-image: url(...)`
 */
export function getTrianglePatternDataUri(options: TrianglePatternOptions = {}): string {
  const svg = generateTrianglePatternSvg(options);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const PATTERN_PRESETS = {
  brutalistDark: {
    strokeColor: "#EDEDED",
    bgColor: "#111111",
    strokeWidth: 1.2,
    density: "medium",
    jitter: 0.28,
  },
  classicLight: {
    strokeColor: "#121214",
    bgColor: "#FAFAFA",
    strokeWidth: 1.3,
    density: "medium",
    jitter: 0.26,
  },
  cyberGold: {
    strokeColor: "#D9A441",
    bgColor: "#0A0A0C",
    strokeWidth: 1.2,
    density: "high",
    jitter: 0.24,
  },
  blueprint: {
    strokeColor: "#38BDF8",
    bgColor: "#030712",
    strokeWidth: 1.1,
    density: "high",
    jitter: 0.20,
  },
  rawDoodle: {
    strokeColor: "#F4F4F6",
    bgColor: "#18181B",
    strokeWidth: 1.6,
    density: "low",
    jitter: 0.38,
  },
} as const;
