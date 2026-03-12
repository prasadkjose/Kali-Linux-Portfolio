import {
  Cmd,
  CmdDesc,
  CmdList,
  HelpWrapper,
  KeyContainer,
} from "../styles/Help.styled";
import { commands, termContext } from "../Terminal";
import { generateTabs } from "../../utils/funcs";
import { useContext } from "react";

const Help: React.FC = () => {
  const { executeCommand } = useContext(termContext);

  const handleCommandClick = (cmd: string) => {
    if (executeCommand) {
      executeCommand(cmd);
    }
  };

  return (
    <HelpWrapper data-testid="help">
      {commands.map(({ cmd, desc, tab }) => (
        <CmdList key={cmd}>
          <Cmd
            onClick={() => handleCommandClick(cmd)}
            style={{ cursor: "pointer" }}
          >
            {cmd}
          </Cmd>
          {generateTabs(tab)}
          <CmdDesc>- {desc}</CmdDesc>
        </CmdList>
      ))}
      <KeyContainer>
        <div>Tab or Ctrl + i&nbsp; =&gt; autocompletes the command</div>
        <div>Up Arrow {generateTabs(5)} =&gt; go back to previous command</div>
        <div>Ctrl + l {generateTabs(5)} =&gt; clear the terminal</div>
        <div>Click on any command above to execute it</div>
      </KeyContainer>
    </HelpWrapper>
  );
};

export default Help;
