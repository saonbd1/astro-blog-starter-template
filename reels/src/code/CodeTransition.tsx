import {
  AnnotationHandler,
  HighlightedCode,
  Pre,
} from "codehike/code";
import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransitionsSnapshot,
} from "codehike/utils/token-transitions";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Easing, interpolate, useCurrentFrame, useDelayRender } from "remotion";
import { codeFontFamily, codeFontSize, codeTabSize } from "../fonts";
import { tokenTransitions } from "./annotations/InlineToken";
import { applyStyle } from "./apply-style";

/**
 * Animates between two highlighted snippets by morphing matching tokens.
 * Pass `oldCode={null}` to animate a snippet in from nothing.
 *
 * Adapted from Remotion's official Code Hike template
 * (remotion-dev/template-code-hike).
 */
export const CodeTransition: React.FC<{
  readonly oldCode: HighlightedCode | null;
  readonly newCode: HighlightedCode;
  readonly durationInFrames?: number;
  readonly fontSize?: number;
  readonly fontFamily?: string;
}> = ({
  oldCode,
  newCode,
  durationInFrames = 30,
  fontSize = codeFontSize,
  fontFamily = codeFontFamily,
}) => {
  const frame = useCurrentFrame();

  const ref = React.useRef<HTMLPreElement>(null);
  const [oldSnapshot, setOldSnapshot] =
    useState<TokenTransitionsSnapshot | null>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = React.useState(() => delayRender());

  const prevCode: HighlightedCode = useMemo(() => {
    return oldCode || { ...newCode, tokens: [], annotations: [] };
  }, [newCode, oldCode]);

  const code = useMemo(() => {
    return oldSnapshot ? newCode : prevCode;
  }, [newCode, prevCode, oldSnapshot]);

  useEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(getStartingSnapshot(ref.current!));
    }
  }, [oldSnapshot]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!oldSnapshot) {
      setOldSnapshot(getStartingSnapshot(ref.current!));
      return;
    }

    const transitions = calculateTransitions(ref.current!, oldSnapshot);
    transitions.forEach(({ element, keyframes, options }) => {
      const delay = durationInFrames * options.delay;
      const duration = durationInFrames * options.duration;
      const linearProgress = interpolate(
        frame,
        [delay, delay + duration],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
      const progress = interpolate(linearProgress, [0, 1], [0, 1], {
        easing: Easing.bezier(0.17, 0.67, 0.76, 0.91),
      });

      applyStyle({ element, keyframes, progress, linearProgress });
    });
    continueRender(handle);
  });

  const handlers: AnnotationHandler[] = useMemo(() => {
    return [tokenTransitions];
  }, []);

  const style: React.CSSProperties = useMemo(() => {
    return {
      position: "relative",
      fontSize,
      lineHeight: 1.5,
      fontFamily,
      tabSize: codeTabSize,
      margin: 0,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    };
  }, [fontSize, fontFamily]);

  return <Pre ref={ref} code={code} handlers={handlers} style={style} />;
};
