"use client";

import React, { useEffect, useRef } from "react";

interface AsciiHeroCanvasProps {
    className?: string;
    isRevealed?: boolean;
    asciiProgress?: number;
    opacity?: number;
}

/* ------------------------------------------------------------------ */
/* Final settings (debug panel se chuni hui)                           */
/* ------------------------------------------------------------------ */
const LENS_RADIUS = 0.02;
const TRAIL_RADIUS = 0.03;
const TRAIL_LENGTH = 0.938;
const CELL_SIZE = 3;
const BREATH_AMT = 0.5;
const PARALLAX_AMT = 0;
const REPEL_AMT = 0.03;
const REPEL_REACH = 0.018;

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const VS_SOURCE = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// Trail pass: ping-pong feedback texture (R channel = field amount)
const TRAIL_FS_SOURCE = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uDecay;
  uniform float uActive;

  void main() {
    float prev = texture2D(uPrev, vUv).r;
    float v = max(prev * uDecay - 0.004, 0.0);

    if (uActive > 0.5) {
      vec2 p = vUv * vec2(uAspect, 1.0);
      vec2 a = uPrevMouse * vec2(uAspect, 1.0);
      vec2 b = uMouse * vec2(uAspect, 1.0);
      vec2 ab = b - a;
      float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.000001), 0.0, 1.0);
      float d = length(p - (a + ab * t));
      float brush = 1.0 - smoothstep(0.0, uRadius, d);
      brush = pow(brush, 0.75);
      v = max(v, brush);
    }
    gl_FragColor = vec4(v, v, v, 1.0);
  }
