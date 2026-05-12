import { DefaultTheme } from "styled-components";

export type Themes = {
  [key: string]: DefaultTheme;
};

const theme: Themes = {
  empty: {
    id: "empty",
    name: "empty",
    colors: {
      body: "#0C0C0C",
      scrollHandle: "#2E3440",
      scrollHandleHover: "#434C5E",
      primary: "rgba(59, 246, 137, 0.9)",
      secondary: "#FF6B6B",
      text: {
        100: "rgba(59, 246, 137, 0.9)",
        200: "#D8DEE9",
        300: "rgba(59, 246, 137, 0.9)",
      },
    },
  },
  tech: {
    id: "ubuntu",
    name: "Ubuntu",
    subtitle: "Engineering",
    logo: "icons/ubuntu-logo.svg",
    colors: {
      body: "#77216e67;",
      scrollHandle: "#c2c2c2fd",
      scrollHandleHover: "#434C5E",
      primary: "#611e5aff",
      secondary: "#FF6B6B",
      text: {
        100: "#ECEFF4",
        200: "#D8DEE9",
        300: "#99ddcc",
      },
    },
    splashImage: "ubuntu-splash.svg",
    startupSound: "sounds/login.wav",
    backgroundImage:
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_1681/https%3A%2F%2Fubuntu.com%2Fwp-content%2Fuploads%2F834a%2FHigh-contrastResolute_Raccoon_Wallpaper_Color_1920x1080.png",
  },
  fedora: {
    id: "fedora",
    name: "Fedora",
    subtitle: "Consulting",
    logo: "icons/fedora-logo.svg",
    colors: {
      body: "#3c6eb482",
      scrollHandle: "#2E3440",
      scrollHandleHover: "#434C5E",
      primary: "#53729dff",
      secondary: "#FF6B6B",
      text: {
        100: "#ECEFF4",
        200: "#D8DEE9",
        300: "#99ddcc",
      },
    },
    splashImage: "fedora-splash.svg",
    startupSound: "sounds/login.wav",
    backgroundImage: "https://wallpapercave.com/wp/BFBePbi.jpg",
  },
  kali: {
    id: "kali",
    name: "Kali",
    subtitle: "Security",
    logo: "icons/kali-logo.svg",
    colors: {
      body: "#0c0c0cbe",
      scrollHandle: "#2E3440",
      scrollHandleHover: "#434C5E",
      primary: "#4d4d4dff",
      secondary: "#FF6B6B",
      text: {
        100: "#ECEFF4",
        200: "#D8DEE9",
        300: "#99ddcc",
      },
    },
    backgroundImage: "https://www.kali.org/wallpapers/images/2026/kali-net.jpg",
    splashImage: "kali-splash.svg",
    startupSound: "sounds/login.wav",
  },
};

export default theme;
