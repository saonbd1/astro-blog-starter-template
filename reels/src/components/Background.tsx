import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND } from "../brand";

/**
 * The brand backdrop: a soft lime glow, a faint grid, and a vignette.
 * Reuses the same visual language as the repo's OG cards.
 */
export const Background: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 80% 10%, rgba(182,255,43,0.16), transparent 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, ${BRAND.grid} 1px, transparent 1px), linear-gradient(to bottom, ${BRAND.grid} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          opacity: 0.35,
          maskImage: "radial-gradient(circle at 50% 38%, black, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 38%, black, transparent 78%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(16,18,20,0) 55%, rgba(16,18,20,0.92) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
