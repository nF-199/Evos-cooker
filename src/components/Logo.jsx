import React from "react";

const sizes = {
  sm: { box: "h-9 w-9 text-base rounded-xl", title: "text-base", sub: "text-[11px]" },
  md: { box: "h-11 w-11 text-lg rounded-2xl", title: "text-lg", sub: "text-xs" },
  lg: { box: "h-14 w-14 text-2xl rounded-2xl", title: "text-2xl", sub: "text-sm" },
};

const Logo = ({ size = "md", inverted = false, subtitle = "Cooker POS" }) => {
  const s = sizes[size] ?? sizes.md;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden font-black tracking-tight shadow-lg ${
          s.box
        } ${inverted ? "shadow-primary/40" : "shadow-primary/25"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
        <span
          className="relative z-10"
          style={{ textShadow: "0 2px 8px oklch(0.4 0.04 48 / 0.4)" }}
        >
          E
        </span>
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/90 shadow" />
      </div>
      <div className="leading-tight">
        <p className={`font-extrabold tracking-tight ${s.title}`}>EVOS</p>
        <p className={`font-medium ${s.sub} ${inverted ? "text-white/55" : "text-base-content/45"}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default Logo;