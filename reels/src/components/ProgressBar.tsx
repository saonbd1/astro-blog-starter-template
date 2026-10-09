import React from "react";
import { useCurrentFrame } from "remotion";
import { BRAND, SAFE_AREA } from "../brand";
import { ReelScene } from "../schema";
import { clamp } from "../utils";

/**
 * Instagram/Stories-style segmented progress: one segment per scene, so the
 * viewer can tell how much of the reel is left.
 */
export const ProgressBar: React.FC<{
  readonly scenes: ReelScene[];
}> = ({ scenes }) => {
  const frame = useCurrentFrame();

  let cursor = 0;
  const segments = scenes.map((scene) => {
    const start = cursor;
    cursor += scene.durationInFrames;
    return { start, duration: scene.durationInFrames };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        left: SAFE_AREA.paddingX,
        right: SAFE_AREA.paddingX,
        height: 6,
        display: "flex",
        gap: 12,
      }}
    >
      {segments.map((segment, index) => {
        const progress = clamp((frame - segment.start) / segment.duration, 0, 1);
        return (
          <div
            key={index}
            style={{
              flex: 1,
              height: "100%",
              borderRadius: 999,
              backgroundColor: BRAND.grid,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                backgroundColor: BRAND.lime,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
