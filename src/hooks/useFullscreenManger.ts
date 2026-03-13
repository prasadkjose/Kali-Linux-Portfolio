import { useEffect, useState } from "react";

import {
  ExtendedHTMLElement,
  ExtendedDocument,
  FullscreenManager,
} from "../types/window";

export const useFullscreenManager = (): FullscreenManager => {
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  /**
   * Request fullscreen mode for the entire document
   *
   * Attempts to enter fullscreen mode using the standard fullscreen API with fallbacks
   * for different browser implementations (WebKit, Microsoft Edge).
   *
   * @async
   * @throws {string} Empty string error if fullscreen request fails
   * @returns {Promise<void>} Promise that resolves when fullscreen is successfully entered
   */
  const requestFullscreen = async () => {
    const el: HTMLElement = document.documentElement;
    try {
      if (!document.fullscreenElement && el.requestFullscreen)
        await el.requestFullscreen();
      else if ((el as ExtendedHTMLElement).webkitRequestFullscreen)
        await (el as ExtendedHTMLElement).webkitRequestFullscreen();
      else if ((el as ExtendedHTMLElement).msRequestFullscreen)
        await (el as ExtendedHTMLElement).msRequestFullscreen();
    } catch {
      throw "";
    }
  };

  /**
   * Exit fullscreen mode for the current document
   *
   * Attempts to exit fullscreen mode using the standard fullscreen API with fallbacks
   * for different browser implementations (WebKit, Microsoft Edge).
   *
   * @async
   * @throws {string} Empty string error if fullscreen exit fails
   * @returns {Promise<void>} Promise that resolves when fullscreen is successfully exited
   */
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if ((document as ExtendedDocument).webkitExitFullscreen)
        await (document as ExtendedDocument).webkitExitFullscreen();
      else if ((document as ExtendedDocument).msExitFullscreen)
        await (document as ExtendedDocument).msExitFullscreen();
    } catch {
      throw "";
    }
  };

  /**
   * Toggle fullscreen mode based on current state
   *
   * If currently in fullscreen mode, exits fullscreen. If not in fullscreen mode,
   * requests fullscreen. This method provides a convenient way to toggle between
   * fullscreen and normal display modes.
   *
   * @async
   * @throws {string} Empty string error if fullscreen operation fails
   * @returns {Promise<void>} Promise that resolves when the toggle operation completes
   */
  const toggleFullscreen = async () => {
    if (!isFullscreen) await requestFullscreen();
    else await exitFullscreen();
  };

  /**
   * Handle DOM event handlers for full screen mode for various browsers.
   * @returns {void}
   */
  const handleDomEventsForFullscreen = () => {
    const onChange = () =>
      setIsFullscreen(
        !!document.fullscreenElement ||
          (document as ExtendedDocument).webkitFullscreenElement ||
          (document as ExtendedDocument).msFullscreenElement
      );
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("msfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("msfullscreenchange", onChange);
    };
  };

  useEffect(handleDomEventsForFullscreen, []);

  return {
    isFullscreen,

    toggleFullscreen,
    exitFullscreen,
    requestFullscreen,
  };
};
