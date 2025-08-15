import {
  AboutWrapper,
  HighlightAlt,
  HighlightSpan,
} from "../styles/About.styled";

const About: React.FC = () => {
  return (
    <AboutWrapper data-testid="about">
      <p>
        Hi, my name is <HighlightSpan>Jihed Kdiss</HighlightSpan>.
      </p>
      <p>
        I'm a <HighlightAlt>Junior Cyber Security Analyst</HighlightAlt> based in Tunisia.
      </p>
      <p>
        I am passionate about reverse engineering and <br />
        penetration testing. I also enjoy coding and playing CTFs.
      </p>
    </AboutWrapper>
  );
};

export default About;
