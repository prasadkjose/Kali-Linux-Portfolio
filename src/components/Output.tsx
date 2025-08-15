import About from "./commands/About";
import Clear from "./commands/Clear";
import Echo from "./commands/Echo";
import Education from "./commands/Education";
import Email from "./commands/Email";
import GeneralOutput from "./commands/GeneralOutput";
import Resume from "./commands/Resume";
import Help from "./commands/Help";
import Welcome from "./commands/Welcome";
import History from "./commands/History";
import Projects from "./commands/Projects";
import Socials from "./commands/Socials";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { hiddenCommands, termContext } from "./Terminal";
import { useContext } from "react";

type Props = {
  index: number;
  cmd: string;
};

const Output: React.FC<Props> = ({ index, cmd }) => {
  const { arg } = useContext(termContext);

  const specialCmds = ["projects", "socials", "echo"];

  // return 'Usage: <cmd>' if command arg is not valid
  // eg: about tt
  if (!specialCmds.includes(cmd) && arg.length > 0)
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;

  // hidden easter eggs
  if (cmd === 'sudo') {
    const full = ['sudo', ...arg].join(' ');
    return (
      <OutputContainer>
        <GeneralOutput>{full}: command not found</GeneralOutput>
        <GeneralOutput>Hint: sudo: unable to resolve host kali: Name or service not known</GeneralOutput>
        <GeneralOutput>Hint: you are already root</GeneralOutput>
      </OutputContainer>
    );
  }
  if (cmd === 'neofetch') {
    return (
      <OutputContainer>
        <GeneralOutput>{`kali 2024.2 \n Kernel: 6.5.0-kali1-amd64 \n Shell: bash 5.2.15 \n Resolution: 1920x1080 \n DE: XFCE \n WM: Xfwm4 \n CPU: Intel i7-9750H (12) @ 4.5GHz \n Memory: 2.1GiB / 16GiB`}</GeneralOutput>
      </OutputContainer>
    );
  }
  if (cmd === 'uname') {
    return (
      <OutputContainer>
        <GeneralOutput>Linux</GeneralOutput>
      </OutputContainer>
    );
  }
  if (cmd === 'ls') {
    return (
      <OutputContainer>
        <GeneralOutput>Desktop Documents Downloads Music Pictures Public Templates Videos</GeneralOutput>
      </OutputContainer>
    );
  }

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : null}>
      {
        {
          about: <About />,
          clear: <Clear />,
          echo: <Echo />,
          education: <Education />,
          email: <Email />,
          resume: <Resume />,
          help: <Help />,
          history: <History />,
          projects: <Projects />,
          pwd: <GeneralOutput>/home/jihedkdiss</GeneralOutput>,
          socials: <Socials />,
          welcome: <Welcome />,
          whoami: <GeneralOutput>kali</GeneralOutput>,
        }[cmd]
      }
    </OutputContainer>
  );
};

export default Output;
