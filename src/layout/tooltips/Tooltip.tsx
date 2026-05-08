import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { CloseButton } from "../window-container/BrowserWindow.styled";
import { getFromSS, setToSS } from "../../utils/storage";
import { TOOLTIPS_CONFIG } from "./tooltips.config";

const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const TooltipBubble = styled.div<{ $position: string; $offsetY?: number }>`
  position: absolute;
  width: 180px;
  padding: 10px;
  background: rgba(12, 12, 18, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #eceff4;
  font-size: 11px;
  text-transform: none;
  font-family:
    system-ui,
    Segoe UI,
    Roboto,
    sans-serif;
  font-weight: 400;
  line-height: 1.4;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  z-index: 10001;
  animation: ${fadeSlideUp} 0.25s ease-out;
  display: flex;
  flex-direction: row-reverse;
  &::after {
    width: 12px;
    height: 12px;
    background: rgba(12, 12, 18, 0.95);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
  }

  &::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 8px;
    padding: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #ff6b6b 25%,
      transparent 50%
    );
    background-size: 200% 100%;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: borderRun 5.5s linear infinite;
    pointer-events: none;
    z-index: 1;
  }

  @keyframes borderRun {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  ${({ $position, $offsetY = 0 }) => {
    switch ($position) {
      case "top-left":
        return `
          top: calc(-60px + ${$offsetY}px);
          left: 0;
          &::after {
            content: "";
            position: absolute;
            bottom: -6px;
            left: 12px;
          }
        `;
      case "top-right":
        return `
          top: calc(-60px + ${$offsetY}px);
          right: 0;
          &::after {
            content: "";
            position: absolute;
            bottom: -6px;
            right: 12px;
          }
        `;
      case "bottom-left":
        return `
          top: calc(60px + ${$offsetY}px);
          left: 0;
          &::after {
            content: "";
            position: absolute;
            top: -6px;
            left: 12px;
          }
        `;
      case "bottom-right":
      default:
        return `
          top: calc(60px + ${$offsetY}px);
          right: 0;
          &::after {
            content: "";
            position: absolute;
            top: -6px;
            right: 12px;
          }
        `;
    }
  }}// Border glower
`;

export interface TooltipProps {
  id: string;
  showCondition?: boolean;
  onClose?: () => void;
  offsetY?: number;
}

const TOOLTIPS_STORAGE_KEY = "tooltips:dismissed";

const Tooltip: React.FC<TooltipProps> = ({
  id,
  showCondition = true,
  onClose,
  offsetY = 0,
}) => {
  const tooltipConfig = TOOLTIPS_CONFIG.filter(tooltip => tooltip.id === id)[0];
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissedTooltips = getFromSS<Record<string, boolean>>(
      TOOLTIPS_STORAGE_KEY,
      {}
    );
    return dismissedTooltips[id] === true;
  });

  useEffect(() => {
    if (showCondition && !isDismissed) {
      const timer = setTimeout(() => setVisible(true), tooltipConfig.showAfter);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [showCondition, isDismissed]);

  const handleClose = () => {
    setVisible(false);
    setIsDismissed(true);

    const dismissedTooltips = getFromSS<Record<string, boolean>>(
      TOOLTIPS_STORAGE_KEY,
      {}
    );
    setToSS(TOOLTIPS_STORAGE_KEY, {
      ...dismissedTooltips,
      [id]: true,
    });

    onClose?.();
  };

  if (!visible) return null;

  return (
    <TooltipBubble
      $position={tooltipConfig.position}
      $offsetY={offsetY}
      onClick={e => e.stopPropagation()}
    >
      <CloseButton
        onClick={e => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Dismiss tooltip"
      >
        ✕
      </CloseButton>
      {tooltipConfig.content}
    </TooltipBubble>
  );
};

export default Tooltip;
