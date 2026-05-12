import { DefaultTheme } from "styled-components";
import { Suspense, lazy } from "react";

import { useTheme } from "./hooks/useTheme";
import SplashScreen from "./components/SplashScreen";
import ThemeSwitcher from "./layout/widgets/ThemeSwitcher";
import { ThemeSwitcherProps } from "./types/window";
import { preloadResources } from "./utils/resource-utils";
import ShapeGrid from "./components/Antigravity";
import LoadingStatusBar from "./components/LoadingStatusBar";
import GlobalStyle from "./styles/GlobalStyle";

function App() {
  // themes
  const { theme, themeLoaded, setMode, resumePath, isBGChange, setIsBGChange } =
    useTheme();
  const DesktopLanding = lazy(() => {
    const timeout = isBGChange ? 50 : 2000;
    return new Promise(resolve => setTimeout(resolve, timeout)).then(() => {
      preloadResources(theme);
      return import("./components/DesktopLanding");
    });
  });

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setMode(switchTheme);
  };
  const themeProps: ThemeSwitcherProps = {
    themeSwitcher,
    currentTheme: theme,
    themeLoaded,
    resumePath,
    isBGChange,
    setIsBGChange,
  };

  return (
    <>
      <GlobalStyle theme={theme} />
      {/* Theme Switcher - 3-way toggle for Linux, Fedora, Kali themes */}
      <ThemeSwitcher {...themeProps} />
      {!themeLoaded ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            background: "#000000ff",
            backgroundImage:
              "radial-gradient(circle, hsl(240, 5%, 65%, 0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            overflow: "hidden",
          }}
        >
          <ShapeGrid
            speed={0.1}
            squareSize={100}
            hoverTrailAmount={18} // number of trailing hovered shapes (0 = no trail)
            direction="diagonal"
            borderColor="rgba(59, 246, 137, 0.16)"
            hoverFillColor={theme.colors.text[100]}
            shape="triangle"
          />
          {<LoadingStatusBar {...themeProps} />}
        </div>
      ) : (
        <Suspense fallback={<SplashScreen {...themeProps} />}>
          <DesktopLanding {...themeProps} />
        </Suspense>
      )}
    </>
  );
}

export default App;
