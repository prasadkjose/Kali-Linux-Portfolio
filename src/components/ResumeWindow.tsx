import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

// Resume window with integrated PDF viewer

type Props = {
  onClose: () => void;
  onMinimize?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  x?: number; y?: number; width?: number; height?: number;
  onMove?: (x:number, y:number) => void;
  onResize?: (next: { width:number; height:number; x?:number; y?:number }) => void;
  visible?: boolean;
  onFocus?: () => void;
  zIndex?: number;
};

const Frame = styled.div<{ x?:number; y?:number; width?:number; height?:number; maximized?: boolean; hidden?: boolean; isTransforming?: boolean; zIndex?: number }>`
  position: fixed;
  box-sizing: border-box;
  ${({ theme }) => theme.backgroundImage && `
    background: rgba(0, 0, 0, 0.35);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  `}
  ${({ hidden }) => hidden && css`display:none;`}
  ${({ maximized, theme }) => maximized && theme.backgroundImage && css`
    inset: 0; margin: 0; max-width: none; width: 100vw; height: 100vh; border-radius: 0;
  `}
  ${({ maximized, x, y, width, height }) => !maximized && css`
    left: ${x ?? 160}px; top: ${y ?? 80}px; width: ${width ?? 900}px; height: ${height ?? 560}px;
  `}
  z-index: ${({ zIndex }) => zIndex ?? 400};
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

const ControlButton = styled.button<{ variant?: 'min'|'max'|'close' }>`
  ${({ theme, variant }) => theme.backgroundImage && `
    width: 46px; height: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s ease; border: none; background: transparent; color: #d9d9d9;
    &:hover { background: ${variant === 'close' ? '#E81123' : 'rgba(0,0,0,0.08)'}; }
    &:active { background: ${variant === 'close' ? '#F1707A' : 'rgba(0,0,0,0.12)'}; }
    svg { width: 12px; height: 12px; fill: currentColor; }
    ${variant === 'close' ? `&:hover svg { color: #fff; } &:active svg { color: #fff; }` : ''}
  `}
`;

const Toolbar = styled.div`
  ${({ theme }) => theme.backgroundImage && `
    height: 36px; display:flex; align-items:center; padding: 0 12px 0 16px;
    background: rgba(24, 24, 24, 0.85);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-family: system-ui, -apple-system, sans-serif;
    justify-content: space-between;
    gap: 12px;
  `}
`;

const LocationBar = styled.div`
  flex:1; height: 24px; border-radius: 6px; background: rgba(255,255,255,0.05);
  display:flex; align-items:center; padding: 0 12px; color:#ECEFF4; font-size:13px;
  border: 1px solid rgba(255,255,255,0.08);
  font-weight: 400;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
`;

const Actions = styled.div`
  display:flex; align-items:center; gap: 8px;
`;

const DownloadLink = styled.a`
  display:inline-flex; align-items:center; gap: 6px;
  height: 28px; padding: 0 10px; border-radius: 6px;
  color:#ECEFF4; text-decoration:none; font-size:12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  &:hover { background: rgba(255,255,255,0.1); }
  &:active { transform: translateY(1px); }
`;

const Content = styled.div<{ maximized?: boolean }>`
  height: ${({ maximized }) => maximized ? 'calc(100vh - 32px - 36px)' : 'calc(100% - 32px - 36px)'};
  overflow:hidden;
`;

const PDFContainer = styled.div`
  width: 100%; height: 100%;
  & iframe, & embed { width: 100%; height: 100%; border: 0; }
`;

// Resize handles
const Handle = styled.div<{ pos: 'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw' }>`
  position:absolute; z-index:5;
  ${({ pos }) => pos === 'n' && css`top: -2px; left: 6px; right: 6px; height: 6px; cursor: ns-resize;`}
  ${({ pos }) => pos === 's' && css`bottom: -2px; left: 6px; right: 6px; height: 6px; cursor: ns-resize;`}
  ${({ pos }) => pos === 'e' && css`top: 6px; right: -2px; bottom: 6px; width: 6px; cursor: ew-resize;`}
  ${({ pos }) => pos === 'w' && css`top: 6px; left: -2px; bottom: 6px; width: 6px; cursor: ew-resize;`}
  ${({ pos }) => pos === 'ne' && css`top: -2px; right: -2px; width: 10px; height: 10px; cursor: nesw-resize;`}
  ${({ pos }) => pos === 'nw' && css`top: -2px; left: -2px; width: 10px; height: 10px; cursor: nwse-resize;`}
  ${({ pos }) => pos === 'se' && css`bottom: -2px; right: -2px; width: 10px; height: 10px; cursor: nwse-resize;`}
  ${({ pos }) => pos === 'sw' && css`bottom: -2px; left: -2px; width: 10px; height: 10px; cursor: nesw-resize;`}
`;

const MIN_W = 520; const MIN_H = 340;
const clamp = (v:number, min:number, max:number) => Math.max(min, Math.min(max, v));

const ResumeWindow: React.FC<Props> = ({ onClose, onMinimize, isMaximized=false, onToggleMaximize, x=160, y=80, width=900, height=560, onMove, onResize, visible=true, onFocus, zIndex }) => {
  const posRef = useRef({ x, y });
  const sizeRef = useRef({ width, height });
  useEffect(() => { posRef.current = { x, y }; }, [x, y]);
  useEffect(() => { sizeRef.current = { width, height }; }, [width, height]);

  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, sx: 0, sy: 0 });
  const [isTransforming, setIsTransforming] = useState(false);
  const resizing = useRef<null | { dir: React.ComponentProps<typeof Handle>['pos']; mx: number; my: number; sx: number; sy: number; sw: number; sh: number }>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isMaximized) return;
    if (dragging.current) {
      const dx = e.clientX - dragStart.current.mx; const dy = e.clientY - dragStart.current.my;
      const ww = window.innerWidth; const wh = window.innerHeight;
      const nx = clamp(dragStart.current.sx + dx, 0, Math.max(0, ww - sizeRef.current.width));
      const ny = clamp(dragStart.current.sy + dy, 0, Math.max(0, wh - sizeRef.current.height));
      onMove && onMove(nx, ny);
    } else if (resizing.current) {
      const { dir, mx, my, sx, sy, sw, sh } = resizing.current;
      let nw = sw, nh = sh, nx = sx, ny = sy; const dx = e.clientX - mx; const dy = e.clientY - my;
      if (dir.includes('e')) nw = sw + dx; if (dir.includes('s')) nh = sh + dy;
      if (dir.includes('w')) { nw = sw - dx; nx = sx + dx; }
      if (dir.includes('n')) { nh = sh - dy; ny = sy + dy; }
      nw = Math.max(MIN_W, nw); nh = Math.max(MIN_H, nh);
      const ww = window.innerWidth; const wh = window.innerHeight;
      nx = clamp(nx, 0, Math.max(0, ww - nw)); ny = clamp(ny, 0, Math.max(0, wh - nh));
      onResize && onResize({ width: nw, height: nh, x: nx, y: ny });
    }
  }, [isMaximized, onMove, onResize]);

  const onMouseUp = useCallback(() => {
    dragging.current = false; resizing.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    const t = setTimeout(() => setIsTransforming(false), 0);
    return () => clearTimeout(t);
  }, [onMouseMove]);

  const startDrag = (e: React.MouseEvent) => {
    if (isMaximized) return;
    dragging.current = true;
    setIsTransforming(false);
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: posRef.current.x, sy: posRef.current.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResize = (dir: React.ComponentProps<typeof Handle>['pos']) => (e: React.MouseEvent) => {
    if (isMaximized) return; e.stopPropagation();
    resizing.current = { dir, mx: e.clientX, my: e.clientY, sx: posRef.current.x, sy: posRef.current.y, sw: sizeRef.current.width, sh: sizeRef.current.height };
    setIsTransforming(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const pdfUrl = "/Jihed_Kdiss_Resume.pdf"; // Ensure this file exists in public root

  return (
    <Frame x={x} y={y} width={width} height={height} maximized={isMaximized} hidden={!visible} isTransforming={!dragging.current && !resizing.current} zIndex={zIndex}>
      <TitleBar onMouseDown={(e) => { startDrag(e); onFocus && onFocus(); }}>
        <WindowTitle>Resume</WindowTitle>
        <WindowControls aria-label="Window controls">
          {onMinimize && (
            <ControlButton variant='min' title='Minimize' aria-label='Minimize' onClick={onMinimize}>
              <svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="5" width="8" height="1" rx="0.5" /></svg>
            </ControlButton>
          )}
          {onToggleMaximize && (
            <ControlButton variant='max' title='Maximize' aria-label='Maximize' onClick={onToggleMaximize}>
              <svg viewBox="0 0 10 10" aria-hidden="true"><rect x="2" y="2" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
            </ControlButton>
          )}
          <ControlButton variant='close' title='Close' aria-label='Close' onClick={onClose}>
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

      <Toolbar>
        <LocationBar>{pdfUrl}</LocationBar>
        <Actions>
          <DownloadLink href={pdfUrl} download>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Download
          </DownloadLink>
        </Actions>
      </Toolbar>

      <Content maximized={isMaximized}>
        <PDFContainer>
          <iframe src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`} title="Resume PDF" />
        </PDFContainer>
      </Content>
    </Frame>
  );
};

export default ResumeWindow;

