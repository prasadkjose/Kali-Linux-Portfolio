import { ExtendedHTMLElement } from "../types/window";

export const isFullscreenElement = (el: Element): boolean => {
  return el instanceof Element;
};

export const isFullscreenAPIAvailable = (): boolean => {
  return !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as ExtendedHTMLElement).webkitRequestFullscreen ||
    (document.documentElement as ExtendedHTMLElement).msRequestFullscreen
  );
};

export const isMobileDevice = (): boolean => {
  return window.matchMedia("(max-width: 768px)").matches;
};
