import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND, SAFE_AREA } from "../brand";
import { Enter } from "../components/Enter";
import { uiFontFamily } from "../fonts";
import { PointScene as PointSceneData } from "../schema";
import { headlineFontSize, wrapText } from "../utils";

export const PointScene: React.FC<{ readonly scene: PointSceneData }> = ({
  scene,
}) => {
  const headingLines = wrapText(scene.heading, 20);
  const headingSize = headlineFontSize(headingLines.length, {
    max: 82,
    min: 54,
  });
  const bodyLines = wrapText(scene.body, 32);

  return (
    <AbsoluteFill
      style={{
        padding: `${SAFE_AREA.paddingTop}px ${SAFE_AREA.paddingX}px ${SAFE_AREA.paddingBottom}px`,
        justifyContent: "center",
        fontFamily: uiFontFamily,
      }}
    >
      <Enter>
        <div
          style={{
            color: BRAND.lime,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 26,
          }}
        >
          {scene.kicker}
        </div>
      </Enter>

      <Enter delay={4}>
        <div
          style={{
            color: BRAND.white,
            fontSize: headingSize,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          {headingLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </Enter>

      <Enter delay={8}>
        <div
          style={{
            marginTop: 34,
            color: BRAND.muted,
            fontSize: 38,
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          {bodyLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </Enter>
    </AbsoluteFill>
  );
};
