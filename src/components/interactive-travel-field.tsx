"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

const WIDTH = 1440;
const HEIGHT = 900;
const RADIUS = 185;
const MAX_STRENGTH = 76;

function falloff(distance: number, radius = RADIUS) {
  if (distance >= radius) return 0;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}

function bendPoint(point: Point, cursor: Point, strength: number) {
  if (strength <= 0.05) return point;

  const dx = point.x - cursor.x;
  const dy = point.y - cursor.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const influence = falloff(distance);

  if (!influence) return point;

  const safeDistance = Math.max(distance, 20);
  const nx = dx / safeDistance;
  const ny = dy / safeDistance;

  return {
    x: point.x + nx * strength * influence,
    y: point.y + ny * strength * influence * 0.7,
  };
}

function pathFromPoints(points: Point[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
}

function verticalStreet(x: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let y = -30; y <= HEIGHT + 30; y += 25) {
    const bent = bendPoint({ x, y }, cursor, strength);
    points.push({ x: bent.x, y: y + (bent.y - y) * 0.2 });
  }
  return pathFromPoints(points);
}

function horizontalStreet(y: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let x = -30; x <= WIDTH + 30; x += 29) {
    const bent = bendPoint({ x, y }, cursor, strength * 0.68);
    points.push({ x: x + (bent.x - x) * 0.58, y: bent.y });
  }
  return pathFromPoints(points);
}

function diagonalStreet(offset: number, cursor: Point, strength: number, slope = 0.28) {
  const points: Point[] = [];
  for (let x = -120; x <= WIDTH + 120; x += 34) {
    const y = x * slope + offset;
    points.push(bendPoint({ x, y }, cursor, strength * 0.54));
  }
  return pathFromPoints(points);
}

