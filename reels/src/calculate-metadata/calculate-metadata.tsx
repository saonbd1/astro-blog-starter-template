import { CalculateMetadataFunction } from "remotion";
import { ReelProps } from "../schema";

/**
 * Everything is pre-computed by the props builder, so this only has to surface
 * the total duration to Remotion (which cannot be read from props otherwise).
 */
export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = async ({
  props,
}) => {
  return {
    durationInFrames: props.durationInFrames,
  };
};
