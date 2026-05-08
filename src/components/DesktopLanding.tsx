import { ThemeProvider } from "styled-components";
import { PERSONAL_DATA } from "../config/personalData.config";
import { themeContext } from "../hooks/useTheme";
import theme from "../styles/themes";
import DesktopShortcuts from "./desktop-shortcuts/DesktopShortcuts";
import Taskbar from "../layout/taskbar/Taskbar";
import ResumeWindow from "./windows/ResumeWindow";
import TerminalWindow from "./windows/terminal/TerminalWindow";
import BrowserRouter from "../layout/browser/BrowserRouter";
import { useState, useEffect } from "react";
import { useWindowManager } from "../hooks/useWindowManager";
import { ThemeSwitcherProps, WindowManager } from "../types/window";
import { isMobileDevice } from "../utils/typeGuards";
import Draggable from "../layout/Draggable";
import Carousel from "../layout/widgets/Carousel";
import Tooltip from "../layout/tooltips/Tooltip";
import { TOOLTIP_IDS } from "../layout/tooltips/tooltips.config";
import MobileWidgetButton from "../layout/widgets/MobileWidgetButton";
import { FiImage } from "react-icons/fi";

const DesktopLanding: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  themeSwitcher,
  themeLoaded,
  resumePath,
  isBGChange,
  setIsBGChange,
}) => {
  const { terminal, welcome, resume }: WindowManager = useWindowManager();

  // Device detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // Background carousel tooltip
  const [showCarouselTooltip, setShowCarouselTooltip] = useState<boolean>(true);

  useEffect(() => {
    const update = () => setIsMobile(isMobileDevice());
    update();
  }, []);

  // Disable browser's default behavior
  useEffect(() => {
    window.addEventListener(
      "keydown",
      e => {
        return (
          ["ArrowUp", "ArrowDown"].indexOf(e.code) > -1 && e.preventDefault()
        );
      },
      false
    );
  }, []);

  // Update meta tag colors when switching themes
  useEffect(() => {
    const themeColor = currentTheme.colors?.body;
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    const maskIcon = document.querySelector("link[rel='mask-icon']");
    const metaMsTileColor = document.querySelector(
      "meta[name='msapplication-TileColor']"
    );
    metaThemeColor?.setAttribute("content", themeColor);
    metaMsTileColor?.setAttribute("content", themeColor);
    maskIcon?.setAttribute("color", themeColor);
  }, [theme]);

  const carouselPos = {
    initialX: isMobile ? 0 : window.innerWidth - 310,
    initialY: isMobile ? window.innerHeight - 280 : 250,
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <h1 className="sr-only" aria-label={PERSONAL_DATA.personalInfo.name}>
        {PERSONAL_DATA.personalInfo.name}
      </h1>
      <themeContext.Provider
        value={{
          themeSwitcher,
          currentTheme,
          themeLoaded,
          resumePath,
          setIsBGChange,
          isBGChange,
        }}
      >
        {/* Desktop Icons - below windows, hidden when any window is maximized */}
        <DesktopShortcuts
          onOpenTerminal={terminal.open}
          onOpenWelcome={welcome.open}
          onOpenBrowserWithUrl={welcome.openWithUrl}
          onOpenResume={resume.open}
          hidden={terminal.maximized || welcome.maximized || resume.maximized}
          activeTerminal={!isMobile && terminal.mounted && terminal.visible}
          activeBrowser={!isMobile && welcome.mounted && welcome.visible}
          activeResume={!isMobile && resume.mounted && resume.visible}
          mobileExpanded={isMobile}
          terminal={terminal}
          welcome={welcome}
          resume={resume}
        />

        {/* Linux-style taskbar fixed at the bottom */}
        <Taskbar {...{ terminal, welcome, resume }} />

        {/* Welcome Browser Window opens on start on desktop only */}
        {welcome.mounted && (
          <BrowserRouter
            close={welcome.close}
            // On mobile: only close button (omit minimize/maximize)
            minimize={!isMobile ? welcome.minimize : undefined}
            toggleMaximize={!isMobile ? welcome.toggleMaximize : undefined}
            maximized={welcome.maximized}
            visible={welcome.visible}
            mounted={welcome.mounted}
            x={welcome.x}
            y={welcome.y}
            z={welcome.z}
            width={welcome.width}
            height={welcome.height}
            move={welcome.move}
            resize={welcome.resize}
            bringToFront={welcome.bringToFront}
            href={welcome.href}
          />
        )}

        {/* Terminal Window */}
        {terminal.mounted && (
          <TerminalWindow
            close={terminal.close}
            // On mobile: only close button (omit minimize/maximize)
            minimize={!isMobile ? terminal.minimize : undefined}
            toggleMaximize={!isMobile ? terminal.toggleMaximize : undefined}
            maximized={terminal.maximized}
            visible={terminal.visible}
            mounted={terminal.mounted}
            x={terminal.x}
            y={terminal.y}
            z={terminal.z}
            width={terminal.width}
            height={terminal.height}
            move={terminal.move}
            resize={terminal.resize}
            bringToFront={terminal.bringToFront}
          />
        )}

        {/* Resume Window */}
        {resume.mounted && (
          <ResumeWindow
            close={resume.close}
            // On mobile: only close button (omit minimize/maximize)
            minimize={!isMobile ? resume.minimize : undefined}
            toggleMaximize={!isMobile ? resume.toggleMaximize : undefined}
            maximized={resume.maximized}
            visible={resume.visible}
            mounted={terminal.mounted}
            x={resume.x}
            y={resume.y}
            z={resume.z}
            width={resume.width}
            height={resume.height}
            move={resume.move}
            resize={resume.resize}
            bringToFront={resume.bringToFront}
          />
        )}

        <Draggable {...carouselPos}>
          <MobileWidgetButton
            isMobile={isMobile}
            onClick={() => setShowCarouselTooltip(false)}
            widget={
              <Carousel
                currentTheme={currentTheme}
                themeSwitcher={themeSwitcher}
                baseWidth={isMobile ? 250 : 300}
                autoplay={false}
                loop={true}
              />
            }
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(20, 20, 20, 0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              <FiImage size={24} color="white" />
            </div>
          </MobileWidgetButton>
          <div
            style={{ position: "relative", bottom: isMobile ? "60px" : "50px" }}
          >
            <Tooltip
              id={TOOLTIP_IDS.CAROUSEL_HINT}
              showCondition={showCarouselTooltip}
              onClose={() => setShowCarouselTooltip(false)}
            />
          </div>
        </Draggable>
      </themeContext.Provider>
    </ThemeProvider>
  );
};

export default DesktopLanding;
