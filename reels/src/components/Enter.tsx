import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Fade + lift entrance used by every scene so the whole reel feels consistent.
 */
export const Enter: React.FC<{
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly distance?: number;
}> = ({ children, delay = 0, distance = 50 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.6 },
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};
