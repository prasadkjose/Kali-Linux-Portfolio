import { createContext, useEffect, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import TerminalWindow from "./components/TerminalWindow";
import DesktopShortcuts from "./components/DesktopShortcuts";
import WelcomeBrowserWindow from "./components/WelcomeBrowserWindow";
import ResumeWindow from "./components/ResumeWindow";
import FullscreenToggle from "./components/FullscreenToggle";

export const themeContext = createContext<
  ((switchTheme: DefaultTheme) => void) | null
>(null);

function App() {
  // themes
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  // Device detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const requestFullscreen = async () => {
    const el: any = document.documentElement;
    try {
      if (!document.fullscreenElement && el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      else if ((el as any).msRequestFullscreen) await (el as any).msRequestFullscreen();
    } catch {}
  };
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
      else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
    } catch {}
  };
  const toggleFullscreen = async () => {
    if (!isFullscreen) await requestFullscreen(); else await exitFullscreen();
  };
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange as any);
    document.addEventListener('msfullscreenchange', onChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange as any);
      document.removeEventListener('msfullscreenchange', onChange as any);
    };
  }, []);
  // Auto-enter fullscreen on load (best-effort; some browsers require gesture)
  useEffect(() => {
    if (themeLoaded) {
      requestFullscreen();
    }
  }, [themeLoaded]);

  // Terminal window state
  const [terminalMounted, setTerminalMounted] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [winX, setWinX] = useState(0);
  const [winY, setWinY] = useState(0);
  const [winW, setWinW] = useState(960);
  const [winH, setWinH] = useState(640);

  // Welcome browser window state (shown on load on desktop only)
  const [welcomeMounted, setWelcomeMounted] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [welcomeMaximized, setWelcomeMaximized] = useState(false);

  // Resume window state
  const [resumeMounted, setResumeMounted] = useState(false);
  const [resumeVisible, setResumeVisible] = useState(false);
  const [resumeMaximized, setResumeMaximized] = useState(false);

  // z-index stacking for windows (desktop): highest index on last focused
  const [zTop, setZTop] = useState(500);
  const [zBrowser, setZBrowser] = useState(200);
  const [zTerminal, setZTerminal] = useState(300);
  const [zResume, setZResume] = useState(400);
  const bringBrowserToFront = () => { const next = zTop + 1; setZTop(next); setZBrowser(next); };
  const bringTerminalToFront = () => { const next = zTop + 1; setZTop(next); setZTerminal(next); };
  const bringResumeToFront = () => { const next = zTop + 1; setZTop(next); setZResume(next); };
  const [wbX, setWbX] = useState(140);
  const [wbY, setWbY] = useState(60);
  const [wbW, setWbW] = useState(900);
  const [wbH, setWbH] = useState(560);
  const [rsX, setRsX] = useState(160);
  const [rsY, setRsY] = useState(80);
  const [rsW, setRsW] = useState(900);
  const [rsH, setRsH] = useState(560);

  // Startup layout: mobile => browser only, maximized; desktop => browser only centered
  useEffect(() => {
    if (!themeLoaded) return;
    if (isMobile) {
      setWelcomeMounted(true);
      setWelcomeVisible(true);
      setWelcomeMaximized(true); // force maximized on mobile

      setTerminalMounted(false);
      setTerminalVisible(false);
      setTerminalMaximized(false);
    } else {
      setWelcomeMounted(true);
      setWelcomeVisible(true);
      setWelcomeMaximized(false);
      // Center browser on desktop startup
      const ww = window.innerWidth, wh = window.innerHeight;
      const w = wbW, h = wbH;
      setWbX(Math.max(0, Math.round((ww - w) / 2)));
      setWbY(Math.max(0, Math.round((wh - h) / 2)));
      bringBrowserToFront();

      setTerminalMounted(false);
      setTerminalVisible(false);
      setTerminalMaximized(false);
    }
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
    const metaMsTileColor = document.querySelector("meta[name='msapplication-TileColor']");
    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
    metaMsTileColor && metaMsTileColor.setAttribute("content", themeColor);
    maskIcon && maskIcon.setAttribute("color", themeColor);
  }, [selectedTheme]);

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setSelectedTheme(switchTheme);
    setMode(switchTheme);
  };

  // Terminal handlers
  const handleClose = () => { setTerminalMounted(false); setTerminalVisible(false); setTerminalMaximized(false); };
  const handleMinimize = () => { setTerminalVisible(false); setTerminalMaximized(false); };
  const handleOpenFromShortcut = () => {
    if (isMobile) {
      // Force maximized on mobile
      setTerminalMounted(true);
      setTerminalVisible(true);
      setTerminalMaximized(true);
      bringTerminalToFront();
      return;
    }
    // center on open (desktop)
    const ww = window.innerWidth, wh = window.innerHeight;
    const w = winW, h = winH;
    setWinX(Math.max(0, Math.round((ww - w) / 2)));
    setWinY(Math.max(0, Math.round((wh - h) / 2)));
    if (!terminalMounted) setTerminalMounted(true);
    setTerminalVisible(true);
    bringTerminalToFront();
  };
  const handleToggleMaximize = () => { setTerminalMaximized(prev => !prev); setTerminalVisible(true); };

  // Resume window handlers
  const handleResumeClose = () => { setResumeMounted(false); setResumeVisible(false); setResumeMaximized(false); };
  const handleResumeMinimize = () => { setResumeVisible(false); setResumeMaximized(false); };
  const handleOpenResume = () => {
    if (isMobile) {
      // Force maximized on mobile
      setResumeMounted(true);
      setResumeVisible(true);
      setResumeMaximized(true);
      bringResumeToFront();
      return;
    }
    // Center on open (desktop)
    const ww = window.innerWidth, wh = window.innerHeight;
    const w = rsW, h = rsH;
    setRsX(Math.max(0, Math.round((ww - w) / 2)));
    setRsY(Math.max(0, Math.round((wh - h) / 2)));
    if (!resumeMounted) setResumeMounted(true);
    setResumeVisible(true);
    bringResumeToFront();
  };
  const handleResumeToggleMax = () => { setResumeMaximized(p => !p); setResumeVisible(true); };

  // Welcome window handlers
  const handleWelcomeClose = () => { setWelcomeMounted(false); setWelcomeVisible(false); setWelcomeMaximized(false); };
  const handleWelcomeMinimize = () => { setWelcomeVisible(false); setWelcomeMaximized(false); };
  const handleOpenWelcome = () => {
    if (isMobile) {
      // Force maximized on mobile
      setWelcomeMounted(true);
      setWelcomeVisible(true);
      setWelcomeMaximized(true);
      bringBrowserToFront();
      return;
    }
    // Center on open (desktop)
    const ww = window.innerWidth, wh = window.innerHeight;
    const w = wbW, h = wbH;
    setWbX(Math.max(0, Math.round((ww - w) / 2)));
    setWbY(Math.max(0, Math.round((wh - h) / 2)));
    if (!welcomeMounted) setWelcomeMounted(true);
    setWelcomeVisible(true);
    bringBrowserToFront();
  };
  const handleWelcomeToggleMax = () => { setWelcomeMaximized(p => !p); setWelcomeVisible(true); };

  return (
    <>
      <h1 className="sr-only" aria-label="Jihed Kdiss">Jihed Kdiss</h1>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle />
          <themeContext.Provider value={themeSwitcher}>
            {/* Desktop Icons - below windows, hidden when any window is maximized */}
            <DesktopShortcuts
              onOpenTerminal={handleOpenFromShortcut}
              onOpenWelcome={handleOpenWelcome}
              onOpenResume={handleOpenResume}
              hidden={terminalMaximized || welcomeMaximized || resumeMaximized}
              activeTerminal={!isMobile && terminalMounted && terminalVisible}
              activeBrowser={!isMobile && welcomeMounted && welcomeVisible}
              activeResume={!isMobile && resumeMounted && resumeVisible}
              mobileExpanded={isMobile && !terminalMounted}
            />

            {/* Fullscreen toggle control: hide when any window maximized; allow windows to overlap due to low z-index */}
            <FullscreenToggle
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
              hidden={terminalMaximized || welcomeMaximized || resumeMaximized}
            />

            {/* Welcome Browser Window opens on start on desktop only */}
            {welcomeMounted && (
              <WelcomeBrowserWindow
                onClose={handleWelcomeClose}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? handleWelcomeMinimize : undefined}
                onToggleMaximize={!isMobile ? handleWelcomeToggleMax : undefined}
                isMaximized={welcomeMaximized}
                visible={welcomeVisible}
                x={wbX} y={wbY} width={wbW} height={wbH}
                onMove={(x,y) => { setWbX(x); setWbY(y); bringBrowserToFront(); }}
                onResize={({ width, height, x, y }) => { if (x!==undefined) setWbX(x); if (y!==undefined) setWbY(y); setWbW(width); setWbH(height); bringBrowserToFront(); }}
                onFocus={bringBrowserToFront}
                zIndex={zBrowser}
              />
            )}

            {/* Terminal Window */}
            {terminalMounted && (
              <TerminalWindow
                onClose={handleClose}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? handleMinimize : undefined}
                onToggleMaximize={!isMobile ? handleToggleMaximize : undefined}
                isMaximized={terminalMaximized}
                visible={terminalVisible}
                x={winX} y={winY} width={winW} height={winH}
                onMove={(x, y) => { setWinX(x); setWinY(y); bringTerminalToFront(); }}
                onResize={({ width, height, x, y }) => { if (x !== undefined) setWinX(x); if (y !== undefined) setWinY(y); setWinW(width); setWinH(height); bringTerminalToFront(); }}
                onFocus={bringTerminalToFront}
                zIndex={zTerminal}
              />
            )}

            {/* Resume Window */}
            {resumeMounted && (
              <ResumeWindow
                onClose={handleResumeClose}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? handleResumeMinimize : undefined}
                onToggleMaximize={!isMobile ? handleResumeToggleMax : undefined}
                isMaximized={resumeMaximized}
                visible={resumeVisible}
                x={rsX} y={rsY} width={rsW} height={rsH}
                onMove={(x,y) => { setRsX(x); setRsY(y); bringResumeToFront(); }}
                onResize={({ width, height, x, y }) => { if (x!==undefined) setRsX(x); if (y!==undefined) setRsY(y); setRsW(width); setRsH(height); bringResumeToFront(); }}
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
