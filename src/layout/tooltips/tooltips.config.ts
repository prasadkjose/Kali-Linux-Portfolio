import { isMobileDevice } from "../../utils/typeGuards";
import type { TooltipProps } from "./Tooltip";

export interface TooltipConfigItem extends Pick<TooltipProps, "id"> {
  content: string;
  position: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  showAfter?: number;
}

export const TOOLTIP_IDS = {
  FULLSCREEN_HINT: "fullscreen-hint",
  THEME_SWITCHER_HINT: "theme-switcher-hint",
  CAROUSEL_HINT: "carousel-hint",
} as const;

export type TooltipId = (typeof TOOLTIP_IDS)[keyof typeof TOOLTIP_IDS];

// When adding a tooltip, make sure to add the class "glow-border" to the pointing element.
export const TOOLTIPS_CONFIG: TooltipConfigItem[] = [
  {
    id: TOOLTIP_IDS.FULLSCREEN_HINT,
    showAfter: 1000,
    position: "top-right",
    content: "💡 For best experience tap here to use fullscreen mode",
  },
  {
    id: TOOLTIP_IDS.THEME_SWITCHER_HINT,
    showAfter: 1000,
    position: `${isMobileDevice() ? "top-left" : "bottom-right"}`,
    content: "⚙️ Try out a different Linux here.",
  },
  {
    id: TOOLTIP_IDS.CAROUSEL_HINT,
    showAfter: 2000,
    position: `${isMobileDevice() ? "top-left" : "bottom-right"}`,
    content: `${isMobileDevice() ? "🖼️ Click to view images. Swipe and click to change wallpaper." : "🖼️ Swipe to view images. Click on one to change background wallpaper"}`,
  },
];
