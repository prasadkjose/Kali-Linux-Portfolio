import { useEffect, useState } from "react";
import themes from "../components/styles/themes";
import { DefaultTheme } from "styled-components";

interface UseThemeResult {
  theme: DefaultTheme;
  themeLoaded: boolean;
  setMode: (theme: DefaultTheme) => void;
}

export const useTheme = (): UseThemeResult => {
  // Kali-only theme
  const [theme, setTheme] = useState<DefaultTheme>(themes.kali);
  const [themeLoaded, setThemeLoaded] = useState(false);

  const setMode = () => {
    // Only Kali theme for now
    setTheme(themes.kali);
  };

  useEffect(() => {
    // Immediately mark as loaded with Kali theme
    setTheme(themes.kali);
    setThemeLoaded(true);
  }, []);

  return { theme, themeLoaded, setMode };
};