`;

const MAIN_FS_SOURCE = `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uImage;
  uniform sampler2D uCharAtlas;
  uniform sampler2D uTrail;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uNumChars;
  uniform float uCellSize;
  uniform float uHoverRadius;
  uniform float uOpacity;
  uniform vec2 uClickPos;
  uniform float uClickAge;
  uniform float uBreathAmt;
  uniform vec2 uParallax;
  uniform float uParallaxAmt;
  uniform float uRepelAmt;
  uniform float uRepelReach;
  uniform float uAsciiProgress; // 0.0 = Real photo, 1.0 = 100% ASCII Art

  // Bayer 4x4 Dither Matrix
  float bayer4x4(vec2 p) {
    vec2 m = mod(p, 4.0);
    float x = m.x;
    float y = m.y;
    if (y < 1.0) {
      if (x < 1.0) return 0.0/16.0; if (x < 2.0) return 8.0/16.0; if (x < 2.0) return 8.0/16.0; return 10.0/16.0;
    } else if (y < 2.0) {
      if (x < 1.0) return 12.0/16.0; if (x < 2.0) return 4.0/16.0; if (x < 3.0) return 14.0/16.0; return 6.0/16.0;
    } else if (y < 3.0) {
      if (x < 1.0) return 3.0/16.0; if (x < 2.0) return 11.0/16.0; if (x < 3.0) return 1.0/16.0; return 9.0/16.0;
    } else {
      if (x < 1.0) return 15.0/16.0; if (x < 2.0) return 7.0/16.0; if (x < 3.0) return 13.0/16.0; return 5.0/16.0;
    }
    return 0.0;
  }

  vec2 getPortraitUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
    float targetHeight = screenRes.y * 0.85;
    float targetWidth = targetHeight * (imgRes.x / imgRes.y);

    if (targetWidth > screenRes.x * 1.08) {
      targetWidth = screenRes.x * 1.0;
      targetHeight = targetWidth * (imgRes.y / imgRes.x);
    }

    vec2 fragPixel = uv * screenRes;
    float leftPixel = (screenRes.x - targetWidth) * 0.44;
    float bottomPixel = 0.0;

    if (fragPixel.x < leftPixel || fragPixel.x > leftPixel + targetWidth ||
        fragPixel.y < bottomPixel || fragPixel.y > bottomPixel + targetHeight) {
      return vec2(-1.0);
    }

    return vec2(
      (fragPixel.x - leftPixel) / targetWidth,
      (fragPixel.y - bottomPixel) / targetHeight
    );
  }

  vec4 sampleImg(vec2 puv) {
    return texture2D(uImage, vec2(puv.x, 1.0 - puv.y));
  }

  // Fake depth from luminance: dark = near, shifts opposite to cursor
  vec2 parallaxUv(vec2 puv) {
    float lm = dot(sampleImg(puv).rgb, vec3(0.299, 0.587, 0.114));
    float depth = 1.0 - lm;
    return clamp(puv - uParallax * (depth - 0.4) * uParallaxAmt, 0.0, 1.0);
  }

  // Click shockwave ring
  float ringAt(vec2 uv) {
    if (uClickAge < 0.0) return 0.0;
    vec2 aspectScale = vec2(uResolution.x / uResolution.y, 1.0);
    float cd = length((uv - uClickPos) * aspectScale);
    float rr = uClickAge * 0.9;
    return (1.0 - smoothstep(0.0, 0.045, abs(cd - rr))) * exp(-uClickAge * 2.2);
  }

  // Combined interaction field (lens + trail + click ring), 0..1
  float fieldAt(vec2 uv) {
    vec2 aspectScale = vec2(uResolution.x / uResolution.y, 1.0);
    float f = 0.0;
    float norm = length((uv - uMouse) * aspectScale) / uHoverRadius;
    if (norm < 1.0) {
      f = pow(1.0 - smoothstep(0.0, 1.0, norm), 0.75);
    }
    f = max(f, texture2D(uTrail, uv).r);
    f = max(f, ringAt(uv));
    return f;
  }

  void main() {
    vec2 aspectScale = vec2(uResolution.x / uResolution.y, 1.0);

    vec2 ox = vec2(uRepelReach / aspectScale.x, 0.0);
    vec2 oy = vec2(0.0, uRepelReach);

    // 1. Pure physical radial repel on real photo (zero wavy distortion)
    vec2 mouseDelta = (vUv - uMouse) * aspectScale;
    float mouseDist = length(mouseDelta);
    float repelRadius = 0.12; // physical repel influence radius
    vec2 repelDir = (mouseDist > 0.0001) ? (mouseDelta / mouseDist) : vec2(0.0, 1.0);

    float repelStrength = 0.0;
    if (mouseDist < repelRadius && uMouse.x > -500.0) {
      repelStrength = pow(1.0 - smoothstep(0.0, repelRadius, mouseDist), 1.6) * 0.052;
    }

    float trailPush = texture2D(uTrail, vUv).r * 0.02;
    vec2 realSampleUv = vUv - (repelDir / aspectScale) * (repelStrength + trailPush);
    vec2 realP = getPortraitUv(realSampleUv, uResolution, uImageResolution);

    // 2. Quantize into grid cells for ASCII
    vec2 numCells = uResolution / uCellSize;
    vec2 cellId = floor(vUv * numCells);
    vec2 cellUv = fract(vUv * numCells);
    vec2 sampleUv = (cellId + 0.5) / numCells;

    float fc = fieldAt(sampleUv);
    vec2 g = vec2(
      fieldAt(sampleUv + ox) - fieldAt(sampleUv - ox),
      fieldAt(sampleUv + oy) - fieldAt(sampleUv - oy)
    );
    vec2 asciiSampleUv = sampleUv + g * uRepelAmt;
    vec2 asciiP = getPortraitUv(asciiSampleUv, uResolution, uImageResolution);

    if (realP.x < 0.0 && asciiP.x < 0.0) {
      discard;
    }

    vec2 targetP = (realP.x >= 0.0) ? realP : asciiP;
    vec2 realParallaxP = parallaxUv(clamp(targetP, 0.0, 1.0));
    vec4 realImg = sampleImg(realParallaxP);

    vec2 asciiParallaxP = parallaxUv(clamp((asciiP.x >= 0.0 ? asciiP : realP), 0.0, 1.0));
    vec4 asciiImg = sampleImg(asciiParallaxP);

    if (realImg.a < 0.08 && asciiImg.a < 0.08) {
      discard;
    }

    // Top-to-bottom ASCII transition calculation
    // targetP.y: 0.0 (bottom of portrait) to 1.0 (top of portrait)
    // As uAsciiProgress increases (0 -> 1), wipeCutoff sweeps from 1.0 down to 0.0
    // Pixels above wipeCutoff (targetP.y > wipeCutoff) turn into ASCII art!
    float wipeCutoff = 1.0 - clamp(uAsciiProgress, 0.0, 1.0);
    float band = 0.035;
    float asciiFactor = smoothstep(wipeCutoff - band, wipeCutoff + band, targetP.y);

    if (uAsciiProgress <= 0.001) {
      asciiFactor = 0.0;
    } else if (uAsciiProgress >= 0.999) {
      asciiFactor = 1.0;
    }


    // ASCII Glyph Calculation (Evaluated when asciiFactor > 0.01)
    float glyphMask = 0.0;
    vec3 asciiColor = asciiImg.rgb;
    float asciiAlpha = asciiImg.a;

    if (asciiFactor > 0.01) {
      float lum = dot(asciiImg.rgb, vec3(0.299, 0.587, 0.114));
      float d = 1.0 - lum;
      d += (bayer4x4(cellId) - 0.5) * 0.05;
      d += sin(cellId.x * 0.12 + cellId.y * 0.09 - uTime * 1.6) * 0.035 * uBreathAmt;
      float dd = clamp(d, 0.0, 1.0);

      float charIndex = 0.0;
      if (dd > 0.44) {
        float t = (dd - 0.44) / 0.56;
        charIndex = 10.0 + floor(clamp(t, 0.0, 1.0) * 5.99);
      } else if (dd > 0.18) {
        float t = (dd - 0.18) / 0.26;
        charIndex = 4.0 + floor(clamp(t, 0.0, 1.0) * 5.99);
      } else {
        float t = dd / 0.18;
        charIndex = 1.0 + floor(clamp(t, 0.0, 1.0) * 2.99);
      }

      float repelShrink = smoothstep(0.1, 0.9, fc);
      float charScale = clamp(1.0 - repelShrink * 0.85, 0.05, 1.0);
      vec2 centeredCellUv = (cellUv - 0.5) / charScale + 0.5;
      bool inCell = (centeredCellUv.x >= 0.0 && centeredCellUv.x <= 1.0 && centeredCellUv.y >= 0.0 && centeredCellUv.y <= 1.0);

      vec2 atlasCoord = inCell ? vec2((charIndex + centeredCellUv.x) / uNumChars, centeredCellUv.y) : vec2(0.0);
      glyphMask = inCell ? texture2D(uCharAtlas, atlasCoord).r : 0.0;

      vec3 baseColor = asciiImg.rgb;
      float gray = dot(baseColor, vec3(0.299, 0.587, 0.114));
      vec3 saturatedColor = mix(vec3(gray), baseColor, 1.35);
      vec3 vibrantColor = pow(saturatedColor, vec3(1.08));
      vibrantColor = clamp(vibrantColor * 0.96, 0.0, 1.0);

      asciiColor = vibrantColor;
      if (dd <= 0.18) {
        asciiColor = mix(vibrantColor, vec3(0.22, 0.21, 0.20), 0.58);
      }
      if (dd > 0.44) {
        asciiColor = mix(vibrantColor, vec3(0.08, 0.08, 0.09), 0.70);
      }

      asciiAlpha = (glyphMask < 0.15 ? 0.0 : glyphMask) * asciiImg.a;
      asciiAlpha *= 1.0 - smoothstep(0.3, 0.9, fc) * 0.9;
    }

    // Continuous Real Photo Color
    vec3 photoColor = realImg.rgb;
    float photoGray = dot(photoColor, vec3(0.299, 0.587, 0.114));
    vec3 saturatedPhoto = clamp(mix(vec3(photoGray), photoColor, 1.10), 0.0, 1.0);
    saturatedPhoto += vec3(0.03, 0.025, 0.015) * (repelStrength * 10.0); // subtle tactile repel highlight

    // In ASCII mode within the subject silhouette, render glyphs cleanly over matching page background
    vec3 pageBg = vec3(0.965, 0.960, 0.955);
    float cleanMask = (glyphMask < 0.15) ? 0.0 : glyphMask;
    vec3 renderedAscii = mix(pageBg, asciiColor, cleanMask);

    // Final blended output
    vec3 finalRgb = mix(saturatedPhoto, renderedAscii, asciiFactor);

    // The silhouette remains 100% opaque to layers behind it (like Raven Ships at z-10)
    float finalAlpha = realImg.a * uOpacity;

    if (finalAlpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(finalRgb, finalAlpha);
  }
`;

type Locs = Record<string, WebGLUniformLocation | null>;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function AsciiHeroCanvas({
    className = "",
    isRevealed = true,
    asciiProgress = 0,
    opacity = 1,
}: AsciiHeroCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const asciiProgressRef = useRef(asciiProgress);
    const opacityRef = useRef(opacity);

    useEffect(() => {
        asciiProgressRef.current = asciiProgress;
    }, [asciiProgress]);

    useEffect(() => {
        opacityRef.current = opacity;
    }, [opacity]);

    useEffect(() => {
        // Mobile optimization: skip WebGL completely on mobile (< 768px)
        // Herosection renders a static image for mobile
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
        });

        if (!gl) {
            console.warn("WebGL not supported for ASCII Canvas");
            return;
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        /* ---------------- Character atlas ---------------- */
        const numChars = 16;
        const charRes = 64;

        const atlasCanvas = document.createElement("canvas");
        atlasCanvas.width = charRes * numChars;
        atlasCanvas.height = charRes;
        const atlasCtx = atlasCanvas.getContext("2d");
        if (!atlasCtx) return;

        atlasCtx.fillStyle = "#000000";
        atlasCtx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);

        for (let i = 0; i < numChars; i++) {
            const centerX = i * charRes + charRes / 2;
            const centerY = charRes / 2;

            if (i === 0) {
                // whitespace
            } else if (i === 1) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.beginPath();
                atlasCtx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
                atlasCtx.fill();
            } else if (i === 2) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.beginPath();
                atlasCtx.arc(centerX, centerY, 5.5, 0, Math.PI * 2);
                atlasCtx.fill();
            } else if (i === 3) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.beginPath();
                atlasCtx.arc(centerX, centerY, 8.0, 0, Math.PI * 2);
                atlasCtx.fill();
            } else if (i === 4) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(centerX - 25, centerY - 7, 50, 14);
                atlasCtx.fillRect(centerX - 7, centerY - 25, 14, 50);
            } else if (i === 5) {
                atlasCtx.save();
                atlasCtx.translate(centerX, centerY);
                atlasCtx.rotate(Math.PI / 4);
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(-25, -7, 50, 14);
                atlasCtx.fillRect(-7, -25, 14, 50);
                atlasCtx.restore();
            } else if (i === 6) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(centerX - 24, centerY - 24, 48, 48);
                atlasCtx.fillStyle = "#000000";
                atlasCtx.fillRect(centerX - 13, centerY - 13, 26, 26);
            } else if (i === 7) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.beginPath();
                atlasCtx.arc(centerX, centerY, 25, 0, Math.PI * 2);
                atlasCtx.fill();
                atlasCtx.fillStyle = "#000000";
                atlasCtx.beginPath();
                atlasCtx.arc(centerX, centerY, 12, 0, Math.PI * 2);
                atlasCtx.fill();
            } else if (i === 8) {
                atlasCtx.save();
                atlasCtx.translate(centerX, centerY);
                atlasCtx.rotate(Math.PI / 4);
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(-27, -9, 54, 18);
                atlasCtx.fillRect(-9, -27, 18, 54);
                atlasCtx.restore();
            } else if (i === 9) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.beginPath();
                atlasCtx.arc(centerX, centerY, 24, 0, Math.PI * 2);
                atlasCtx.fill();
            } else if (i === 10) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(i * charRes + 6, 6, charRes - 12, charRes - 12);
            } else if (i === 11) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(i * charRes + 4, 4, charRes - 8, charRes - 8);
            } else if (i === 12) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(i * charRes + 3, 3, charRes - 6, charRes - 6);
            } else if (i === 13) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(i * charRes + 2, 2, charRes - 4, charRes - 4);
            } else if (i === 14) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(i * charRes + 1, 1, charRes - 2, charRes - 2);
            } else if (i === 15) {
                atlasCtx.fillStyle = "#ffffff";
                atlasCtx.fillRect(i * charRes, 0, charRes, charRes);
            }
        }

        const atlasTexture = gl.createTexture() as WebGLTexture;
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        /* ---------------- Hero image ---------------- */
        let imageLoaded = false;
        const heroImage = new Image();
        heroImage.src = "/hero.png";
        const imageTexture = gl.createTexture() as WebGLTexture;

        heroImage.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, imageTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heroImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            imageLoaded = true;
        };

        /* ---------------- Programs ---------------- */
        const createShader = (type: number, src: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const createProgram = (vsh: WebGLShader, fsh: WebGLShader) => {
            const prog = gl.createProgram();
            if (!prog) return null;
            gl.attachShader(prog, vsh);
            gl.attachShader(prog, fsh);
            gl.bindAttribLocation(prog, 0, "aPosition");
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error("Program link error:", gl.getProgramInfoLog(prog));
                return null;
            }
            return prog;
        };

        const getLocs = (prog: WebGLProgram, names: string[]) => {
            const o: Locs = {};
            names.forEach((n) => {
                o[n] = gl.getUniformLocation(prog, n);
            });
            return o;
        };
        const f1 = (loc: Locs, n: string, v: number) => gl.uniform1f(loc[n] ?? null, v);
        const f2 = (loc: Locs, n: string, x: number, y: number) => gl.uniform2f(loc[n] ?? null, x, y);
        const i1 = (loc: Locs, n: string, v: number) => gl.uniform1i(loc[n] ?? null, v);

        const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
        const mainFs = createShader(gl.FRAGMENT_SHADER, MAIN_FS_SOURCE);
        const trailFs = createShader(gl.FRAGMENT_SHADER, TRAIL_FS_SOURCE);
        if (!vs || !mainFs || !trailFs) return;

        const program = createProgram(vs, mainFs);
        const trailProg = createProgram(vs, trailFs);
        if (!program || !trailProg) return;

        const L = getLocs(program, [
            "uImage", "uCharAtlas", "uTrail", "uResolution", "uImageResolution", "uMouse", "uTime",
            "uNumChars", "uCellSize", "uHoverRadius", "uOpacity",
            "uClickPos", "uClickAge", "uBreathAmt",
            "uParallax", "uParallaxAmt", "uRepelAmt", "uRepelReach",
            "uAsciiProgress",
        ]);
        const TL = getLocs(trailProg, [
            "uPrev", "uMouse", "uPrevMouse", "uAspect", "uRadius", "uDecay", "uActive",
        ]);

        // Fullscreen quad (attrib 0 for both programs)
        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // Static uniforms
        gl.useProgram(program);
        i1(L, "uCharAtlas", 0);
        i1(L, "uImage", 1);
        i1(L, "uTrail", 2);
        f1(L, "uNumChars", numChars);
        f2(L, "uImageResolution", 1086, 724);
        f1(L, "uBreathAmt", BREATH_AMT);
        f1(L, "uParallaxAmt", PARALLAX_AMT);
        f1(L, "uRepelAmt", REPEL_AMT);
        f1(L, "uRepelReach", REPEL_REACH);

        gl.useProgram(trailProg);
        i1(TL, "uPrev", 2);

        /* ---------------- Trail ping-pong buffers ---------------- */
        let trailTex: WebGLTexture[] = [];
        let trailFbo: WebGLFramebuffer[] = [];
        let trailW = 0;
        let trailH = 0;
        let trailRead = 0;

        const allocTrail = (w: number, h: number) => {
            trailTex.forEach((t) => gl.deleteTexture(t));
            trailFbo.forEach((f) => gl.deleteFramebuffer(f));
            trailTex = [];
            trailFbo = [];
            gl.activeTexture(gl.TEXTURE2);
            for (let i = 0; i < 2; i++) {
                const tex = gl.createTexture() as WebGLTexture;
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                const fbo = gl.createFramebuffer() as WebGLFramebuffer;
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
                trailTex.push(tex);
                trailFbo.push(fbo);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            trailW = w;
            trailH = h;
            trailRead = 0;
        };

        /* ---------------- Mouse / click ---------------- */
        const mouse = { x: -1000, y: -1000 };
        const smoothMouse = { x: -1000, y: -1000 };
        const parallax = { x: 0, y: 0 };
        const click = { x: 0, y: 0, t: -1e9 };
        let currentRadius = LENS_RADIUS;
        let bump = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                mouse.x = -1000;
                mouse.y = -1000;
                return;
            }

            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const prevX = mouse.x;
            const prevY = mouse.y;

            mouse.x = Math.max(0, Math.min(1, x));
            mouse.y = Math.max(0, Math.min(1, y));

            // Lens expands slightly with fast movement
            if (prevX > -100) {
                const speed = Math.hypot(mouse.x - prevX, mouse.y - prevY);
                bump = Math.min(Math.max(bump, speed * 1.5), 0.06);
            }
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                return;
            }
            click.x = (e.clientX - rect.left) / rect.width;
            click.y = 1 - (e.clientY - rect.top) / rect.height; // y-up
            click.t = performance.now();
        };

        // Only attach mouse listeners on non-touch pointer devices
        // Touch devices gain nothing from mousemove tracking and WebGL is already skipped at init
        const isPointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (isPointerFine) {
          window.addEventListener("mousemove", handleMouseMove, { passive: true });
          window.addEventListener("mouseleave", handleMouseLeave);
          window.addEventListener("mousedown", handleMouseDown, { passive: true });
        }

        /* ---------------- Resize ---------------- */
        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
                canvas.width = displayWidth * dpr;
                canvas.height = displayHeight * dpr;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        /* ---------------- Render loop ---------------- */
        let animId = 0;
        const startTime = performance.now();
        let hadMouse = false;

        const render = () => {
            resizeCanvas();

            if (canvas.width < 2 || canvas.height < 2 || !imageLoaded) {
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                animId = requestAnimationFrame(render);
                return;
            }

            const nowMs = performance.now();
            const time = (nowMs - startTime) * 0.001;

            // --- mouse smoothing (screen space, y-down) ---
            const present = mouse.x > -500;
            let prevX = smoothMouse.x;
            let prevY = smoothMouse.y;
            if (!present) {
                smoothMouse.x = -1000;
                smoothMouse.y = -1000;
                hadMouse = false;
            } else if (!hadMouse) {
                smoothMouse.x = mouse.x;
                smoothMouse.y = mouse.y;
                prevX = mouse.x;
                prevY = mouse.y;
                hadMouse = true;
            } else {
                smoothMouse.x += (mouse.x - smoothMouse.x) * 0.12;
                smoothMouse.y += (mouse.y - smoothMouse.y) * 0.12;
            }

            // shader space (y-up)
            const mx = present ? smoothMouse.x : -1000;
            const my = present ? 1 - smoothMouse.y : -1000;
            const pmx = present ? prevX : -1000;
            const pmy = present ? 1 - prevY : -1000;

            // parallax easing
            const ptx = present ? mouse.x - 0.5 : 0;
            const pty = present ? 1 - mouse.y - 0.5 : 0;
            parallax.x += (ptx - parallax.x) * 0.06;
            parallax.y += (pty - parallax.y) * 0.06;

            // lens radius (velocity-aware)
            currentRadius += (LENS_RADIUS + bump - currentRadius) * 0.09;
            bump *= 0.95;

            // --- trail buffers ---
            const aspect = canvas.width / canvas.height;
            const tw = 512;
            const th = Math.max(2, Math.round(tw / aspect));
            if (th !== trailH) allocTrail(tw, th);

            // --- PASS 1: trail ---
            gl.disable(gl.BLEND);
            const write = 1 - trailRead;
            gl.bindFramebuffer(gl.FRAMEBUFFER, trailFbo[write]);
            gl.viewport(0, 0, trailW, trailH);
            gl.useProgram(trailProg);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, trailTex[trailRead]);
            f2(TL, "uMouse", mx, my);
            f2(TL, "uPrevMouse", pmx, pmy);
            f1(TL, "uAspect", aspect);
            f1(TL, "uRadius", TRAIL_RADIUS);
            f1(TL, "uDecay", TRAIL_LENGTH);
            f1(TL, "uActive", present ? 1 : 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            trailRead = write;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.enable(gl.BLEND);

            // --- PASS 2: main ---
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, imageTexture);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, trailTex[trailRead]);

            f2(L, "uResolution", canvas.width, canvas.height);
            f2(L, "uMouse", mx, my);
            f1(L, "uTime", time);

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            f1(L, "uCellSize", CELL_SIZE * dpr);
            f1(L, "uHoverRadius", currentRadius);
            f1(L, "uOpacity", isRevealed ? opacityRef.current : 0.0);
            f1(L, "uAsciiProgress", asciiProgressRef.current);

            const clickAge = (nowMs - click.t) / 1000;
            f2(L, "uClickPos", click.x, click.y);
            f1(L, "uClickAge", clickAge > 3.5 ? -1 : clickAge);

            f2(L, "uParallax", parallax.x, parallax.y);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animId);
            const isPointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
            if (isPointerFine) {
              window.removeEventListener("mousemove", handleMouseMove);
              window.removeEventListener("mouseleave", handleMouseLeave);
              window.removeEventListener("mousedown", handleMouseDown);
            }
            window.removeEventListener("resize", resizeCanvas);
            gl.deleteTexture(atlasTexture);
            gl.deleteTexture(imageTexture);
            trailTex.forEach((t) => gl.deleteTexture(t));
            trailFbo.forEach((f) => gl.deleteFramebuffer(f));
            gl.deleteBuffer(quadBuffer);
            gl.deleteProgram(program);
            gl.deleteProgram(trailProg);
            gl.deleteShader(vs);
            gl.deleteShader(mainFs);
            gl.deleteShader(trailFs);
        };
    }, [isRevealed]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full pointer-events-none ${className}`}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}