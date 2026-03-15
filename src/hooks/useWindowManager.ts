import { useState, useCallback } from "react";
import { isMobileDevice } from "../utils/typeGuards";
import { WindowManager, WindowState } from "../types/window";
/**
 * Default size configuration for the terminal window
 * @type {{width: number, height: number}}
 */
const DEFAULT_TERMINAL_SIZE = { width: 960, height: 640 };

/**
 * Default size configuration for the welcome browser window
 * @type {{width: number, height: number}}
 */
const DEFAULT_BROWSER_SIZE = { width: 900, height: 560 };

/**
 * Default size configuration for the resume window
 * @type {{width: number, height: number}}
 */
const DEFAULT_RESUME_SIZE = { width: 900, height: 560 };

/**
 * Calculate centered position for a window within the viewport
 *
 * @param {number} windowWidth - The width of the viewport/container
 * @param {number} windowHeight - The height of the viewport/container
 * @param {{width: number, height: number}} defaultSize - The desired window size
 * @returns {{x: number, y: number}} Calculated position to center the window
 */
const centerWindow = (
  windowWidth: number,
  windowHeight: number,
  defaultSize: { width: number; height: number }
) => {
  const { width, height } = defaultSize;
  return {
    x: Math.max(0, Math.round((windowWidth - width) / 2)),
    y: Math.max(0, Math.round((windowHeight - height) / 2)),
  };
};

