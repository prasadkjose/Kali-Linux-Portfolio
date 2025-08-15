import React from "react";
import styled from "styled-components";
import DesktopShortcut, { Icons } from "./DesktopShortcut";

type Props = {
  onOpenTerminal: () => void;
  onOpenWelcome: () => void;
  onOpenResume: () => void;
  hidden?: boolean;
  activeTerminal?: boolean;
  activeBrowser?: boolean;
  activeResume?: boolean;
  mobileExpanded?: boolean;
};

const Grid = styled.div<{ hidden?: boolean; mobileExpanded?: boolean }>`
  position: fixed;
  display: grid;
  z-index: 10; /* below windows */
  ${({ hidden }) => hidden && 'display:none;'}

  ${({ mobileExpanded }) => mobileExpanded ? `
    top: 12px; left: 12px; right: 12px; bottom: 12px;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    grid-auto-rows: max-content;
    gap: 20px;
    justify-items: center;
    align-content: start;
    overflow: auto;
  ` : `
    top: 24px; left: 24px;
    grid-template-columns: repeat(1, max-content);
    grid-auto-rows: max-content;
    gap: 18px;
  `}
`;

const DesktopShortcuts: React.FC<Props> = ({ onOpenTerminal, onOpenWelcome, onOpenResume, hidden, activeTerminal, activeBrowser, activeResume, mobileExpanded }) => {
  return (
    <Grid hidden={hidden} mobileExpanded={mobileExpanded}>
      <DesktopShortcut label="Browser" onOpen={onOpenWelcome} icon={Icons.Browser} active={activeBrowser} />
      <DesktopShortcut label="Terminal" onOpen={onOpenTerminal} icon={Icons.Terminal} active={activeTerminal} />
      <DesktopShortcut label="LinkedIn" href="https://www.linkedin.com/in/jihedkdiss" icon={Icons.LinkedIn} />
      <DesktopShortcut label="GitHub" href="https://github.com/jihedkdiss" icon={Icons.GitHub} />
      <DesktopShortcut label="Facebook" href="https://facebook.com/0xjio" icon={Icons.Facebook} />
      <DesktopShortcut label="Blog" href="https://blog.jihedkdiss.tn/" icon={Icons.Blog} />
      <DesktopShortcut label="Resume" onOpen={onOpenResume} icon={Icons.PDF} active={activeResume} />
    </Grid>
  );
};

export default DesktopShortcuts;

