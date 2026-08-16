"use client";

import { useState } from "react";

export function TravelField() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  return (
    <div
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      aria-hidden
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        setPointer({ x, y });
      }}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="routeFade" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(14,14,13,0.02)" />
            <stop offset="0.5" stopColor="rgba(14,14,13,0.14)" />
            <stop offset="1" stopColor="rgba(14,14,13,0.02)" />
          </linearGradient>
        </defs>
        <g style={{ transform: `translate(${pointer.x * 10}px, ${pointer.y * 7}px)`, transition: "transform 320ms cubic-bezier(.22,1,.36,1)" }}>
          <path className="travel-field-route travel-field-route-a" d="M-80 650 C 190 470, 300 510, 505 342 S 890 185, 1190 300 S 1440 270, 1530 180" fill="none" stroke="url(#routeFade)" strokeWidth="1.1" />
          <path className="travel-field-route travel-field-route-b" d="M-120 230 C 140 380, 340 205, 545 300 S 850 610, 1110 505 S 1380 420, 1540 590" fill="none" stroke="url(#routeFade)" strokeWidth="0.9" />
          <path className="travel-field-route travel-field-route-c" d="M120 920 C 230 690, 510 725, 665 555 S 925 290, 1045 45" fill="none" stroke="rgba(98,87,255,0.10)" strokeWidth="1" />
          <circle cx="505" cy="342" r="4" fill="rgba(14,14,13,0.18)" />
          <circle cx="1110" cy="505" r="3.5" fill="rgba(14,14,13,0.14)" />
          <circle cx="665" cy="555" r="4" fill="rgba(98,87,255,0.18)" />
        </g>
        <g style={{ transform: `translate(${pointer.x * -5}px, ${pointer.y * -4}px)`, transition: "transform 420ms cubic-bezier(.22,1,.36,1)" }}>
          <circle cx="230" cy="210" r="120" fill="rgba(255,255,255,0.16)" />
          <circle cx="1240" cy="690" r="170" fill="rgba(235,184,117,0.08)" />
        </g>
      </svg>
    </div>
  );
}
