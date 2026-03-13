import { useContext } from "react";
import _ from "lodash";
import { Wrapper } from "../styles/Output.styled";
import { termContext } from "../Terminal";

const History: React.FC = () => {
  const { history, index, executeCommand } = useContext(termContext);
  const currentHistory = _.reverse(_.slice(history, index));

  const handleHistoryClick = (cmd: string) => {
    if (executeCommand) {
      executeCommand(cmd);
    }
  };

  return (
    <Wrapper data-testid="history">
      {currentHistory.map(cmd => (
        <div
          key={_.uniqueId(`${cmd}_`)}
          onClick={() => handleHistoryClick(cmd)}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "inherit",
          }}
        >
          {cmd}
        </div>
      ))}
    </Wrapper>
  );
};

export default History;
