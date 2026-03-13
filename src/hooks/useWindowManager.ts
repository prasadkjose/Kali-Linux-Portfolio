import { useState, useCallback } from "react";
import { isMobileDevice } from "../utils/typeGuards";

export interface WindowState {
  mounted: boolean;
  visible: boolean;
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowManager {
  // Window states
  terminal: WindowState;
  welcome: WindowState;
  resume: WindowState;

  // Z-index management
  zTop: number;
  zBrowser: number;
  zTerminal: number;
  zResume: number;

  // Actions
  bringBrowserToFront: () => void;
  bringTerminalToFront: () => void;
  bringResumeToFront: () => void;

  // Window operations
  openTerminal: () => void;
  closeTerminal: () => void;
  minimizeTerminal: () => void;
  toggleMaximizeTerminal: () => void;

  openWelcome: () => void;
  closeWelcome: () => void;
  minimizeWelcome: () => void;
  toggleMaximizeWelcome: () => void;

  openResume: () => void;
  closeResume: () => void;
  minimizeResume: () => void;
  toggleMaximizeResume: () => void;

  // Window movement and resizing
  moveTerminal: (x: number, y: number) => void;
  resizeTerminal: (
    width: number,
    height: number,
    x?: number,
    y?: number
  ) => void;

  moveWelcome: (x: number, y: number) => void;
  resizeWelcome: (
    width: number,
    height: number,
    x?: number,
    y?: number
  ) => void;

  moveResume: (x: number, y: number) => void;
  resizeResume: (width: number, height: number, x?: number, y?: number) => void;

  // Initial setup
  initializeWindows: () => void;
}

const DEFAULT_TERMINAL_SIZE = { width: 960, height: 640 };
const DEFAULT_BROWSER_SIZE = { width: 900, height: 560 };
const DEFAULT_RESUME_SIZE = { width: 900, height: 560 };

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

  // Window states
  const [terminal, setTerminal] = useState<WindowState>({
    mounted: false,
    visible: false,
    maximized: false,
    x: 0,
    y: 0,
    width: DEFAULT_TERMINAL_SIZE.width,
    height: DEFAULT_TERMINAL_SIZE.height,
  });

  const [welcome, setWelcome] = useState<WindowState>({
    mounted: true,
    visible: true,
    maximized: false,
    x: 140,
    y: 60,
    width: DEFAULT_BROWSER_SIZE.width,
    height: DEFAULT_BROWSER_SIZE.height,
  });

  const [resume, setResume] = useState<WindowState>({
    mounted: false,
    visible: false,
    maximized: false,
    x: 160,
    y: 80,
    width: DEFAULT_RESUME_SIZE.width,
    height: DEFAULT_RESUME_SIZE.height,
  });

  // Z-index management
  const [zTop, setZTop] = useState(500);
  const [zBrowser, setZBrowser] = useState(200);
  const [zTerminal, setZTerminal] = useState(300);
  const [zResume, setZResume] = useState(400);

  const bringToFront = useCallback(
    (zIndexSetter: React.Dispatch<React.SetStateAction<number>>) => {
      const next = zTop + 1;
      setZTop(next);
      zIndexSetter(next);
    },
    [zTop]
  );

  const bringBrowserToFront = useCallback(() => {
    bringToFront(setZBrowser);
  }, [bringToFront]);

  const bringTerminalToFront = useCallback(() => {
    bringToFront(setZTerminal);
  }, [bringToFront]);

  const bringResumeToFront = useCallback(() => {
    bringToFront(setZResume);
  }, [bringToFront]);

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
    setTerminal({
      mounted: false,
      visible: false,
      maximized: false,
      x: 0,
      y: 0,
      width: DEFAULT_TERMINAL_SIZE.width,
      height: DEFAULT_TERMINAL_SIZE.height,
    });
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
    setWelcome({
      mounted: false,
      visible: false,
      maximized: false,
      x: 140,
      y: 60,
      width: DEFAULT_BROWSER_SIZE.width,
      height: DEFAULT_BROWSER_SIZE.height,
    });
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
    setResume({
      mounted: false,
      visible: false,
      maximized: false,
      x: 160,
      y: 80,
      width: DEFAULT_RESUME_SIZE.width,
      height: DEFAULT_RESUME_SIZE.height,
    });
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

  // Initial setup
  const initializeWindows = useCallback(() => {
    if (isMobile) {
      // Mobile: browser only, maximized
      forceMaximizedOnMobile(setWelcome);

      setTerminal({
        mounted: false,
        visible: false,
        maximized: false,
        x: 0,
        y: 0,
        width: DEFAULT_TERMINAL_SIZE.width,
        height: DEFAULT_TERMINAL_SIZE.height,
      });
    } else {
      // Desktop: browser centered
      centerWindowOnDesktop(setWelcome, DEFAULT_BROWSER_SIZE);
      bringBrowserToFront();

      setTerminal({
        mounted: false,
        visible: false,
        maximized: false,
        x: 0,
        y: 0,
        width: DEFAULT_TERMINAL_SIZE.width,
        height: DEFAULT_TERMINAL_SIZE.height,
      });
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

    // Z-index management
    zTop,
    zBrowser,
    zTerminal,
    zResume,

    // Actions
    bringBrowserToFront,
    bringTerminalToFront,
    bringResumeToFront,

    // Window operations
    openTerminal,
    closeTerminal,
    minimizeTerminal,
    toggleMaximizeTerminal,

    openWelcome,
    closeWelcome,
    minimizeWelcome,
    toggleMaximizeWelcome,

    openResume,
    closeResume,
    minimizeResume,
    toggleMaximizeResume,

    // Window movement and resizing
    moveTerminal,
    resizeTerminal,
    moveWelcome,
    resizeWelcome,
    moveResume,
    resizeResume,

    // Initial setup
    initializeWindows,
  };
};
