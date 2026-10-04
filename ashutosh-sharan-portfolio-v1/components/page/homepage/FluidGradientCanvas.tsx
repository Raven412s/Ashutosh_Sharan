"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface FluidGradientConfig {
  color1: string; // Base Primary (Default #DC143C Crimson)
  color2: string; // Deep Velvet / Wine
  color3: string; // Dark Obsidian Shadow
  color4: string; // Vivid Highlight
  color5: string; // Soft Accent
  speed: number;
  frequency: number;
  distortion: number;
  octaves: number;
  grain: number;
  contrast: number;
  brightness: number;
  mouseInfluence: number;
}

export const DEFAULT_FLUID_CONFIG: FluidGradientConfig = {
  color1: "#f9f5f2",
  color2: "#f9f5f4",
  color3: "#eeeeee",
  color4: "#dc143c",
  color5: "#ff99a3",
  speed: 0.2,
  frequency: 0.5,
  distortion: 0.3,
  octaves: 2,
  grain: 0.1,
  contrast: 1,
  brightness: 1,
  mouseInfluence: 0.1,
};

export const PRESETS: Record<string, FluidGradientConfig> = {
  "Editorial Silk (Active)": { ...DEFAULT_FLUID_CONFIG },
  "Crimson Velvet": {
    color1: "#DC143C",
    color2: "#78091E",
    color3: "#1A050A",
    color4: "#FF3366",
    color5: "#FF6B6B",
    speed: 0.65,
    frequency: 1.8,
    distortion: 1.6,
    octaves: 3,
    grain: 0.055,
    contrast: 1.15,
    brightness: 1.0,
    mouseInfluence: 0.25,
  },
  "Electric Flame": {
    color1: "#DC143C",
    color2: "#990022",
    color3: "#2A0008",
    color4: "#FF5E3A",
    color5: "#FFAA33",
    speed: 1.1,
    frequency: 2.2,
    distortion: 2.4,
    octaves: 4,
    grain: 0.04,
    contrast: 1.3,
    brightness: 1.1,
    mouseInfluence: 0.4,
  },
  "Obsidian Velvet": {
    color1: "#8B0000",
    color2: "#4A0011",
    color3: "#0B0204",
    color4: "#DC143C",
    color5: "#550015",
    speed: 0.45,
    frequency: 1.4,
    distortion: 1.2,
    octaves: 3,
    grain: 0.07,
    contrast: 1.4,
    brightness: 0.9,
    mouseInfluence: 0.2,
  },
  "Neon Pulse": {
    color1: "#DC143C",
    color2: "#FF007F",
    color3: "#12001F",
    color4: "#FF1493",
    color5: "#FF4500",
    speed: 0.85,
    frequency: 2.6,
    distortion: 2.8,
    octaves: 4,
    grain: 0.05,
    contrast: 1.25,
    brightness: 1.05,
    mouseInfluence: 0.35,
  },
};

// Converts hex string to normalized RGB [r, g, b] (0.0 - 1.0)
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return [0.86, 0.08, 0.24]; // Fallback to #DC143C
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

/* ------------------------------------------------------------------ */
/* GLSL Shaders                                                       */
/* ------------------------------------------------------------------ */
const VS_SOURCE = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FS_SOURCE = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;

  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;

  uniform float uSpeed;
  uniform float uFrequency;
  uniform float uDistortion;
  uniform int uOctaves;
  uniform float uGrain;
  uniform float uContrast;
  uniform float uBrightness;

  // Fast 2D Simplex-like Perlin Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion with configurable octaves
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.55;
    float freq = 1.0;
    for (int i = 0; i < 5; i++) {
      if (i >= uOctaves) break;
      val += amp * snoise(p * freq);
      freq *= 2.05;
      amp *= 0.5;
    }
    return val;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uFrequency;

    // Interactive mouse swirl repulsion
    vec2 mNorm = (uMouse - 0.5) * vec2(aspect, 1.0);
    vec2 mDelta = p - mNorm;
    float mDist = length(mDelta);
    float mRepel = smoothstep(0.9, 0.0, mDist) * uMouseInfluence;
    p += (mDelta / (mDist + 0.001)) * mRepel * 0.35;

    float t = uTime * uSpeed * 0.25;

    // Inigo Quilez Dual Domain Warping (fBm -> fBm -> fBm)
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + vec2(t * 0.4, t * 0.2)),
      fbm(p + vec2(5.2, 1.3) - vec2(t * 0.3, t * 0.5))
    );

    vec2 r = vec2(
      fbm(p + uDistortion * q + vec2(1.7, 9.2) + vec2(t * 0.5, -t * 0.3)),
      fbm(p + uDistortion * q + vec2(8.3, 2.8) + vec2(-t * 0.2, t * 0.4))
    );

    float f = fbm(p + uDistortion * r);

    // Dynamic Multi-Stop Gradient Blend
    // Base mix: Color1 (Crimson) <-> Color2 (Wine)
    float baseFactor = clamp((f + 0.5) * 0.6 + q.x * 0.35, 0.0, 1.0);
    vec3 color = mix(uColor1, uColor2, baseFactor);

    // Deep Obsidian Shadows
    float shadowFactor = clamp(-r.x * 0.8 + 0.2, 0.0, 1.0);
    color = mix(color, uColor3, shadowFactor * 0.7);

    // Vivid Crimson-Pink Highlight Swirls
    float highlight1 = smoothstep(0.1, 0.8, q.y + f * 0.5);
    color = mix(color, uColor4, highlight1 * 0.55);

    // Bright Warm Peak Accents
    float highlight2 = smoothstep(0.4, 0.95, r.y * 1.2 + f * 0.3);
    color = mix(color, uColor5, highlight2 * 0.45);

    // Contrast & Brightness adjustment
    color = (color - 0.5) * uContrast + 0.5;
    color *= uBrightness;

    // Film Grain / Dithering (Eliminates color banding & adds editorial texture)
    if (uGrain > 0.001) {
      float noise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5);
      color += noise * uGrain;
    }

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

