import React from "react";

type Props = {
  href: string;
  style: React.CSSProperties;
  value: string;
  icon: string;
  description: string;
};

const HighlightCard: React.FC<Props> = ({
  href,
  style,
  value,
  icon,
  description,
}) => {
  return (
    <div
      style={{
        ...style,
        borderRadius: "14px",
        padding: "18px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onClick={() => window.open(href, "_blank")}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow =
          "0 14px 30px rgba(136, 192, 208, 0.18)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          gap: "10px",
        }}
      >
        <img src={icon} alt={value} width="24" height="24"></img>
        <h3 style={{ margin: 0, color: "#88C0D0", fontSize: "1.05rem" }}>
          {value}
        </h3>
      </div>
      <p style={{ margin: 0, lineHeight: 1.6, color: "#D8DEE9" }}>
        {description}
      </p>
    </div>
  );
};

export default HighlightCard;
