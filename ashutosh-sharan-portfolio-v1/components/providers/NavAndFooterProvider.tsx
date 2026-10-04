"use client";

import React from "react";
import { Navbar } from "../layout/Navbar";
import { FluidGradientCanvas } from "../page/homepage/FluidGradientCanvas";

interface NavAndFooterProviderProps {
  children: React.ReactNode;
}

const NavAndFooterProvider = ({ children }: NavAndFooterProviderProps) => {
  return (
    <>
      {/* Global Site-wide Fixed WebGL Fluid Gradient Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden select-none"
      >
        <FluidGradientCanvas showControls={false} />
      </div>

      <Navbar />
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
      {/* <Footer/> */}
    </>
  );
};

export default NavAndFooterProvider;