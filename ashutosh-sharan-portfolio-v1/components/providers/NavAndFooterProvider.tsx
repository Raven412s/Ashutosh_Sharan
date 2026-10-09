"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MenuProvider } from "../layout/MenuContext";
import { MenuLayout } from "../layout/MenuLayout";

// Dynamically load heavy full-viewport WebGL background on client-side only
const FluidGradientCanvas = dynamic(
  () =>
    import("../page/homepage/FluidGradientCanvas").then(
      (mod) => mod.FluidGradientCanvas
    ),
  { ssr: false }
);

interface NavAndFooterProviderProps {
  children: React.ReactNode;
}

const NavAndFooterProvider = ({ children }: NavAndFooterProviderProps) => {
  return (
    <MenuProvider>
      {/* Global Site-wide Fixed WebGL Fluid Gradient Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden select-none"
      >
        <FluidGradientCanvas showControls={false} />
      </div>

      {/* Complete Interactive Navigation & Box Down-Shift Drawer System */}
      <MenuLayout>{children}</MenuLayout>
    </MenuProvider>
  );
};

export default NavAndFooterProvider;