"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

const WIDTH = 1440;
const HEIGHT = 900;
const RADIUS = 220;

function falloff(distance: number, radius = RADIUS) {
  if (distance >= radius) return 0;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}

function bendPoint(point: Point, cursor: Point, strength = 72) {
  const dx = point.x - cursor.x;
  const dy = point.y - cursor.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const influence = falloff(distance);

  if (!influence) return point;

  const safeDistance = Math.max(distance, 24);
  const nx = dx / safeDistance;
  const ny = dy / safeDistance;

  return {
    x: point.x + nx * strength * influence,
    y: point.y + ny * strength * influence * 0.72,
  };
}

function pathFromPoints(points: Point[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
}

function verticalStreet(x: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let y = -40; y <= HEIGHT + 40; y += 34) {
    const bent = bendPoint({ x, y }, cursor, strength);
    // A vertical street behaves slightly more like a hanging strand: most of
    // the cursor energy moves it sideways, while still keeping a soft map feel.
    points.push({ x: bent.x, y: y + (bent.y - y) * 0.28 });
  }
  return pathFromPoints(points);
}

function horizontalStreet(y: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let x = -40; x <= WIDTH + 40; x += 38) {
    const bent = bendPoint({ x, y }, cursor, strength * 0.72);
    points.push({ x: x + (bent.x - x) * 0.62, y: bent.y });
  }
  return pathFromPoints(points);
}

function diagonalStreet(offset: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let x = -120; x <= WIDTH + 120; x += 42) {
    const y = x * 0.34 + offset;
    points.push(bendPoint({ x, y }, cursor, strength * 0.62));
  }
  return pathFromPoints(points);
}

export function InteractiveTravelField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const nextPointer = useRef<Point>({ x: WIDTH * 0.5, y: HEIGHT * 0.46 });
  const [cursor, setCursor] = useState<Point>(nextPointer.current);
  const [active, setActive] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      setCursor(nextPointer.current);
    };

    const onPointerMove = (event: PointerEvent) => {
      nextPointer.current = {
        x: (event.clientX / window.innerWidth) * WIDTH,
        y: (event.clientY / window.innerHeight) * HEIGHT,
      };
      setActive(true);

      if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setActive(false), 900);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const geometry = useMemo(() => {
    const strength = active ? 78 : 58;

    const vertical = Array.from({ length: 24 }, (_, index) => {
      const x = 32 + index * 61;
      return {
        d: verticalStreet(x, cursor, strength),
        major: index % 4 === 0,
      };
    });

    const horizontal = Array.from({ length: 17 }, (_, index) => {
      const y = 18 + index * 57;
      return {
        d: horizontalStreet(y, cursor, strength),
        major: index % 4 === 1,
      };
    });

    const diagonal = [-210, 190, 585].map((offset, index) => ({
      d: diagonalStreet(offset, cursor, strength),
      major: index === 1,
    }));

    return { vertical, horizontal, diagonal };
  }, [cursor, active]);

  const cursorPercent = {
    x: `${(cursor.x / WIDTH) * 100}%`,
    y: `${(cursor.y / HEIGHT) * 100}%`,
  };

  return (
    <div
      ref={fieldRef}
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
            <stop offset="0" stopColor="rgba(20,25,20,0.06)" />
            <stop offset="0.45" stopColor="rgba(20,25,20,0.19)" />
            <stop offset="0.76" stopColor="rgba(84,108,87,0.18)" />
            <stop offset="1" stopColor="rgba(20,25,20,0.055)" />
          </linearGradient>
          <linearGradient id="streetWarm" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(197,154,101,0.035)" />
            <stop offset="0.5" stopColor="rgba(181,135,82,0.14)" />
            <stop offset="1" stopColor="rgba(20,25,20,0.05)" />
          </linearGradient>
          <radialGradient id="cursorHalo">
            <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="0.58" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g className="street-field__streets street-field__streets--horizontal">
          {geometry.horizontal.map((street, index) => (
            <path
              key={`h-${index}`}
              d={street.d}
              className={street.major ? "street street--major" : "street"}
              stroke="url(#streetInk)"
            />
          ))}
        </g>

        <g className="street-field__streets street-field__streets--vertical">
          {geometry.vertical.map((street, index) => (
            <path
              key={`v-${index}`}
              d={street.d}
              className={street.major ? "street street--major" : "street"}
              stroke="url(#streetInk)"
            />
          ))}
        </g>

        <g className="street-field__streets street-field__streets--diagonal">
          {geometry.diagonal.map((street, index) => (
            <path
              key={`d-${index}`}
              d={street.d}
              className={street.major ? "street street--major street--diagonal" : "street street--diagonal"}
              stroke="url(#streetWarm)"
            />
          ))}
        </g>

        <circle cx={cursor.x} cy={cursor.y} r="190" fill="url(#cursorHalo)" className="street-field__halo" />
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
            radial-gradient(circle at 50% 42%, rgba(255,255,255,0.64), rgba(255,255,255,0.02) 42%);
        }

        .street-field__wash {
          position: absolute;
          width: 54vw;
          height: 54vw;
          min-width: 560px;
          min-height: 560px;
          border-radius: 999px;
          filter: blur(26px);
          opacity: 0.76;
        }

        .street-field__wash--sage {
          left: -22vw;
          top: -30vw;
          background: radial-gradient(circle, rgba(130,168,143,0.20), rgba(130,168,143,0.055) 48%, transparent 72%);
        }

        .street-field__wash--sand {
          right: -19vw;
          bottom: -34vw;
          background: radial-gradient(circle, rgba(219,175,119,0.20), rgba(219,175,119,0.05) 48%, transparent 73%);
        }

        .street-field__cursor-wash {
          position: absolute;
          width: 430px;
          height: 430px;
          left: var(--cursor-x);
          top: var(--cursor-y);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.27), rgba(255,255,255,0.09) 44%, transparent 72%);
          opacity: 0.72;
          transition: opacity 220ms ease;
        }

        .street-field[data-active="true"] .street-field__cursor-wash { opacity: 1; }

        .street-field__map {
          position: absolute;
          inset: -4%;
          width: 108%;
          height: 108%;
          opacity: 0.86;
          filter: saturate(0.88);
        }

        .street {
          fill: none;
          stroke-width: 0.92;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
          opacity: 0.68;
        }

        .street--major {
          stroke-width: 1.38;
          opacity: 0.86;
        }

        .street--diagonal {
          stroke-dasharray: 2 7;
          opacity: 0.48;
        }

        .street-field[data-active="true"] .street {
          opacity: 0.83;
        }

        .street-field[data-active="true"] .street--major {
          opacity: 1;
        }

        .street-field__halo {
          mix-blend-mode: screen;
          opacity: 0.64;
        }

        @media (prefers-reduced-motion: reduce) {
          .street-field__cursor-wash,
          .street-field__halo { display: none; }
        }

        @media (max-width: 700px) {
          .street-field__map {
            inset: -18%;
            width: 136%;
            height: 136%;
            opacity: 0.64;
          }
          .street-field__cursor-wash { display: none; }
        }
      `}</style>
    </div>
  );
}