interface FluidGradientCanvasProps {
  className?: string;
  config?: Partial<FluidGradientConfig>;
  showControls?: boolean;
}

export function FluidGradientCanvas({
  className = "",
  config: initialConfig,
  showControls = true,
}: FluidGradientCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active configuration state
  const [config, setConfig] = useState<FluidGradientConfig>({
    ...DEFAULT_FLUID_CONFIG,
    ...initialConfig,
  });

  // UI state for floating controls
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("Editorial Silk (Active)");
  const [copied, setCopied] = useState(false);

  // Mouse tracking inside container
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // WebGL Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl2") ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) {
      console.warn("WebGL not supported for FluidGradientCanvas");
      return;
    }

    // Helper: Compile Shader
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("FluidGradient Shader error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compile(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("FluidGradient Program error:", gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    // Full-screen Quad
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uResLoc = gl.getUniformLocation(prog, "uResolution");
    const uTimeLoc = gl.getUniformLocation(prog, "uTime");
    const uMouseLoc = gl.getUniformLocation(prog, "uMouse");
    const uMouseInfLoc = gl.getUniformLocation(prog, "uMouseInfluence");
    const uC1Loc = gl.getUniformLocation(prog, "uColor1");
    const uC2Loc = gl.getUniformLocation(prog, "uColor2");
    const uC3Loc = gl.getUniformLocation(prog, "uColor3");
    const uC4Loc = gl.getUniformLocation(prog, "uColor4");
    const uC5Loc = gl.getUniformLocation(prog, "uColor5");
    const uSpeedLoc = gl.getUniformLocation(prog, "uSpeed");
    const uFreqLoc = gl.getUniformLocation(prog, "uFrequency");
    const uDistLoc = gl.getUniformLocation(prog, "uDistortion");
    const uOctLoc = gl.getUniformLocation(prog, "uOctaves");
    const uGrainLoc = gl.getUniformLocation(prog, "uGrain");
    const uContLoc = gl.getUniformLocation(prog, "uContrast");
    const uBrightLoc = gl.getUniformLocation(prog, "uBrightness");

    // Resize handler with DPR clamping for high performance
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        gl.viewport(0, 0, bw, bh);
      }
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Mouse listener
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        return;
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      animId = requestAnimationFrame(render);

      // Smooth mouse lerp
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.08;
      m.y += (m.targetY - m.y) * 0.08;

      const elapsed = (performance.now() - startTime) * 0.001;
      const c = configRef.current;

      gl.useProgram(prog);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uMouseLoc, m.x, m.y);
      gl.uniform1f(uMouseInfLoc, c.mouseInfluence);

      const rgb1 = hexToRgb(c.color1);
      const rgb2 = hexToRgb(c.color2);
      const rgb3 = hexToRgb(c.color3);
      const rgb4 = hexToRgb(c.color4);
      const rgb5 = hexToRgb(c.color5);

      gl.uniform3f(uC1Loc, rgb1[0], rgb1[1], rgb1[2]);
      gl.uniform3f(uC2Loc, rgb2[0], rgb2[1], rgb2[2]);
      gl.uniform3f(uC3Loc, rgb3[0], rgb3[1], rgb3[2]);
      gl.uniform3f(uC4Loc, rgb4[0], rgb4[1], rgb4[2]);
      gl.uniform3f(uC5Loc, rgb5[0], rgb5[1], rgb5[2]);

      gl.uniform1f(uSpeedLoc, c.speed);
      gl.uniform1f(uFreqLoc, c.frequency);
      gl.uniform1f(uDistLoc, c.distortion);
      gl.uniform1i(uOctLoc, Math.round(c.octaves));
      gl.uniform1f(uGrainLoc, c.grain);
      gl.uniform1f(uContLoc, c.contrast);
      gl.uniform1f(uBrightLoc, c.brightness);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(quadBuf);
    };
  }, []);

  // Copy JSON Config to Clipboard
  const handleCopyConfig = useCallback(() => {
    const jsonStr = JSON.stringify(config, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      });
    }
  }, [config]);

  // Apply Preset
  const handleSelectPreset = (name: string) => {
    setSelectedPreset(name);
    if (PRESETS[name]) {
      setConfig({ ...PRESETS[name] });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Debug / Shader Controls Panel */}
      {showControls && (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end select-none pointer-events-auto">
          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full font-mono text-xs uppercase tracking-widest bg-black/85 text-white/90 border border-white/20 shadow-2xl backdrop-blur-md hover:bg-black hover:border-[#DC143C] hover:text-[#DC143C] transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-[#DC143C] animate-pulse" />
            <span>{isOpen ? "[ Close Shader FX ]" : "[ ✦ Shader Controls ]"}</span>
          </button>

          {/* Expanded Control Box */}
          {isOpen && (
            <div className="mt-3 w-80 sm:w-96 max-h-[80vh] overflow-y-auto p-4 sm:p-5 rounded-2xl bg-black/90 border border-white/15 text-white shadow-2xl backdrop-blur-xl space-y-4 text-xs font-mono">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-stalinist-one text-[13px] tracking-wide text-[#DC143C]">
                    GLSL SHADER FX
                  </span>
                  <span className="text-[10px] text-white/40 uppercase">
                    [Live Debug]
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/50 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-white/60 tracking-wider">
                  Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(PRESETS).map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelectPreset(name)}
                      className={`px-2 py-1.5 rounded text-[10px] text-left truncate transition-colors cursor-pointer border ${
                        selectedPreset === name
                          ? "bg-[#DC143C]/20 border-[#DC143C] text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Pickers */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <label className="text-[10px] uppercase text-white/60 tracking-wider block">
                  Color Palette (5 Stops)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(
                    [
                      { key: "color1", label: "Primary" },
                      { key: "color2", label: "Deep" },
                      { key: "color3", label: "Shadow" },
                      { key: "color4", label: "Glow" },
                      { key: "color5", label: "Peak" },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-inner">
                        <input
                          type="color"
                          value={config[key]}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-100"
                        />
                      </div>
                      <span className="text-[8px] text-white/50 uppercase truncate">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliders: Speed & Flow */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Flow Speed</span>
                    <span className="text-[#DC143C]">{config.speed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.5"
                    step="0.05"
                    value={config.speed}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        speed: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Frequency / Scale</span>
                    <span className="text-[#DC143C]">
                      {config.frequency.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.5"
                    step="0.1"
                    value={config.frequency}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        frequency: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Fluid Distortion (fBm Warp)</span>
                    <span className="text-[#DC143C]">
                      {config.distortion.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="3.5"
                    step="0.1"
                    value={config.distortion}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        distortion: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Noise Octaves (Detail)</span>
                    <span className="text-[#DC143C]">{config.octaves}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={config.octaves}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        octaves: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Film Grain / Texture</span>
                    <span className="text-[#DC143C]">
                      {config.grain.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.18"
                    step="0.005"
                    value={config.grain}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        grain: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Contrast</span>
                    <span className="text-[#DC143C]">
                      {config.contrast.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.05"
                    value={config.contrast}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        contrast: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-white/70 mb-1">
                    <span>Interactive Mouse Swirl</span>
                    <span className="text-[#DC143C]">
                      {config.mouseInfluence.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={config.mouseInfluence}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        mouseInfluence: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#DC143C] h-1.5 bg-white/20 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions: Copy Config JSON & Reset */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={handleCopyConfig}
                  className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                      : "bg-[#DC143C] text-white hover:bg-[#b01030] shadow-[0_0_15px_rgba(220,20,60,0.4)]"
                  }`}
                >
                  {copied ? (
                    <>
                      <span>✓</span>
                      <span>Config JSON Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Copy Config (JSON)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setConfig({ ...DEFAULT_FLUID_CONFIG });
                    setSelectedPreset("Crimson Silk (Default)");
                  }}
                  className="w-full py-1.5 text-[10px] uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
