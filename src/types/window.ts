import { DefaultTheme } from "styled-components";

// Window state interfaces
export interface WindowState {
  mounted: boolean;
  visible: boolean;
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowConfig {
  id: string;
  title: string;
  minWidth: number;
  minHeight: number;
  defaultWidth: number;
  defaultHeight: number;
}

// Extended HTML elemment
export interface ExtendedHTMLElement extends HTMLElement{
    webkitRequestFullscreen: () => Promise<void>;
    msRequestFullscreen: () => Promise<void>;
}

// Extended HTML elemment
export interface ExtendedDocument extends Document{
    webkitExitFullscreen: () => Promise<void>;
    msExitFullscreen: () => Promise<void>;
    webkitFullscreenElement: React.SetStateAction<boolean>;
    msFullscreenElement: React.SetStateAction<boolean>;
}

// Fullscreen API types
export interface FullscreenAPI {
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  fullscreenElement: Element | null;
  onFullscreenChange: (callback: () => void) => void;
  offFullscreenChange: (callback: () => void) => void;
}

// Device detection types
export interface DeviceInfo {
  isMobile: boolean;
  isTablet?: boolean;
  isDesktop: boolean;
}

// Theme context type
export type ThemeSwitcher = (theme: DefaultTheme) => void;

export interface WindowManagerState {
  windows: Record<string, WindowState>;
  zIndexStack: string[];
  activeWindow: string | null;
  isFullscreen: boolean;
}

export interface WindowManagerActions {
  openWindow: (id: string, config?: Partial<WindowState>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, size: { width: number; height: number; x?: number; y?: number }) => void;
  bringToFront: (id: string) => void;
  toggleFullscreen: () => Promise<void>;
}
