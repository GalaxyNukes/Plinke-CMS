"use client";

import { useState } from "react";

interface CollapsibleTextProps {
  text: string;
  wordLimit?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CollapsibleText({
  text,
  wordLimit = 20,
  className = "",
  style,
}: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);

  const words = text.trim().split(/\s+/);
  const needsTruncation = words.length > wordLimit;
  const preview = needsTruncation ? words.slice(0, wordLimit).join(" ") : text;

  if (!needsTruncation) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    );
  }

  return (
    <p className={className} style={style}>
      {expanded ? text : <>{preview}&hellip;</>}
      {" "}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="font-semibold text-xs underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap"
        style={{ color: "var(--accent-secondary)" }}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </p>
  );
}
