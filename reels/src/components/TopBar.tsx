import React from "react";
import { BRAND, SAFE_AREA } from "../brand";
import { uiFontFamily } from "../fonts";

export const TopBar: React.FC<{ readonly category: string }> = ({
  category,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: `96px ${SAFE_AREA.paddingX}px 0`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: uiFontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            backgroundColor: BRAND.lime,
            color: BRAND.limeInk,
            borderRadius: 999,
            padding: "12px 26px",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 0.6,
          }}
        >
          {BRAND.site.toUpperCase()}
        </div>
        <div
          style={{
            color: BRAND.muted,
            fontSize: 26,
            fontWeight: 600,
            maxWidth: 520,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {category}
        </div>
      </div>

      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 999,
          border: `3px solid ${BRAND.lime}`,
          color: BRAND.lime,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        SB
      </div>
    </div>
  );
};
