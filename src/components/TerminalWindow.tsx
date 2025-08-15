import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import Terminal from "./Terminal";

type Props = {
  onClose: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
  visible?: boolean;
  // Position and size for movable/resizable window
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  onMove?: (x: number, y: number) => void;
  onResize?: (next: { width: number; height: number; x?: number; y?: number }) => void;
  onFocus?: () => void;
  zIndex?: number;
};

const WindowFrame = styled.div<{ maximized?: boolean; hidden?: boolean; x?: number; y?: number; width?: number; height?: number; isTransforming?: boolean; zIndex?: number }>`
  ${({ theme }) => theme.backgroundImage && `
    background: rgba(0, 0, 0, 0.35);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  `}
  box-sizing: border-box;

  ${({ hidden }) => hidden && css`display:none;`}

  ${({ maximized, theme }) => maximized && theme.backgroundImage && css`
    position: fixed; inset: 0; margin: 0; max-width: none; width: 100vw; height: 100vh; border-radius: 0;
  `}

  ${({ maximized, x, y, width, height }) => !maximized && css`
    position: fixed;
    left: ${x ?? 0}px;
    top: ${y ?? 0}px;
    width: ${width ?? 960}px;
    height: ${height ?? 640}px;
  `}
  z-index: ${({ zIndex }) => zIndex ?? 300};
  transition: ${({ isTransforming }) => isTransforming ? 'left 180ms ease, top 180ms ease, width 180ms ease, height 180ms ease, border-radius 180ms ease' : 'none'};
`;

const TitleBar = styled.div`
  ${({ theme }) => theme.backgroundImage && `
    background: linear-gradient(to bottom, rgba(32, 32, 32, 0.9), rgba(24, 24, 24, 0.9));
    height: 32px; display: flex; align-items: center; justify-content: center;
    padding: 0 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); position: relative; cursor: move;
  `}
`;

const WindowTitle = styled.div`
  ${({ theme }) => theme.backgroundImage && `
    font-size: 13px; color: #ECEFF4; font-weight: 500; flex: 1; text-align: center; font-family: system-ui, -apple-system, sans-serif;
  `}
`;

const WindowControls = styled.div`
  ${({ theme }) => theme.backgroundImage && `
    position: absolute; right: 12px; top: 0; height: 100%; display: flex; align-items: center; gap: 0;
  `}
`;

const ControlButton = styled.button<{ variant?: 'min' | 'max' | 'close' }>`
  ${({ theme, variant }) => theme.backgroundImage && `
    width: 46px; height: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s ease; border: none; background: transparent; color: #d9d9d9;
    &:hover { background: ${variant === 'close' ? '#E81123' : 'rgba(0,0,0,0.08)'}; }
    &:active { background: ${variant === 'close' ? '#F1707A' : 'rgba(0,0,0,0.12)'}; }
    svg { width: 12px; height: 12px; fill: currentColor; }
    ${variant === 'close' ? `&:hover svg { color: #fff; } &:active svg { color: #fff; }` : ''}
  `}
`;

const MenuBar = styled.div<{ maximized?: boolean }>`
  ${({ theme }) => theme.backgroundImage && `
    background: rgba(24, 24, 24, 0.85);
    height: 28px; display: flex; align-items: center; padding: 0 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-family: system-ui, -apple-system, sans-serif;
  `}
`;

const MenuItem = styled.span`
  ${({ theme }) => theme.backgroundImage && `
    font-size: 12px; color: #ECEFF4; padding: 4px 8px; cursor: pointer; border-radius: 4px; transition: all 0.2s ease;
    &:hover { background: rgba(255, 255, 255, 0.08); transform: translateY(-1px); }
  `}
`;

const TerminalContent = styled.div<{ maximized?: boolean }>`
  ${({ theme }) => theme.backgroundImage && `
    background: transparent; display: flex; flex-direction: column; align-items: stretch; overflow: hidden;
  `}
  height: ${({ maximized }) => maximized ? "calc(100vh - 32px - 28px)" : "calc(100% - 32px - 28px)"};
  & > * { flex: 1 1 auto; min-height: 0; }
`;

// Resize handles
const Handle = styled.div<{ pos: 'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw' }>`
  position: absolute; z-index: 5;
  ${({ pos }) => pos === 'n' && css`top: -2px; left: 6px; right: 6px; height: 6px; cursor: ns-resize;`}
  ${({ pos }) => pos === 's' && css`bottom: -2px; left: 6px; right: 6px; height: 6px; cursor: ns-resize;`}
  ${({ pos }) => pos === 'e' && css`top: 6px; right: -2px; bottom: 6px; width: 6px; cursor: ew-resize;`}
  ${({ pos }) => pos === 'w' && css`top: 6px; left: -2px; bottom: 6px; width: 6px; cursor: ew-resize;`}
  ${({ pos }) => pos === 'ne' && css`top: -2px; right: -2px; width: 10px; height: 10px; cursor: nesw-resize;`}
  ${({ pos }) => pos === 'nw' && css`top: -2px; left: -2px; width: 10px; height: 10px; cursor: nwse-resize;`}
  ${({ pos }) => pos === 'se' && css`bottom: -2px; right: -2px; width: 10px; height: 10px; cursor: nwse-resize;`}
  ${({ pos }) => pos === 'sw' && css`bottom: -2px; left: -2px; width: 10px; height: 10px; cursor: nesw-resize;`}
`;