export const useWindowManager = (): WindowManager => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Initialize device detection
  useState(() => {
    setIsMobile(isMobileDevice());
  });

  // Z-index management
  const [, setZTop] = useState(500);

  /**
   * Generic function to bring any window to the front of the z-index stack
   * Increments the global zTop counter and sets the window's z-index to that value
   *
   * @param {React.Dispatch<React.SetStateAction<WindowState>>} zIndexSetter - State setter for the window's z-index
   */
  const bringToFront = useCallback(
    (zIndexSetter: React.Dispatch<React.SetStateAction<WindowState>>) => {
      setZTop(prevZTop => {
        const newZTop = prevZTop + 1;
        zIndexSetter(prev => ({
          ...prev,
          z: newZTop,
        }));
        return newZTop;
      });
    },
    []
  );

  /**
   * Bring the browser window to the front of the z-index stack
   * This makes the browser window appear on top of all other windows
   */
  const bringBrowserToFront = useCallback(() => {
    bringToFront(setWelcome);
  }, [bringToFront]);

  /**
   * Bring the terminal window to the front of the z-index stack
   * This makes the terminal window appear on top of all other windows
   */
  const bringTerminalToFront = useCallback(() => {
    bringToFront(setTerminal);
  }, [bringToFront]);

  /**
   * Bring the resume window to the front of the z-index stack
   * This makes the resume window appear on top of all other windows
   */
  const bringResumeToFront = useCallback(() => {
    bringToFront(setResume);
  }, [bringToFront]);

  /**
   * Force a window to be maximized on mobile devices
   * Mobile devices always show windows in maximized state to utilize screen space
   *
   * @param {React.Dispatch<React.SetStateAction<WindowState>>} setter - State setter for the window
   */
  const forceMaximizedOnMobile = useCallback(
    (setter: React.Dispatch<React.SetStateAction<WindowState>>) => {
      setter(prev => ({
        ...prev,
        mounted: true,
        visible: true,
        maximized: true,
      }));
    },
    []
  );

  /**
   * Center a window on desktop devices with default size
   * Calculates the centered position based on viewport dimensions and window size
   *
   * @param {React.Dispatch<React.SetStateAction<WindowState>>} setter - State setter for the window
   * @param {{width: number, height: number}} defaultSize - Default size configuration for the window
   */
  const centerWindowOnDesktop = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<WindowState>>,
      defaultSize: { width: number; height: number }
    ) => {
      const { width, height } = defaultSize;
      const { x, y } = centerWindow(
        window.innerWidth,
        window.innerHeight,
        defaultSize
      );

      setter(prev => ({
        ...prev,
        mounted: true,
        visible: true,
        maximized: false,
        x,
        y,
        width,
        height,
      }));
    },
    []
  );

  /**
   * Open a window with appropriate positioning based on device type
   * On mobile: forces maximized state; on desktop: centers the window
   *
   * @param {React.Dispatch<React.SetStateAction<WindowState>>} setter - State setter for the window
   * @param {{width: number, height: number}} defaultSize - Default size configuration for the window
   */
  const openWindow = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<WindowState>>,
      defaultSize: { width: number; height: number }
    ) => {
      if (isMobile) {
        forceMaximizedOnMobile(setter);
      } else {
        centerWindowOnDesktop(setter, defaultSize);
      }
    },
    [isMobile, forceMaximizedOnMobile, centerWindowOnDesktop]
  );

  // Terminal operations
  const openTerminal = useCallback(() => {
    openWindow(setTerminal, DEFAULT_TERMINAL_SIZE);
    bringTerminalToFront();
  }, [openWindow, bringTerminalToFront]);

  const closeTerminal = useCallback(() => {
    setTerminal(prev => ({
      ...prev,
      mounted: false,
      visible: false,
      maximized: false,
    }));
  }, []);

  const minimizeTerminal = useCallback(() => {
    setTerminal(prev => ({
      ...prev,
      visible: false,
      maximized: false,
    }));
  }, []);

  const toggleMaximizeTerminal = useCallback(() => {
    setTerminal(prev => ({
      ...prev,
      maximized: !prev.maximized,
      visible: true,
    }));
  }, []);

  const moveTerminal = useCallback(
    (x: number, y: number) => {
      setTerminal(prev => ({ ...prev, x, y }));
      bringTerminalToFront();
    },
    [bringTerminalToFront]
  );

  const resizeTerminal = useCallback(
    (width: number, height: number, x?: number, y?: number) => {
      setTerminal(prev => ({
        ...prev,
        width,
        height,
        x: x !== undefined ? x : prev.x,
        y: y !== undefined ? y : prev.y,
      }));
      bringTerminalToFront();
    },
    [bringTerminalToFront]
  );

  // Welcome operations
  const openWelcome = useCallback(() => {
    openWindow(setWelcome, DEFAULT_BROWSER_SIZE);
    bringBrowserToFront();
  }, [openWindow, bringBrowserToFront]);

  const closeWelcome = useCallback(() => {
    setWelcome(prev => ({
      ...prev,
      mounted: false,
      visible: false,
      maximized: false,
    }));
  }, []);

  const minimizeWelcome = useCallback(() => {
    setWelcome(prev => ({
      ...prev,
      visible: false,
      maximized: false,
    }));
  }, []);

  const toggleMaximizeWelcome = useCallback(() => {
    setWelcome(prev => ({
      ...prev,
      maximized: !prev.maximized,
      visible: true,
    }));
  }, []);

  const moveWelcome = useCallback(
    (x: number, y: number) => {
      setWelcome(prev => ({ ...prev, x, y }));
      bringBrowserToFront();
    },
    [bringBrowserToFront]
  );

  const resizeWelcome = useCallback(
    (width: number, height: number, x?: number, y?: number) => {
      setWelcome(prev => ({
        ...prev,
        width,
        height,
        x: x !== undefined ? x : prev.x,
        y: y !== undefined ? y : prev.y,
      }));
      bringBrowserToFront();
    },
    [bringBrowserToFront]
  );

  // Resume operations
  const openResume = useCallback(() => {
    openWindow(setResume, DEFAULT_RESUME_SIZE);
    bringResumeToFront();
  }, [openWindow, bringResumeToFront]);

  const closeResume = useCallback(() => {
    setResume(prev => ({
      ...prev,
      mounted: false,
      visible: false,
      maximized: false,
    }));
  }, []);

  const minimizeResume = useCallback(() => {
    setResume(prev => ({
      ...prev,
      visible: false,
      maximized: false,
    }));
  }, []);

  const toggleMaximizeResume = useCallback(() => {
    setResume(prev => ({
      ...prev,
      maximized: !prev.maximized,
      visible: true,
    }));
  }, []);

  const moveResume = useCallback(
    (x: number, y: number) => {
      setResume(prev => ({ ...prev, x, y }));
      bringResumeToFront();
    },
    [bringResumeToFront]
  );

  const resizeResume = useCallback(
    (width: number, height: number, x?: number, y?: number) => {
      setResume(prev => ({
        ...prev,
        width,
        height,
        x: x !== undefined ? x : prev.x,
        y: y !== undefined ? y : prev.y,
      }));
      bringResumeToFront();
    },
    [bringResumeToFront]
  );

  // Window states
  const [terminal, setTerminal] = useState<WindowState>({
    mounted: false,
    visible: false,
    maximized: false,
    x: 0,
    y: 0,
    z: 200,
    width: DEFAULT_TERMINAL_SIZE.width,
    height: DEFAULT_TERMINAL_SIZE.height,
    bringToFront: bringTerminalToFront,
    open: openTerminal,
    close: closeTerminal,
    minimize: minimizeTerminal,
    toggleMaximize: toggleMaximizeTerminal,
    resize: resizeTerminal,
    move: moveTerminal,
  });

  const [welcome, setWelcome] = useState<WindowState>({
    mounted: true,
    visible: true,
    maximized: false,
    x: 140,
    y: 60,
    z: 300,
    width: DEFAULT_BROWSER_SIZE.width,
    height: DEFAULT_BROWSER_SIZE.height,
    bringToFront: bringBrowserToFront,
    open: openWelcome,
    close: closeWelcome,
    minimize: minimizeWelcome,
    toggleMaximize: toggleMaximizeWelcome,
    resize: resizeWelcome,
    move: moveWelcome,
  });

  const [resume, setResume] = useState<WindowState>({
    mounted: false,
    visible: false,
    maximized: false,
    x: 160,
    y: 80,
    z: 400,
    width: DEFAULT_RESUME_SIZE.width,
    height: DEFAULT_RESUME_SIZE.height,
    bringToFront: bringResumeToFront,
    open: openResume,
    close: closeResume,
    minimize: minimizeResume,
    toggleMaximize: toggleMaximizeResume,
    resize: resizeResume,
    move: moveResume,
  });

  /**
   * Initialize all windows with appropriate states based on device type
   * Sets up the initial window configuration for the application startup
   *
   * On mobile devices: Only the browser window is available and is maximized
   * On desktop devices: Browser window is centered, terminal is hidden initially
   */
  const initializeWindows = useCallback(() => {
    if (isMobile) {
      // Mobile: browser only, maximized
      forceMaximizedOnMobile(setWelcome);

      setTerminal(prev => ({
        ...prev,
        mounted: false,
        visible: false,
        maximized: false,
        x: 0,
        y: 0,
        width: DEFAULT_TERMINAL_SIZE.width,
        height: DEFAULT_TERMINAL_SIZE.height,
      }));
    } else {
      // Desktop: browser centered
      centerWindowOnDesktop(setWelcome, DEFAULT_BROWSER_SIZE);
      bringBrowserToFront();

      setTerminal(prev => ({
        ...prev,
        mounted: false,
        visible: false,
        maximized: false,
        x: 0,
        y: 0,
        width: DEFAULT_TERMINAL_SIZE.width,
        height: DEFAULT_TERMINAL_SIZE.height,
      }));
    }
  }, [
    isMobile,
    forceMaximizedOnMobile,
    centerWindowOnDesktop,
    bringBrowserToFront,
  ]);

  return {
    // Window states
    terminal,
    welcome,
    resume,
    initializeWindows,
  };
};
