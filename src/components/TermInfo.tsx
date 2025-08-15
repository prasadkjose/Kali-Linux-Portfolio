import { User, WebsiteName, Wrapper } from "./styles/TerminalInfo.styled";

const TermInfo = () => {
  return (
    <Wrapper>
      <User>kali</User>@<WebsiteName>kali</WebsiteName>:~$
    </Wrapper>
  );
};

export default TermInfo;
