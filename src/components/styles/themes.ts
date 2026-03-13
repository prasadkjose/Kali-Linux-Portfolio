import { DefaultTheme } from "styled-components";

export type Themes = {
  [key: string]: DefaultTheme;
};

const theme: Themes = {
  kali: {
    id: "T_007",
    name: "kali",
    colors: {
      body: "#0C0C0C",
      scrollHandle: "#2E3440",
      scrollHandleHover: "#434C5E",
      primary: "#00D4FF",
      secondary: "#FF6B6B",
      text: {
        100: "#ECEFF4",
        200: "#D8DEE9",
        300: "#88C0D0",
      },
    },
    backgroundImage:
      "https://www.kali.org/wallpapers/images/2024/kali-ferrofluid.jpg",
  },
};

export default theme;