export function InteractiveTravelField() {
  const frameRef = useRef<number | null>(null);
  const desiredCursor = useRef<Point>({ x: WIDTH * 0.5, y: HEIGHT * 0.46 });
  const currentCursor = useRef<Point>(desiredCursor.current);
  const currentStrength = useRef(0);
  const targetStrength = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cursor, setCursor] = useState<Point>(currentCursor.current);
  const [strength, setStrength] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const tick = () => {
      const current = currentCursor.current;
      const desired = desiredCursor.current;

      currentCursor.current = {
        x: current.x + (desired.x - current.x) * 0.24,
        y: current.y + (desired.y - current.y) * 0.24,
      };

      currentStrength.current += (targetStrength.current - currentStrength.current) * 0.14;

      setCursor(currentCursor.current);
      setStrength(currentStrength.current);

      const cursorDelta =
        Math.abs(desired.x - currentCursor.current.x) + Math.abs(desired.y - currentCursor.current.y);
      const strengthDelta = Math.abs(targetStrength.current - currentStrength.current);

      if (cursorDelta > 0.2 || strengthDelta > 0.15) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        currentStrength.current = targetStrength.current;
        setStrength(targetStrength.current);
        frameRef.current = null;
      }
    };

    const ensureFrame = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      desiredCursor.current = {
        x: (event.clientX / window.innerWidth) * WIDTH,
        y: (event.clientY / window.innerHeight) * HEIGHT,
      };
      targetStrength.current = MAX_STRENGTH;
      setActive(true);
      ensureFrame();

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        targetStrength.current = 0;
        setActive(false);
        ensureFrame();
      }, 150);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const geometry = useMemo(() => {
    const vertical = Array.from({ length: 34 }, (_, index) => {
      const x = -16 + index * 45;
      return {
        d: verticalStreet(x, cursor, strength),
        major: index % 5 === 1,
        traffic: index % 4 === 0 || index % 7 === 2,
      };
    });

    const horizontal = Array.from({ length: 24 }, (_, index) => {
      const y = -12 + index * 41;
      return {
        d: horizontalStreet(y, cursor, strength),
        major: index % 5 === 2,
        traffic: index % 4 === 1 || index % 7 === 3,
      };
    });

    const diagonal = [
      { offset: -190, slope: 0.25 },
      { offset: 130, slope: 0.31 },
      { offset: 445, slope: 0.24 },
      { offset: 700, slope: -0.18 },
    ].map((item, index) => ({
      d: diagonalStreet(item.offset, cursor, strength, item.slope),
      major: index === 1,
      traffic: index !== 2,
    }));

    return { vertical, horizontal, diagonal };
  }, [cursor, strength]);

  const cursorPercent = {
    x: `${(cursor.x / WIDTH) * 100}%`,
    y: `${(cursor.y / HEIGHT) * 100}%`,
  };

  return (
    <div
      className="street-field"
      data-active={active ? "true" : "false"}
      style={{
        "--cursor-x": cursorPercent.x,
        "--cursor-y": cursorPercent.y,
      } as React.CSSProperties}
      aria-hidden
    >
      <div className="street-field__base" />
      <div className="street-field__wash street-field__wash--sage" />
      <div className="street-field__wash street-field__wash--sand" />
      <div className="street-field__cursor-wash" />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className="street-field__map"
      >
        <defs>
          <linearGradient id="streetInk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(20,25,20,0.045)" />
            <stop offset="0.45" stopColor="rgba(20,25,20,0.15)" />
            <stop offset="0.76" stopColor="rgba(84,108,87,0.15)" />
            <stop offset="1" stopColor="rgba(20,25,20,0.04)" />
          </linearGradient>
          <linearGradient id="streetWarm" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(197,154,101,0.025)" />
            <stop offset="0.5" stopColor="rgba(181,135,82,0.11)" />
            <stop offset="1" stopColor="rgba(20,25,20,0.04)" />
          </linearGradient>
          <linearGradient id="trafficInk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(64,91,71,0.02)" />
            <stop offset="0.5" stopColor="rgba(64,91,71,0.28)" />
            <stop offset="1" stopColor="rgba(181,135,82,0.05)" />
          </linearGradient>
          <radialGradient id="cursorHalo">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.58" stopColor="rgba(255,255,255,0.055)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g className="street-field__streets">
          {geometry.horizontal.map((street, index) => (
            <path key={`h-${index}`} d={street.d} className={street.major ? "street street--major" : "street"} stroke="url(#streetInk)" />
          ))}
          {geometry.vertical.map((street, index) => (
            <path key={`v-${index}`} d={street.d} className={street.major ? "street street--major" : "street"} stroke="url(#streetInk)" />
          ))}
          {geometry.diagonal.map((street, index) => (
            <path key={`d-${index}`} d={street.d} className={street.major ? "street street--major street--diagonal" : "street street--diagonal"} stroke="url(#streetWarm)" />
          ))}
        </g>

        <g className="street-field__traffic">
          {geometry.horizontal.map((street, index) => street.traffic && (
            <path key={`th-${index}`} d={street.d} className={`traffic traffic--h traffic--${index % 3}`} stroke="url(#trafficInk)" />
          ))}
          {geometry.vertical.map((street, index) => street.traffic && (
            <path key={`tv-${index}`} d={street.d} className={`traffic traffic--v traffic--${index % 3}`} stroke="url(#trafficInk)" />
          ))}
          {geometry.diagonal.map((street, index) => street.traffic && (
            <path key={`td-${index}`} d={street.d} className={`traffic traffic--d traffic--${index % 3}`} stroke="url(#trafficInk)" />
          ))}
        </g>

        <circle cx={cursor.x} cy={cursor.y} r="170" fill="url(#cursorHalo)" className="street-field__halo" />
      </svg>

      <style jsx>{`
        .street-field {
          --cursor-x: 50%;
          --cursor-y: 46%;
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background: #f4f2ec;
        }

        .street-field__base {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.3), rgba(244,242,236,0.05)),
            radial-gradient(circle at 50% 42%, rgba(255,255,255,0.62), rgba(255,255,255,0.02) 42%);
        }

        .street-field__wash {
          position: absolute;
          width: 54vw;
          height: 54vw;
          min-width: 560px;
          min-height: 560px;
          border-radius: 999px;
          filter: blur(26px);
          opacity: 0.72;
        }

        .street-field__wash--sage {
          left: -22vw;
          top: -30vw;
          background: radial-gradient(circle, rgba(130,168,143,0.18), rgba(130,168,143,0.05) 48%, transparent 72%);
        }

        .street-field__wash--sand {
          right: -19vw;
          bottom: -34vw;
          background: radial-gradient(circle, rgba(219,175,119,0.18), rgba(219,175,119,0.045) 48%, transparent 73%);
        }

        .street-field__cursor-wash {
          position: absolute;
          width: 360px;
          height: 360px;
          left: var(--cursor-x);
          top: var(--cursor-y);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.07) 44%, transparent 72%);
          opacity: 0;
          transition: opacity 360ms ease;
        }

        .street-field[data-active="true"] .street-field__cursor-wash { opacity: 0.9; }

        .street-field__map {
          position: absolute;
          inset: -3%;
          width: 106%;
          height: 106%;
          opacity: 0.82;
          filter: saturate(0.86);
        }

        .street {
          fill: none;
          stroke-width: 0.72;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
          opacity: 0.58;
        }

        .street--major {
          stroke-width: 1.06;
          opacity: 0.76;
        }

        .street--diagonal {
          stroke-dasharray: 2 8;
          opacity: 0.4;
        }

        .street-field[data-active="true"] .street { opacity: 0.72; }
        .street-field[data-active="true"] .street--major { opacity: 0.9; }

        .traffic {
          fill: none;
          stroke-width: 1.1;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          stroke-dasharray: 2 18 5 30;
          opacity: 0.34;
          animation: trafficFlow 22s linear infinite;
        }

        .traffic--v { animation-direction: reverse; animation-duration: 27s; }
        .traffic--d { animation-duration: 31s; opacity: 0.26; }
        .traffic--1 { animation-delay: -7s; }
        .traffic--2 { animation-delay: -14s; }

        .street-field[data-active="true"] .traffic {
          opacity: 0.18;
          animation-play-state: paused;
        }

        .street-field__halo {
          mix-blend-mode: screen;
          opacity: 0;
          transition: opacity 320ms ease;
        }

        .street-field[data-active="true"] .street-field__halo { opacity: 0.58; }

        @keyframes trafficFlow {
          to { stroke-dashoffset: -260; }
        }

        @media (prefers-reduced-motion: reduce) {
          .traffic { animation: none !important; }
          .street-field__cursor-wash,
          .street-field__halo { display: none; }
        }

        @media (max-width: 700px) {
          .street-field__map {
            inset: -14%;
            width: 128%;
            height: 128%;
            opacity: 0.58;
          }
          .street-field__cursor-wash { display: none; }
          .traffic { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
