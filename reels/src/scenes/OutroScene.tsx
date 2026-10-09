import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND, SAFE_AREA } from "../brand";
import { Enter } from "../components/Enter";
import { uiFontFamily } from "../fonts";
import { OutroScene as OutroSceneData } from "../schema";
import { headlineFontSize, wrapText } from "../utils";

export const OutroScene: React.FC<{ readonly scene: OutroSceneData }> = ({
  scene,
}) => {
  const headingLines = wrapText(scene.heading, 18);
  const headingSize = headlineFontSize(headingLines.length, {
    max: 92,
    min: 60,
  });

  return (
    <AbsoluteFill
      style={{
        padding: `${SAFE_AREA.paddingTop}px ${SAFE_AREA.paddingX}px ${SAFE_AREA.paddingBottom}px`,
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: uiFontFamily,
      }}
    >
      <Enter>
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

      <Enter delay={5}>
        <div
          style={{
            marginTop: 30,
            color: BRAND.muted,
            fontSize: 38,
            fontWeight: 500,
            maxWidth: 820,
          }}
        >
          {scene.body}
        </div>
      </Enter>

      <Enter delay={10}>
        <div
          style={{
            marginTop: 56,
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            backgroundColor: BRAND.lime,
            color: BRAND.limeInk,
            borderRadius: 999,
            padding: "22px 44px",
            fontSize: 40,
            fontWeight: 800,
          }}
        >
          <span>{scene.url}</span>
          <span style={{ fontSize: 42 }}>→</span>
        </div>
      </Enter>
    </AbsoluteFill>
  );
};
