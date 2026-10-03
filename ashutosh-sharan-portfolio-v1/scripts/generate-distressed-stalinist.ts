import fs from "fs";
import path from "path";
import opentype, { Font, Glyph } from "opentype.js";

interface Point {
  x: number;
  y: number;
}

interface Triangle {
  p1: Point;
  p2: Point;
  p3: Point;
  centroid: Point;
}

interface Cluster {
  id: number;
  triangles: Triangle[];
  shiftX: number;
  shiftY: number;
}

export interface GlyphMetricsData {
  char: string;
  advanceWidth: number;
  leftSideBearing: number;
  width: number;
  height: number;
  vbX: number;
  vbY: number;
  vbW: number;
  vbH: number;
  path: string;
  triCount: number;
  clusterCount: number;
}

// Deterministic Mulberry32 PRNG
function createPrng(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Discretizes Bézier curves (Q, C) from opentype.js Path into dense polylines.
 * Normalizes coordinates into upright SVG space:
 * Top of cap = 0, Baseline = capHeight (~700).
 */
function discretizeAndNormalizeGlyphContours(
  glyph: Glyph,
  step = 8
): { contours: Point[][]; bounds: { minX: number; minY: number; maxX: number; maxY: number }; rawBb: { x1: number; y1: number; x2: number; y2: number } } {
  const glyphPath = glyph.getPath(0, 0, 1000);
  const bb = glyphPath.getBoundingBox();

  const capHeight = 700;
  const offsetX = bb.x1;
  const offsetY = -capHeight;

  const contours: Point[][] = [];
  let currentContour: Point[] = [];
  let curX = 0;
  let curY = 0;

  const toSvgPt = (x: number, y: number): Point => ({
    x: Number((x - offsetX).toFixed(2)),
    y: Number((y - offsetY).toFixed(2)),
  });

  for (const cmd of glyphPath.commands) {
    if (cmd.type === "M") {
      if (currentContour.length > 2) contours.push(currentContour);
      const pt = toSvgPt(cmd.x, cmd.y);
      currentContour = [pt];
      curX = cmd.x;
      curY = cmd.y;
    } else if (cmd.type === "L") {
      currentContour.push(toSvgPt(cmd.x, cmd.y));
      curX = cmd.x;
      curY = cmd.y;
    } else if (cmd.type === "Q") {
      const steps = Math.max(3, Math.ceil(Math.hypot(cmd.x - curX, cmd.y - curY) / step));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const rawX = mt * mt * curX + 2 * mt * t * cmd.x1 + t * t * cmd.x;
        const rawY = mt * mt * curY + 2 * mt * t * cmd.y1 + t * t * cmd.y;
        currentContour.push(toSvgPt(rawX, rawY));
      }
      curX = cmd.x;
      curY = cmd.y;
    } else if (cmd.type === "C") {
      const steps = Math.max(4, Math.ceil(Math.hypot(cmd.x - curX, cmd.y - curY) / step));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const rawX =
          mt * mt * mt * curX +
          3 * mt * mt * t * cmd.x1 +
          3 * mt * t * t * cmd.x2 +
          t * t * t * cmd.x;
        const rawY =
          mt * mt * mt * curY +
          3 * mt * mt * t * cmd.y1 +
          3 * mt * t * t * cmd.y2 +
          t * t * t * cmd.y;
        currentContour.push(toSvgPt(rawX, rawY));
      }
      curX = cmd.x;
      curY = cmd.y;
    } else if (cmd.type === "Z") {
      if (currentContour.length > 2) contours.push(currentContour);
      currentContour = [];
    }
  }

  if (currentContour.length > 2) contours.push(currentContour);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of contours) {
    for (const p of c) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  return { contours, bounds: { minX, minY, maxX, maxY }, rawBb: bb };
}

/**
 * Point-in-polygon ray-casting test (even-odd winding rule)
 * Correctly handles outer contours and internal counters/holes.
 */
