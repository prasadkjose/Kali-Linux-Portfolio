import React from "react";
import styled from "styled-components";

type Props = {
  isFullscreen: boolean;
  onToggle: () => void;
  hidden?: boolean;
};

const Wrap = styled.button<{ hidden?: boolean }>`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100; /* below app windows so they can cover it when overlapping */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.38);
  color: #eceff4;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  font-weight: 500;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  transition: transform 0.1s ease, background 0.15s ease,
    border-color 0.15s ease;
  ${({ hidden }) => hidden && "display:none;"}
  &:hover {
    background: rgba(0, 0, 0, 0.46);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Icon = ({ exit }: { exit?: boolean }) =>
  exit ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8l3 3M16 16l-3-3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

const FullscreenToggle: React.FC<Props> = ({
  isFullscreen,
  onToggle,
  hidden,
}) => {
  return (
    <Wrap
      hidden={hidden}
      onClick={onToggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <Icon exit={isFullscreen} />
      <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
    </Wrap>
  );
};

export default FullscreenToggle;
