import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { BRAND } from "./brand";
import { CaptionOverlay } from "./captions/CaptionOverlay";
import { Background } from "./components/Background";
import { ProgressBar } from "./components/ProgressBar";
import { TopBar } from "./components/TopBar";
import { CodeScene } from "./scenes/CodeScene";
import { OutroScene } from "./scenes/OutroScene";
import { PointScene } from "./scenes/PointScene";
import { TitleScene } from "./scenes/TitleScene";
import { ReelProps, ReelScene } from "./schema";
import { ThemeProvider } from "./theme";

const SceneRenderer: React.FC<{ readonly scene: ReelScene }> = ({ scene }) => {
  switch (scene.type) {
    case "title":
      return <TitleScene scene={scene} />;
    case "point":
      return <PointScene scene={scene} />;
    case "code":
      return <CodeScene scene={scene} />;
    case "outro":
      return <OutroScene scene={scene} />;
  }
};

export const Reel: React.FC<ReelProps> = ({
  scenes,
  captions,
  category,
  themeColors,
}) => {
  return (
    <ThemeProvider themeColors={themeColors}>
      <AbsoluteFill style={{ backgroundColor: BRAND.background }}>
        <Background />

        <Series>
          {scenes.map((scene, index) => (
            <Series.Sequence
              key={index}
              durationInFrames={scene.durationInFrames}
              name={`${index + 1}. ${scene.type}`}
            >
              <SceneRenderer scene={scene} />
            </Series.Sequence>
          ))}
        </Series>

        <TopBar category={category} />
        <CaptionOverlay captions={captions} />
        <ProgressBar scenes={scenes} />
      </AbsoluteFill>
    </ThemeProvider>
  );
};