function withinGlyphBlack(px: number, py: number, contours: Point[][]): boolean {
  let inside = false;

  for (const contour of contours) {
    const len = contour.length;
    for (let i = 0, j = len - 1; i < len; j = i++) {
      const xi = contour[i].x;
      const yi = contour[i].y;
      const xj = contour[j].x;
      const yj = contour[j].y;

      const intersect =
        yi > py !== yj > py &&
        px < ((xj - xi) * (py - yi)) / ((yj - yi) || 0.00001) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
  }

  return inside;
}

/**
 * Snaps (px, py) to the nearest point on any segment of the glyph's contours.
 */
function returnNearestPoint(px: number, py: number, contours: Point[][]): Point {
  let bestX = px;
  let bestY = py;
  let minDist = Infinity;

  for (const contour of contours) {
    const len = contour.length;
    for (let i = 0, j = len - 1; i < len; j = i++) {
      const ax = contour[j].x;
      const ay = contour[j].y;
      const bx = contour[i].x;
      const by = contour[i].y;

      const abx = bx - ax;
      const aby = by - ay;
      const apx = px - ax;
      const apy = py - ay;

      const abLenSq = abx * abx + aby * aby;
      if (abLenSq === 0) continue;

      let t = (apx * abx + apy * aby) / abLenSq;
      t = Math.max(0, Math.min(1, t));

      const projX = ax + t * abx;
      const projY = ay + t * aby;
      const d = Math.hypot(px - projX, py - projY);

      if (d < minDist) {
        minDist = d;
        bestX = projX;
        bestY = projY;
      }
    }
  }

  return { x: bestX, y: bestY };
}

/**
 * NaN Algorithm Step 1: makeIsometricGrid
 */
function makeIsometricGrid(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  gridsize: number
): Point[][] {
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const cols = Math.ceil(w / gridsize) + 2;
  const rows = Math.ceil(h / gridsize) + 2;
  const lines: Point[][] = [];
  const mx = bounds.minX - gridsize;
  const my = bounds.minY - gridsize;

  for (let y = 0; y <= rows + 1; y++) {
    const line: Point[] = [];
    for (let x = 0; x <= cols + 1; x++) {
      const ny = my + y * gridsize;
      const nx = y % 2 === 0 ? mx + x * gridsize : mx + x * gridsize + gridsize / 2;
      line.push({ x: nx, y: ny });
    }
    lines.push(line);
  }

  return lines;
}

/**
 * NaN Algorithm Step 2: RandomiseIsoPoints
 */
function randomiseIsoPoints(lines: Point[][], gridsize: number, rand: () => number): Point[][] {
  const maxmove = Math.floor(gridsize / 3);

  return lines.map((line) =>
    line.map((pt) => {
      const rx = (rand() - 0.5) * 2 * maxmove;
      const ry = (rand() - 0.5) * 2 * maxmove;
      return { x: pt.x + rx, y: pt.y + ry };
    })
  );
}

/**
 * NaN Algorithm Step 3: IsoGridToTriangles
 */
function isoGridToTriangles(lines: Point[][]): Triangle[] {
  const allTriangles: Triangle[] = [];

  for (let n = 0; n < lines.length - 1; n++) {
    const line1 = lines[n];
    const line2 = lines[n + 1];

    for (let s = 0; s < line1.length - 1; s++) {
      const p1 = line1[s];
      const p2 = line1[s + 1];
      const p3 = line2[s];
      const p4 = line2[s + 1];

      if (n % 2 === 0) {
        const t1: Triangle = {
          p1,
          p2: p3,
          p3: p2,
          centroid: { x: (p1.x + p3.x + p2.x) / 3, y: (p1.y + p3.y + p2.y) / 3 },
        };
        allTriangles.push(t1);

        if (s > 0 && s - 1 < line2.length) {
          const pPrev = line2[s - 1];
          const t2: Triangle = {
            p1,
            p2: p3,
            p3: pPrev,
            centroid: { x: (p1.x + p3.x + pPrev.x) / 3, y: (p1.y + p3.y + pPrev.y) / 3 },
          };
          allTriangles.push(t2);
        }
      } else {
        const t1: Triangle = {
          p1,
          p2: p3,
          p3: p4,
          centroid: { x: (p1.x + p3.x + p4.x) / 3, y: (p1.y + p3.y + p4.y) / 3 },
        };
        const t2: Triangle = {
          p1,
          p2: p4,
          p3: p2,
          centroid: { x: (p1.x + p4.x + p2.x) / 3, y: (p1.y + p4.y + p2.y) / 3 },
        };
        allTriangles.push(t1, t2);
      }
    }
  }

  return allTriangles;
}

/**
 * NaN Algorithm Step 4: StickTrianglesToOutline + RemoveTrianglesWithCentroidInWhite
 */
function conformTrianglesToGlyph(triangles: Triangle[], contours: Point[][]): Triangle[] {
  const result: Triangle[] = [];

  for (const tri of triangles) {
    const in1 = withinGlyphBlack(tri.p1.x, tri.p1.y, contours);
    const in2 = withinGlyphBlack(tri.p2.x, tri.p2.y, contours);
    const in3 = withinGlyphBlack(tri.p3.x, tri.p3.y, contours);

    if (in1 && in2 && in3) {
      result.push(tri);
    } else if (in1 || in2 || in3) {
      const np1 = in1 ? tri.p1 : returnNearestPoint(tri.p1.x, tri.p1.y, contours);
      const np2 = in2 ? tri.p2 : returnNearestPoint(tri.p2.x, tri.p2.y, contours);
      const np3 = in3 ? tri.p3 : returnNearestPoint(tri.p3.x, tri.p3.y, contours);

      const centroid = {
        x: (np1.x + np2.x + np3.x) / 3,
        y: (np1.y + np2.y + np3.y) / 3,
      };

      if (withinGlyphBlack(centroid.x, centroid.y, contours)) {
        const area = Math.abs(
          (np1.x * (np2.y - np3.y) + np2.x * (np3.y - np1.y) + np3.x * (np1.y - np2.y)) / 2
        );
        if (area > 12) {
          result.push({ p1: np1, p2: np2, p3: np3, centroid });
        }
      }
    }
  }

  return result;
}

/**
 * NaN Algorithm Step 5: BreakUpSpace
 */
function breakUpSpace(
  triangles: Triangle[],
  gridsize: number,
  maxchain: number,
  rand: () => number
): Cluster[] {
  const pool = [...triangles];
  const clusters: Cluster[] = [];
  let clusterId = 0;
  const variance = gridsize + 2;

  while (pool.length > 0) {
    let currentIdx = Math.floor(rand() * pool.length);
    const clusterTris: Triangle[] = [];
    let chainCounter = 0;

    while (chainCounter < maxchain && pool.length > 0) {
      const currentTri = pool[currentIdx];
      pool.splice(currentIdx, 1);
      clusterTris.push(currentTri);
      chainCounter++;

      if (pool.length === 0) break;

      const searchX = currentTri.centroid.x + (rand() - 0.5) * 2 * variance;
      const searchY = currentTri.centroid.y + (rand() - 0.5) * 2 * variance;

      let nearestDist = Infinity;
      let nearestIdx = 0;

      for (let i = 0; i < pool.length; i++) {
        const d = Math.hypot(searchX - pool[i].centroid.x, searchY - pool[i].centroid.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = i;
        }
      }

      if (nearestDist < 260) {
        currentIdx = nearestIdx;
      } else {
        break;
      }
    }

    if (clusterTris.length > 2 || rand() > 0.65) {
      clusters.push({
        id: clusterId++,
        triangles: clusterTris,
        shiftX: 0,
        shiftY: 0,
      });
    }
  }

  return clusters;
}

/**
 * NaN Algorithm Step 6: ApplyBurn + ShiftPath
 */
function applyTectonicDisplacement(
  clusters: Cluster[],
  intensity: number,
  rand: () => number
): void {
  const baseShift = Math.max(14, Math.round(intensity * 115));

  for (const cluster of clusters) {
    if (rand() < 0.4 + intensity * 0.85) {
      const shiftmax = Math.round((rand() * 0.7 + 0.3) * baseShift);
      const shiftype = rand();

      const shiftx = Number(((rand() * 1.5 - 0.5) * shiftmax).toFixed(1));
      const shifty = Number(((rand() * 1.5 - 0.5) * shiftmax).toFixed(1));

      if (shiftype < 0.35) {
        cluster.shiftX = shiftx;
      } else if (shiftype < 0.7) {
        cluster.shiftY = shifty;
      } else {
        cluster.shiftX = shiftx;
        cluster.shiftY = shifty;
      }
    }
  }
}

/**
 * Renders SVG paths and metadata
 */
function renderDistressedGlyphSvg(
  clusters: Cluster[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
): { svg: string; pathData: string; triCount: number; clusterCount: number; vbX: number; vbY: number; vbW: number; vbH: number } {
  const pad = 40;
  const vbX = Math.floor(bounds.minX - pad);
  const vbY = Math.floor(bounds.minY - pad);
  const vbW = Math.ceil(bounds.maxX - bounds.minX + pad * 2);
  const vbH = Math.ceil(bounds.maxY - bounds.minY + pad * 2);

  const paths: string[] = [];
  let triCount = 0;

  for (const cluster of clusters) {
    const sx = cluster.shiftX;
    const sy = cluster.shiftY;

    for (const t of cluster.triangles) {
      triCount++;
      const x1 = (t.p1.x + sx).toFixed(1);
      const y1 = (t.p1.y + sy).toFixed(1);
      const x2 = (t.p2.x + sx).toFixed(1);
      const y2 = (t.p2.y + sy).toFixed(1);
      const x3 = (t.p3.x + sx).toFixed(1);
      const y3 = (t.p3.y + sy).toFixed(1);

      paths.push(`M${x1},${y1} L${x2},${y2} L${x3},${y3} Z`);
    }
  }

  const pathData = paths.join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="100%" height="100%">
  <!-- Stalinist One × Rubik Distressed Tectonic Vector Glyph -->
  <!-- Base Font: Stalinist One | Generator: NaN Distressed Filter Port -->
  <path d="${pathData}" fill="currentColor" fill-rule="nonzero" />
</svg>`;

  return { svg, pathData, triCount, clusterCount: clusters.length, vbX, vbY, vbW, vbH };
}

export function generateDistressedGlyph(
  font: Font,
  char: string,
  outDir: string,
  intensity = 0.35,
  seed = 412
): GlyphMetricsData {
  const glyph = font.charToGlyph(char);
  const { contours, bounds, rawBb } = discretizeAndNormalizeGlyphContours(glyph, 8);

  const rand = createPrng(seed);
  const gridsize = 34;

  const lines = makeIsometricGrid(bounds, gridsize);
  const jitteredLines = randomiseIsoPoints(lines, gridsize, rand);
  const allTriangles = isoGridToTriangles(jitteredLines);
  const conformedTriangles = conformTrianglesToGlyph(allTriangles, contours);

  const maxchain = Math.max(25, Math.round(35 + (1 - intensity) * 35));
  const clusters = breakUpSpace(conformedTriangles, gridsize, maxchain, rand);

  applyTectonicDisplacement(clusters, intensity, rand);

  const { svg, pathData, triCount, clusterCount, vbX, vbY, vbW, vbH } = renderDistressedGlyphSvg(clusters, bounds);

  fs.mkdirSync(outDir, { recursive: true });
  const fileName = `${char}.svg`;
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, svg, "utf-8");

  return {
    char,
    advanceWidth: glyph.advanceWidth ?? 1000,
    leftSideBearing: rawBb.x1,
    width: rawBb.x2 - rawBb.x1,
    height: rawBb.y2 - rawBb.y1,
    vbX,
    vbY,
    vbW,
    vbH,
    path: pathData,
    triCount,
    clusterCount,
  };
}

// CLI Execution entrypoint
async function main() {
  const fontPath = path.resolve("./public/fonts/StalinistOne-Regular.ttf");
  const buffer = fs.readFileSync(fontPath);
  const font = opentype.parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  );

  const outDir = path.resolve("./public/generated/distressed-stalinist");
  const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const lowerLetters = "abcdefghijklmnopqrstuvwxyz".split("");
  const numbers = "0123456789".split("");
  const allChars = [...upperLetters, ...lowerLetters, ...numbers];

  console.log("==================================================");
  console.log(`GENERATING FULL DISTRESSED STALINIST LIBRARY (${allChars.length} GLYPHS)`);
  console.log("Intensity: 0.35 | Seed: 412");
  console.log("==================================================");

  const glyphMap: Record<string, GlyphMetricsData> = {};

  for (const char of allChars) {
    const res = generateDistressedGlyph(font, char, outDir, 0.35, 412);
    glyphMap[char] = res;
    console.log(
      `Glyph '${char}': ${res.triCount} triangles | ${res.clusterCount} plates | advance: ${res.advanceWidth} | viewBox: ${res.vbX} ${res.vbY} ${res.vbW} ${res.vbH}`
    );
  }

  // Extract all kerning pairs
  const kerningPairs: Record<string, number> = {};
  for (let i = 0; i < allChars.length; i++) {
    for (let j = 0; j < allChars.length; j++) {
      const c1 = allChars[i];
      const c2 = allChars[j];
      const g1 = font.charToGlyph(c1);
      const g2 = font.charToGlyph(c2);
      const val = font.getKerningValue(g1, g2);
      if (val !== 0) {
        kerningPairs[`${c1}${c2}`] = val;
      }
    }
  }

  console.log(`Extracted ${Object.keys(kerningPairs).length} kerning pairs.`);

  // Write TypeScript Data File for synchronous SSR / Client rendering
  const tsContent = `// Automatically generated by scripts/generate-distressed-stalinist.ts
// Stalinist One × Rubik Distressed Tectonic Vector Glyph Library
// Seed: 412 | Intensity: 0.35

export interface DistressedGlyphMetrics {
  char: string;
  advanceWidth: number;
  leftSideBearing: number;
  width: number;
  height: number;
  vbX: number;
  vbY: number;
  vbW: number;
  vbH: number;
  path: string;
}

export const DISTRESSED_STALINIST_METRICS = {
  unitsPerEm: 1000,
  capHeight: 700,
  spaceWidth: 400,
  seed: 412,
  intensity: 0.35,
};

export const KERNING_PAIRS: Record<string, number> = ${JSON.stringify(kerningPairs, null, 2)};

export const DISTRESSED_GLYPHS: Record<string, DistressedGlyphMetrics> = {
${allChars
  .map((c) => {
    const g = glyphMap[c];
    return `  ${JSON.stringify(c)}: {
    char: ${JSON.stringify(g.char)},
    advanceWidth: ${g.advanceWidth},
    leftSideBearing: ${g.leftSideBearing},
    width: ${g.width},
    height: ${g.height},
    vbX: ${g.vbX},
    vbY: ${g.vbY},
    vbW: ${g.vbW},
    vbH: ${g.vbH},
    path: ${JSON.stringify(g.path)},
  },`;
  })
  .join("\n")}
};

export function getKerning(prevChar: string, nextChar: string): number {
  return KERNING_PAIRS[prevChar + nextChar] || KERNING_PAIRS[prevChar.toUpperCase() + nextChar.toUpperCase()] || 0;
}
`;

  const tsFilePath = path.resolve("./lib/typography/distressedStalinistData.ts");
  fs.mkdirSync(path.dirname(tsFilePath), { recursive: true });
  fs.writeFileSync(tsFilePath, tsContent, "utf-8");
  console.log(`Successfully wrote TypeScript library data to: ${tsFilePath}`);
  console.log("==================================================");
  console.log("DONE! Complete A-Z and 0-9 library generated.");
}

if (process.argv[1]?.includes("generate-distressed-stalinist")) {
  main().catch(console.error);
}