const MIN_W = 520; // keep room for content
const MIN_H = 360;

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const TerminalWindow: React.FC<Props> = ({
  onClose, onMinimize, onToggleMaximize, isMaximized = false, visible = true,
  x = 0, y = 0, width = 960, height = 640, onMove, onResize, onFocus, zIndex,
}) => {
  const posRef = useRef({ x, y });
  const sizeRef = useRef({ width, height });
  useEffect(() => { posRef.current = { x, y }; }, [x, y]);
  useEffect(() => { sizeRef.current = { width, height }; }, [width, height]);

  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, sx: 0, sy: 0 });
  const [isTransforming, setIsTransforming] = useState(false);

  const resizing = useRef<null | { dir: HandleProps['pos']; mx: number; my: number; sx: number; sy: number; sw: number; sh: number }>(null);
  type HandleProps = React.ComponentProps<typeof Handle>;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isMaximized) return;
    if (dragging.current) {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      const newX = clamp(dragStart.current.sx + dx, 0, Math.max(0, ww - sizeRef.current.width));
      const newY = clamp(dragStart.current.sy + dy, 0, Math.max(0, wh - sizeRef.current.height));
      onMove && onMove(newX, newY);
    } else if (resizing.current) {
      const { dir, mx, my, sx, sy, sw, sh } = resizing.current;
      let newW = sw;
      let newH = sh;
      let newX = sx;
      let newY = sy;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;
      if (dir.includes('e')) newW = sw + dx;
      if (dir.includes('s')) newH = sh + dy;
      if (dir.includes('w')) { newW = sw - dx; newX = sx + dx; }
      if (dir.includes('n')) { newH = sh - dy; newY = sy + dy; }
      newW = Math.max(MIN_W, newW);
      newH = Math.max(MIN_H, newH);
      const ww = window.innerWidth; const wh = window.innerHeight;
      newX = clamp(newX, 0, Math.max(0, ww - newW));
      newY = clamp(newY, 0, Math.max(0, wh - newH));
      onResize && onResize({ width: newW, height: newH, x: newX, y: newY });
    }
  }, [isMaximized, onMove, onResize]);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    resizing.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    // Re-enable transitions after interaction ends
    const t = setTimeout(() => setIsTransforming(false), 0);
    return () => clearTimeout(t);
  }, [onMouseMove]);

  const startDrag = (e: React.MouseEvent) => {
    if (isMaximized) return;
    dragging.current = true;
    setIsTransforming(false); // no animation during drag
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: posRef.current.x, sy: posRef.current.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResize = (dir: HandleProps['pos']) => (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.stopPropagation();
    resizing.current = { dir, mx: e.clientX, my: e.clientY, sx: posRef.current.x, sy: posRef.current.y, sw: sizeRef.current.width, sh: sizeRef.current.height };
    setIsTransforming(false); // no animation during resize
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <WindowFrame maximized={isMaximized} hidden={!visible} x={x} y={y} width={width} height={height} isTransforming={!dragging.current && !resizing.current} zIndex={zIndex}>
      <TitleBar onMouseDown={(e) => { startDrag(e); onFocus && onFocus(); }}>
        <WindowTitle>Terminal</WindowTitle>
        <WindowControls aria-label="Window controls">
          {onMinimize && (
            <ControlButton variant="min" title="Minimize" aria-label="Minimize" onClick={onMinimize}>
              <svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="5" width="8" height="1" rx="0.5" /></svg>
            </ControlButton>
          )}
          {onToggleMaximize && (
            <ControlButton variant="max" title="Maximize" aria-label="Maximize" onClick={onToggleMaximize}>
              <svg viewBox="0 0 10 10" aria-hidden="true"><rect x="2" y="2" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
            </ControlButton>
          )}
          <ControlButton variant="close" title="Close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2 L8 8 M8 2 L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </ControlButton>
        </WindowControls>
      </TitleBar>

      {!isMaximized && (
        <>
          <Handle pos='n' onMouseDown={startResize('n')} />
          <Handle pos='s' onMouseDown={startResize('s')} />
          <Handle pos='e' onMouseDown={startResize('e')} />
          <Handle pos='w' onMouseDown={startResize('w')} />
          <Handle pos='ne' onMouseDown={startResize('ne')} />
          <Handle pos='nw' onMouseDown={startResize('nw')} />
          <Handle pos='se' onMouseDown={startResize('se')} />
          <Handle pos='sw' onMouseDown={startResize('sw')} />
        </>
      )}

      <MenuBar maximized={isMaximized}>
        <MenuItem>File</MenuItem>
        <MenuItem>Edit</MenuItem>
        <MenuItem>View</MenuItem>
        <MenuItem>Search</MenuItem>
        <MenuItem>Terminal</MenuItem>
        <MenuItem>Help</MenuItem>
      </MenuBar>

      <TerminalContent maximized={isMaximized}>
        <Terminal />
      </TerminalContent>
    </WindowFrame>
  );
};

export default TerminalWindow;
