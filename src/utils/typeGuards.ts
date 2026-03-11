export const isFullscreenElement = (el: Element): boolean => {
  return el instanceof Element;
};

export const isFullscreenAPIAvailable = (): boolean => {
  return !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as any).webkitRequestFullscreen ||
    (document.documentElement as any).msRequestFullscreen
  );
};

export const isMobileDevice = (): boolean => {
  return window.matchMedia('(max-width: 768px)').matches;
};
