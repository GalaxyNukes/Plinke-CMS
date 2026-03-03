"use client";

import { Play } from "lucide-react";

export function RotatingBadge() {
  const text = "CLICK TO PLAY \u00b7 CLICK TO PLAY \u00b7 ";
  return (
    <div className="absolute top-1/2 left-[38%] -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer">
      <div className="w-28 h-28 relative">
        <svg viewBox="0 0 110 110" className="w-28 h-28 animate-spin-slow">
          <path id="badge-circle" d="M 55,55 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
          <text fill="white" fontSize="11" fontFamily="DM Sans, sans-serif" letterSpacing="3">
            <textPath href="#badge-circle">{text}</textPath>
          </text>
        </svg>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Play size={18} fill="white" color="white" />
        </div>
      </div>
    </div>
  );
}
