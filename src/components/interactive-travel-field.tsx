"use client";

import { useEffect, useRef } from "react";

export function InteractiveTravelField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    let frame = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let nextX = 0.5;
    let nextY = 0.45;

    const paint = () => {
      frame = 0;
      const x = (nextX - 0.5) * 2;
      const y = (nextY - 0.5) * 2;

      field.style.setProperty("--cursor-x", `${nextX * 100}%`);
      field.style.setProperty("--cursor-y", `${nextY * 100}%`);
      field.style.setProperty("--route-x", `${x * 18}px`);
      field.style.setProperty("--route-y", `${y * 13}px`);
      field.style.setProperty("--route-x-reverse", `${x * -12}px`);
      field.style.setProperty("--route-y-reverse", `${y * -9}px`);
      field.style.setProperty("--glow-x", `${x * 28}px`);
      field.style.setProperty("--glow-y", `${y * 22}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      nextX = Math.max(0, Math.min(1, event.clientX / window.innerWidth));
      nextY = Math.max(0, Math.min(1, event.clientY / window.innerHeight));
      field.dataset.active = "true";

      if (!frame) frame = requestAnimationFrame(paint);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        field.dataset.active = "false";
      }, 850);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div ref={fieldRef} className="travel-field" data-active="false" aria-hidden>
      <div className="travel-field__wash travel-field__wash--sage" />
      <div className="travel-field__wash travel-field__wash--sand" />
      <div className="travel-field__cursor-glow" />

      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="travel-field__routes">
        <defs>
          <linearGradient id="routeMain" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(14,14,13,0.03)" />
            <stop offset="0.42" stopColor="rgba(14,14,13,0.22)" />
            <stop offset="0.72" stopColor="rgba(98,87,255,0.18)" />
            <stop offset="1" stopColor="rgba(14,14,13,0.025)" />
          </linearGradient>
          <linearGradient id="routeWarm" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(195,143,85,0.03)" />
            <stop offset="0.5" stopColor="rgba(195,143,85,0.2)" />
            <stop offset="1" stopColor="rgba(14,14,13,0.03)" />
          </linearGradient>
          <filter id="softGlow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <g className="travel-field__layer travel-field__layer--front">
          <path className="travel-field__route travel-field__route--a" d="M-90 664 C 180 468, 334 532, 516 350 S 870 177, 1174 300 S 1442 265, 1534 154" fill="none" stroke="url(#routeMain)" strokeWidth="1.35" />
          <path className="travel-field__route travel-field__route--b" d="M-126 206 C 142 388, 337 201, 556 310 S 861 626, 1118 510 S 1386 414, 1544 596" fill="none" stroke="url(#routeWarm)" strokeWidth="1.05" />
          <circle className="travel-field__node travel-field__node--primary" cx="516" cy="350" r="5" />
          <circle className="travel-field__node" cx="1118" cy="510" r="4" />
        </g>

        <g className="travel-field__layer travel-field__layer--back">
          <path className="travel-field__route travel-field__route--c" d="M118 930 C 246 680, 494 735, 674 548 S 921 286, 1060 18" fill="none" stroke="rgba(98,87,255,0.14)" strokeWidth="1" />
          <path className="travel-field__route travel-field__route--d" d="M312 -80 C 410 145, 648 156, 731 326 S 843 678, 1098 862" fill="none" stroke="rgba(73,111,89,0.12)" strokeWidth="0.9" />
          <circle className="travel-field__node travel-field__node--violet" cx="674" cy="548" r="4.5" />
          <circle className="travel-field__node" cx="731" cy="326" r="3.5" />
        </g>

        <g className="travel-field__spark-layer">
          <circle className="travel-field__spark" cx="516" cy="350" r="18" filter="url(#softGlow)" />
          <circle className="travel-field__spark travel-field__spark--warm" cx="1118" cy="510" r="16" filter="url(#softGlow)" />
        </g>
      </svg>

      <style jsx>{`
        .travel-field {
          --cursor-x: 50%;
          --cursor-y: 45%;
          --route-x: 0px;
          --route-y: 0px;
          --route-x-reverse: 0px;
          --route-y-reverse: 0px;
          --glow-x: 0px;
          --glow-y: 0px;
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background:
            radial-gradient(circle at 50% 42%, rgba(255,255,255,0.56), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,0.22), rgba(244,242,236,0.06));
        }

        .travel-field__wash {
          position: absolute;
          border-radius: 999px;
          filter: blur(18px);
          transition: transform 500ms cubic-bezier(.22,1,.36,1), opacity 300ms ease;
        }
        .travel-field__wash--sage {
          width: 46vw;
          height: 46vw;
          min-width: 500px;
          min-height: 500px;
          left: -12vw;
          top: -20vw;
          background: radial-gradient(circle, rgba(143,181,155,0.18), rgba(143,181,155,0.05) 44%, transparent 72%);
          transform: translate(var(--glow-x), var(--glow-y));
        }
        .travel-field__wash--sand {
          width: 52vw;
          height: 52vw;
          min-width: 560px;
          min-height: 560px;
          right: -15vw;
          bottom: -28vw;
          background: radial-gradient(circle, rgba(221,177,121,0.19), rgba(221,177,121,0.045) 48%, transparent 73%);
          transform: translate(var(--route-x-reverse), var(--route-y-reverse));
        }
        .travel-field__cursor-glow {
          position: absolute;
          width: 340px;
          height: 340px;
          left: var(--cursor-x);
          top: var(--cursor-y);
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(98,87,255,0.12) 0%, rgba(98,87,255,0.045) 42%, transparent 72%);
          opacity: 0.42;
          transition: opacity 260ms ease;
        }
        .travel-field[data-active="true"] .travel-field__cursor-glow { opacity: 0.86; }

        .travel-field__routes {
          position: absolute;
          inset: -3%;
          width: 106%;
          height: 106%;
          opacity: 0.82;
        }
        .travel-field__layer {
          transition: transform 420ms cubic-bezier(.22,1,.36,1), opacity 260ms ease;
          transform-origin: center;
        }
        .travel-field__layer--front { transform: translate(var(--route-x), var(--route-y)); }
        .travel-field__layer--back { transform: translate(var(--route-x-reverse), var(--route-y-reverse)); }

        .travel-field__route {
          stroke-linecap: round;
          stroke-dasharray: 7 22;
          animation: routeDrift 15s linear infinite;
          animation-play-state: paused;
          transition: opacity 240ms ease, stroke-width 240ms ease;
          opacity: 0.62;
        }
        .travel-field__route--b { animation-duration: 18s; animation-direction: reverse; }
        .travel-field__route--c { animation-duration: 21s; }
        .travel-field__route--d { animation-duration: 24s; animation-direction: reverse; }
        .travel-field[data-active="true"] .travel-field__route {
          animation-play-state: running;
          opacity: 1;
        }

        .travel-field__node {
          fill: rgba(14,14,13,0.24);
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 260ms cubic-bezier(.22,1,.36,1), fill 260ms ease;
        }
        .travel-field__node--primary { fill: rgba(73,111,89,0.42); }
        .travel-field__node--violet { fill: rgba(98,87,255,0.34); }
        .travel-field[data-active="true"] .travel-field__node { transform: scale(1.45); }

        .travel-field__spark {
          fill: rgba(98,87,255,0.16);
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .travel-field__spark--warm { fill: rgba(221,177,121,0.2); }
        .travel-field[data-active="true"] .travel-field__spark { opacity: 0.72; }

        @keyframes routeDrift { to { stroke-dashoffset: -290; } }

        @media (prefers-reduced-motion: reduce) {
          .travel-field__route { animation: none !important; }
          .travel-field__layer,
          .travel-field__wash { transform: none !important; transition: none !important; }
          .travel-field__cursor-glow { display: none; }
          .travel-field[data-active="true"] .travel-field__node { transform: none; }
        }

        @media (max-width: 700px) {
          .travel-field__routes { inset: -12%; width: 124%; height: 124%; opacity: 0.62; }
          .travel-field__cursor-glow { width: 240px; height: 240px; }
        }
      `}</style>
    </div>
  );
}
