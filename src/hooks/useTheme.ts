import { useEffect, useState } from "react";
import themes from "../components/styles/themes";
import { DefaultTheme } from "styled-components";

export const useTheme = () => {
  // Kali-only theme
  const [theme, setTheme] = useState<DefaultTheme>(themes.kali);
  const [themeLoaded, setThemeLoaded] = useState(false);

  const setMode = (_mode: DefaultTheme) => {
    // No-op: theme switching disabled in Kali-only mode
    setTheme(themes.kali);
  };

  useEffect(() => {
    // Immediately mark as loaded with Kali theme
    setTheme(themes.kali);
    setThemeLoaded(true);
  }, []);

  return { theme, themeLoaded, setMode };
};
