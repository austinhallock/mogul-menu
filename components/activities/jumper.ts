import { jumper } from "../../deps.ts";
export type ActivityBannerStyleVariants = "open" | "closed";

export const BASE_BANNER_IFRAME_STYLES = {
  height: "52px",
  width: "100%",
  background: "transparent",
  "z-index": 2000,
  overflow: "hidden",
  transition: "clip-path .25s cubic-bezier(.4,.71,.18,.99)",
};

export function getBannerIframeStyles(variant: ActivityBannerStyleVariants) {
  const variantStyles = getVariantBannerStyles(variant);

  return {
    ...BASE_BANNER_IFRAME_STYLES,
    ...variantStyles,
  };
}

export function getClipPath(yPx: number, roundPx = 4) {
  return `inset(0% 0% calc(100% - ${yPx}px) 0% round ${roundPx}px)`;
}

export function getVariantBannerStyles(variant: ActivityBannerStyleVariants) {
  switch (variant) {
    case "open":
      return {
        "clip-path": getClipPath(52, 4),
      };
    case "closed":
      return {
        "clip-path": getClipPath(0, 0),
      };
    default:
      return {
        "clip-path": getClipPath(52, 4),
      };
  }
}

export function setJumperOpen() {
  const styles = getBannerIframeStyles(
    "open",
  );
  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: [
      { action: "useSubject" }, // start with our iframe
      { action: "setStyle", value: styles },
    ],
  });
}

export function setJumperClosed() {
  const styles = getBannerIframeStyles("closed");
  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: [
      { action: "useSubject" }, // start with our iframe
      { action: "setStyle", value: styles },
    ],
  });
}