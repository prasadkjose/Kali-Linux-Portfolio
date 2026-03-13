import { createContext, useEffect, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import { useWindowManager } from "./hooks/useWindowManager";
import GlobalStyle from "./components/styles/GlobalStyle";
import TerminalWindow from "./components/TerminalWindow";
import DesktopShortcuts from "./components/DesktopShortcuts";
import WelcomeBrowserWindow from "./components/WelcomeBrowserWindow";
import ResumeWindow from "./components/ResumeWindow";
import FullscreenToggle from "./components/FullscreenToggle";
import {
  ThemeSwitcher,
  ExtendedHTMLElement,
  ExtendedDocument,
} from "./types/window";
import { isMobileDevice } from "./utils/typeGuards";

export const themeContext = createContext<ThemeSwitcher | null>(null);

function App() {
  // themes
  const { theme, themeLoaded, setMode } = useTheme();
  const {
    terminal,
    welcome,
    resume,

    // Z-index management
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
  } = useWindowManager();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  // Device detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const update = () => setIsMobile(isMobileDevice());
    update();
  }, []);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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
  const toggleFullscreen = async () => {
    if (!isFullscreen) await requestFullscreen();
    else await exitFullscreen();
  };
  useEffect(() => {
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
  }, []);
  // Auto-enter fullscreen on load (best-effort; some browsers require gesture)
  useEffect(() => {
    if (themeLoaded) {
      requestFullscreen();
    }
  }, [themeLoaded]);

  // Startup layout: mobile => browser only, maximized; desktop => browser only centered
  useEffect(() => {
    if (!themeLoaded) return;
  }, [isMobile, themeLoaded]);

  // Disable browser's default behavior
  useEffect(() => {
    window.addEventListener(
      "keydown",
      e => {
        ["ArrowUp", "ArrowDown"].indexOf(e.code) > -1 && e.preventDefault();
      },
      false
    );
  }, []);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [themeLoaded]);

  // Update meta tag colors when switching themes
  useEffect(() => {
    const themeColor = theme.colors?.body;
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    const maskIcon = document.querySelector("link[rel='mask-icon']");
    const metaMsTileColor = document.querySelector(
      "meta[name='msapplication-TileColor']"
    );
    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
    metaMsTileColor && metaMsTileColor.setAttribute("content", themeColor);
    maskIcon && maskIcon.setAttribute("color", themeColor);
  }, [selectedTheme]);

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setSelectedTheme(switchTheme);
    setMode(switchTheme);
  };

  return (
    <>
      <h1 className="sr-only" aria-label="Prasad Koshy Jose">
        Prasad Koshy Jose
      </h1>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle />
          <themeContext.Provider value={themeSwitcher}>
            {/* Desktop Icons - below windows, hidden when any window is maximized */}
            <DesktopShortcuts
              onOpenTerminal={openTerminal}
              onOpenWelcome={openWelcome}
              onOpenResume={openResume}
              hidden={
                terminal.maximized || welcome.maximized || resume.maximized
              }
              activeTerminal={!isMobile && terminal.mounted && terminal.visible}
              activeBrowser={!isMobile && welcome.mounted && welcome.visible}
              activeResume={!isMobile && resume.mounted && resume.visible}
              mobileExpanded={isMobile && !terminal.mounted}
            />

            {/* Fullscreen toggle control: hide when any window maximized; allow windows to overlap due to low z-index */}
            <FullscreenToggle
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
              hidden={
                terminal.maximized || welcome.maximized || resume.maximized
              }
            />

            {/* Welcome Browser Window opens on start on desktop only */}
            {welcome.mounted && (
              <WelcomeBrowserWindow
                onClose={closeWelcome}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? minimizeWelcome : undefined}
                onToggleMaximize={!isMobile ? toggleMaximizeWelcome : undefined}
                isMaximized={welcome.maximized}
                visible={welcome.visible}
                x={welcome.x}
                y={welcome.y}
                width={welcome.width}
                height={welcome.height}
                onMove={(x, y) => {
                  moveWelcome(x, y);
                  bringBrowserToFront();
                }}
                onResize={({ width, height, x, y }) => {
                  resizeWelcome(width, height, x, y);
                }}
                onFocus={bringBrowserToFront}
                zIndex={zBrowser}
              />
            )}

            {/* Terminal Window */}
            {terminal.mounted && (
              <TerminalWindow
                onClose={closeTerminal}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? minimizeTerminal : undefined}
                onToggleMaximize={
                  !isMobile ? toggleMaximizeTerminal : undefined
                }
                isMaximized={terminal.maximized}
                visible={terminal.visible}
                x={terminal.x}
                y={terminal.y}
                width={terminal.width}
                height={terminal.height}
                onMove={(x, y) => {
                  moveTerminal(x, y);
                }}
                onResize={({ width, height, x, y }) => {
                  resizeTerminal(width, height, x, y);
                }}
                onFocus={bringTerminalToFront}
                zIndex={zTerminal}
              />
            )}

            {/* Resume Window */}
            {resume.mounted && (
              <ResumeWindow
                onClose={closeResume}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? minimizeResume : undefined}
                onToggleMaximize={!isMobile ? toggleMaximizeResume : undefined}
                isMaximized={resume.maximized}
                visible={resume.visible}
                x={resume.x}
                y={resume.y}
                width={resume.width}
                height={resume.height}
                onMove={(x, y) => {
                  moveResume(x, y);
                }}
                onResize={({ width, height, x, y }) => {
                  resizeResume(width, height, x, y);
                }}
                onFocus={bringResumeToFront}
                zIndex={zResume}
              />
            )}
          </themeContext.Provider>
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
