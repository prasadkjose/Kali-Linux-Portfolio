import { Wrapper } from "../styles/Output.styled";

type Props = {
  children: React.ReactNode;
};

const GeneralOutput: React.FC<Props> = ({ children }) => (
  <Wrapper>{children}</Wrapper>
);
export default GeneralOutput;
