"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  ox: number; // Origin X in portrait
  oy: number; // Origin Y in portrait
  tx: number; // Target X on "EXPERIENCES"
  ty: number; // Target Y on "EXPERIENCES"
  scatterX: number;
  scatterY: number;
  scatterRot: number;
  char: string;
  color: string;
  delay: number;
  size: number;
  isTarget: boolean; // Exactly one particle per target point to prevent stacking/blobs
}

interface AsciiParticleMorphCanvasProps {
  progress: number; // 0.0 (in portrait) -> 0.45 (shattered) -> 1.0 (assembled into EXPERIENCES)
  active: boolean;
  opacity?: number;
  className?: string;
}

// Crisp, delicate ASCII glyph set without heavy ink blobs like @ or #
const GLYPH_SET = ["X", "S", "H", "I", "P", "*", "+", "O", "o", "●", "○",];

export function AsciiParticleMorphCanvas({
  progress,
  active,
  opacity = 1,
  className = "",
}: AsciiParticleMorphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isInitializedRef = useRef(false);
  const progressRef = useRef(progress);
  const activeRef = useRef(active);
  const opacityRef = useRef(opacity);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const setupParticles = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // 1. Load and sample /hero.webp for portrait ASCII positions
      const img = new Image();
      img.src = "/hero.webp";
      img.onload = () => {
        if (!isMounted) return;

        // Calculate portrait screen bounds matching AsciiHeroCanvas getPortraitUv
        let targetHeight = h * 0.85;
        let targetWidth = targetHeight * (1086 / 724);
        if (targetWidth > w * 1.08) {
          targetWidth = w * 1.0;
          targetHeight = targetWidth * (724 / 1086);
        }
        const leftPixel = (w - targetWidth) * 0.44;
        const topPixel = h - targetHeight;

        const offCanvas = document.createElement("canvas");
        const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
        if (!offCtx) return;

        const sampleCols = Math.round(w < 640 ? 44 : 64);
        const sampleRows = Math.round(sampleCols * (targetHeight / targetWidth));
        offCanvas.width = sampleCols;
        offCanvas.height = sampleRows;

        offCtx.drawImage(img, 0, 0, sampleCols, sampleRows);
        const imgData = offCtx.getImageData(0, 0, sampleCols, sampleRows).data;

        const portraitPoints: {
          ox: number;
          oy: number;
          char: string;
          color: string;
        }[] = [];

        for (let row = 0; row < sampleRows; row++) {
          for (let col = 0; col < sampleCols; col++) {
            const idx = (row * sampleCols + col) * 4;
            const a = imgData[idx + 3];
            if (a > 35) {
              const r = imgData[idx];
              const g = imgData[idx + 1];
              const b = imgData[idx + 2];
              const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              const charIdx = Math.floor((1 - lum) * (GLYPH_SET.length - 1));
              const char = GLYPH_SET[Math.max(0, Math.min(GLYPH_SET.length - 1, charIdx))];

              const ox = leftPixel + (col / sampleCols) * targetWidth;
              const oy = topPixel + (row / sampleRows) * targetHeight;

              portraitPoints.push({
                ox,
                oy,
                char,
                color: `rgb(${r},${g},${b})`,
              });
            }
          }
        }

        // 2. Generate target points on uppercase text "EXPERIENCES"
        const textCanvas = document.createElement("canvas");
        const textCtx = textCanvas.getContext("2d", { willReadFrequently: true });
        if (!textCtx) return;

        textCanvas.width = w;
        textCanvas.height = h;

        // Compact, refined typography for EXPERIENCES
        const fontSize = Math.min(Math.max(w * 0.032, 24), 48);
        const fontVar =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--font-stalinist-one")
            .trim() || '"Stalinist One", Impact, sans-serif';

        textCtx.font = `900 ${fontSize}px ${fontVar}, "Stalinist One", Impact, sans-serif`;
        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        textCtx.fillStyle = "#ffffff";

        // Center exactly on screen
        const centerX = w / 2;
        const centerY = h / 2;
        textCtx.fillText("EXPERIENCES", centerX, centerY);

        const textImgData = textCtx.getImageData(0, 0, w, h).data;
        const textPoints: { tx: number; ty: number }[] = [];

        // Fine grid sampling matching portrait particle density (~1200 - 1600 points)
        const step = Math.max(2, Math.round(fontSize / 18));
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const idx = (y * w + x) * 4;
            if (textImgData[idx + 3] > 80) {
              textPoints.push({ tx: x, ty: y });
            }
          }
        }

        if (textPoints.length === 0) {
          for (let i = 0; i < portraitPoints.length; i++) {
            const tx = centerX - (w * 0.20) + (i / portraitPoints.length) * (w * 0.40);
            textPoints.push({ tx, ty: centerY });
          }
        }

        // 3. Assemble final particle list
        const particles: Particle[] = [];
        const count = portraitPoints.length;

        for (let i = 0; i < count; i++) {
          const pt = portraitPoints[i];
          const targetPt = textPoints[i % textPoints.length];

          const scatterDist = Math.min(w, h) * (0.35 + Math.random() * 0.55);
          const angle = Math.random() * Math.PI * 2;

          particles.push({
            ox: pt.ox,
            oy: pt.oy,
            tx: targetPt.tx,
            ty: targetPt.ty,
            scatterX: pt.ox + Math.cos(angle) * scatterDist,
            scatterY: pt.oy + Math.sin(angle) * scatterDist - (h * 0.08),
            scatterRot: (Math.random() - 0.5) * Math.PI * 4,
            char: pt.char,
            color: pt.color,
            delay: Math.random() * 0.08,
            size: w < 640 ? 4.8 : 5.8,
            isTarget: true,
          });
        }

        particlesRef.current = particles;
        isInitializedRef.current = true;
      };
    };

    const init = async () => {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
      if (isMounted) {
        setupParticles();
      }
    };

    init();
    window.addEventListener("resize", setupParticles);

    // 4. Smooth 60fps render loop
    let animId = 0;
    const render = () => {
      if (!isMounted) return;

      const p = progressRef.current;
      const isActive = activeRef.current;

      if (!isActive || !isInitializedRef.current || p <= 0.001) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.globalAlpha = Math.max(0, Math.min(1, opacityRef.current));

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // Adjusted progress per particle accounting for delay
        const t = Math.max(0, Math.min(1, (p - pt.delay) / (1 - pt.delay)));

        let curX = pt.ox;
        let curY = pt.oy;
        let rot = 0;
        let alpha = 1;

        if (t <= 0.22) {
          // Phase 1: Shatter & scatter outwards — shorter burst
          const s = t / 0.22;
          const easeOutCubic = 1 - Math.pow(1 - s, 3);
          curX = pt.ox + (pt.scatterX - pt.ox) * easeOutCubic;
          curY = pt.oy + (pt.scatterY - pt.oy) * easeOutCubic;
          rot = pt.scatterRot * easeOutCubic;
          alpha = Math.min(1, 0.4 + s * 0.6);
        } else {
          // Phase 2: Gravitational pull into "EXPERIENCES" word
          const c = (t - 0.22) / 0.78;
          // Quartic ease-in: slow start, then explosive snap into place
          const easeInQuart = c < 0.5
            ? 8 * c * c * c * c
            : 1 - Math.pow(-2 * c + 2, 4) / 2;

          curX = pt.scatterX + (pt.tx - pt.scatterX) * easeInQuart;
          curY = pt.scatterY + (pt.ty - pt.scatterY) * easeInQuart;
          rot = pt.scatterRot * (1 - easeInQuart);

          // Once fully assembled, lock perfectly in place with ZERO breathing / jitter
          if (c >= 0.93) {
            curX = pt.tx;
            curY = pt.ty;
            rot = 0;
          }
        }

        ctx.save();
        ctx.translate(curX, curY);
        if (rot !== 0) ctx.rotate(rot);

        // Medium 500 monospace font weight - perfectly balanced, clean and sharp
        ctx.font = `500 ${pt.size+2.6}px "Geist Mono", "JetBrains Mono", Menlo, Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Clean high-contrast brand color without heavy shadow blobs
        if (t > 0.60) {
          ctx.fillStyle = `rgba(24, 24, 24, ${alpha})`;
        } else {
          ctx.fillStyle = pt.color;
        }

        ctx.fillText(pt.char, 0, 0);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", setupParticles);
    };
  }, []);

  return (
    <div className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
