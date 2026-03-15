import React from "react";

type Props = {
  href: string;
  style: React.CSSProperties;
  value: string;
};

const DEFAULT_STYLE = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "0.92rem",
};

const Pill: React.FC<Props> = ({ href, style, value }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        ...DEFAULT_STYLE,
        ...style,
      }}
    >
      {value}
    </a>
  );
};

export default Pill;
