import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND, SAFE_AREA } from "../brand";
import { uiFontFamily } from "../fonts";
import { TitleScene as TitleSceneData } from "../schema";
import { headlineFontSize, wrapText } from "../utils";
import { Enter } from "../components/Enter";

export const TitleScene: React.FC<{ readonly scene: TitleSceneData }> = ({
  scene,
}) => {
  const lines = wrapText(scene.title, 16);
  const fontSize = headlineFontSize(lines.length, { max: 112, min: 64 });

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
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 30,
          }}
        >
          {scene.kicker}
        </div>

        <div
          style={{
            color: BRAND.white,
            fontSize,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1.5,
          }}
        >
          {lines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>

        <div
          style={{
            marginTop: 46,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 68,
              height: 5,
              borderRadius: 999,
              backgroundColor: BRAND.lime,
            }}
          />
          <div
            style={{ color: BRAND.muted, fontSize: 34, fontWeight: 600 }}
          >
            {scene.subtitle}
          </div>
        </div>
      </Enter>
    </AbsoluteFill>
  );
};
