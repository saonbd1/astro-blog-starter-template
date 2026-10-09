import { AnnotationHandler, InnerToken } from "codehike/code";

/**
 * Makes each token an inline-block so Code Hike can translate individual
 * tokens when animating between two snippets.
 */
export const tokenTransitions: AnnotationHandler = {
  name: "token-transitions",
  Token: ({ ...props }) => (
    <InnerToken merge={props} style={{ display: "inline-block" }} />
  ),
};
