import { DefaultTheme } from "styled-components";

/**
 * Configuration object for window properties and constraints
 *
 * @property {string} id - Unique identifier for the window
 * @property {string} title - Display title shown in the window header
 * @property {number} minWidth - Minimum allowed width for the window
 * @property {number} minHeight - Minimum allowed height for the window
 * @property {number} defaultWidth - Default width when window is created or restored
 * @property {number} defaultHeight - Default height when window is created or restored
 */
export interface WindowConfig {
  id: string;
  title: string;
  minWidth: number;
  minHeight: number;
  defaultWidth: number;
  defaultHeight: number;
}

/**
 * Extended HTML element interface with vendor-prefixed fullscreen methods
 * Used for cross-browser fullscreen API support
 */
export interface ExtendedHTMLElement extends HTMLElement {
  /** WebKit-specific method to request fullscreen mode */
  webkitRequestFullscreen: () => Promise<void>;
  /** Microsoft-specific method to request fullscreen mode */
  msRequestFullscreen: () => Promise<void>;
}

/**
 * Extended Document interface with vendor-prefixed fullscreen properties and methods
 * Used for cross-browser fullscreen API support
 */
export interface ExtendedDocument extends Document {
  webkitExitFullscreen: () => Promise<void>;
  msExitFullscreen: () => Promise<void>;
  webkitFullscreenElement: React.SetStateAction<boolean>;
  msFullscreenElement: React.SetStateAction<boolean>;
}

/**
 * Cross-browser fullscreen API interface
 * Provides unified access to fullscreen functionality across different browsers
 */
export interface FullscreenManager {
  isFullscreen: boolean;
  // Methods to manage fullscreen
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
  requestFullscreen: () => void;
}

/**
 * Device detection information
 * Provides details about the current device type for responsive behavior
 */
export interface DeviceInfo {
  isMobile: boolean;
  isTablet?: boolean;
  isDesktop: boolean;
}

/**
 * Theme switching function type
 * Used to switch between different color themes in the application
 */
export type ThemeSwitcher = (theme: DefaultTheme) => void;

/**
 * Local state management for the state of each window
 * which manages three main windows: terminal, welcome browser, and resume.
 *
 * @property {boolean} mounted - Whether the window component is mounted in the DOM
 * @property {boolean} visible - Whether the window is currently visible to the user
 * @property {boolean} maximized - Whether the window is in maximized state (fills available space)
 * @property {number} x - The X coordinate position of the window relative to the viewport
 * @property {number} y - The Y coordinate position of the window relative to the viewport
 * @property {number} width - The width of the window in pixels
 * @property {number} height - The height of the window in pixels
 *
 * @property {function} bringToFront - function to bring any window to the front of the z-index stack
 * @property {function} open - function open the window
 * @property {function} close - function close the window
 * @property {function} minimize - function to minimize the window
 * @property {function} toggleMaximize - function to toggle the maximize state of the window
 * @property {function} resize - function to change the height and width of the window
 * @property {function} move - function to update the x and y coordinates of the window
 *
 */
export interface WindowState {
  mounted: boolean;
  visible: boolean;
  maximized: boolean;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;

  bringToFront: () => void;
  open?: () => void;
  close: () => void;
  minimize?: () => void;
  toggleMaximize?: () => void;
  resize: (width: number, height: number, x?: number, y?: number) => void;
  move: (x: number, y: number) => void;
}

/**
 * Window manager interface for managing multiple application windows
 *
 * Provides comprehensive window management functionality including opening, closing,
 * minimizing, maximizing, moving, and resizing windows. Also handles z-index management
 * and responsive behavior for different device types.
 */
export interface WindowManager {
  // Window states
  terminal: WindowState;
  welcome: WindowState;
  resume: WindowState;

  /** Initialize all windows with appropriate states based on device type */
  initializeWindows: () => void;
}
