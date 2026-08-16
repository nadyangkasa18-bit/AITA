"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Point = { x: number; y: number };
type Candidate = { point: Point; startedAt: number };
type Street = { d: string; major: boolean; traffic: boolean };

const WIDTH = 1440;
const HEIGHT = 900;
const RADIUS = 178;
const MAX_STRENGTH = 74;
const IDLE_DELAY_MS = 105;
const ACTIVATION_DISTANCE_PX = 12;
const ACTIVATION_WINDOW_MS = 110;
const ACTIVE_STEP_PX = 2.5;

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function falloff(value: number, radius = RADIUS) {
  if (value >= radius) return 0;
  const t = 1 - value / radius;
  return t * t * (3 - 2 * t);
}

function bendPoint(point: Point, cursor: Point, strength: number) {
  if (strength <= 0.05) return point;

  const dx = point.x - cursor.x;
  const dy = point.y - cursor.y;
  const d = Math.hypot(dx, dy);
  const influence = falloff(d);
  if (!influence) return point;

  const safe = Math.max(d, 20);
  return {
    x: point.x + (dx / safe) * strength * influence,
    y: point.y + (dy / safe) * strength * influence * 0.7,
  };
}

function pathFromPoints(points: Point[]) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(" ");
}

function verticalStreet(x: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let y = -30; y <= HEIGHT + 30; y += 24) {
    const bent = bendPoint({ x, y }, cursor, strength);
    points.push({ x: bent.x, y: y + (bent.y - y) * 0.2 });
  }
  return pathFromPoints(points);
}

function horizontalStreet(y: number, cursor: Point, strength: number) {
  const points: Point[] = [];
  for (let x = -30; x <= WIDTH + 30; x += 28) {
    const bent = bendPoint({ x, y }, cursor, strength * 0.68);
    points.push({ x: x + (bent.x - x) * 0.58, y: bent.y });
  }
  return pathFromPoints(points);
}

function diagonalStreet(
  offset: number,
  cursor: Point,
  strength: number,
  slope: number,
) {
  const points: Point[] = [];
  for (let x = -120; x <= WIDTH + 120; x += 32) {
    const y = x * slope + offset;
    points.push(bendPoint({ x, y }, cursor, strength * 0.54));
  }
  return pathFromPoints(points);
}

function buildGeometry(cursor: Point, strength: number) {
  const vertical: Street[] = Array.from({ length: 36 }, (_, index) => {
    const x = -18 + index * 42;
    return {
      d: verticalStreet(x, cursor, strength),
      major: index % 6 === 1,
      traffic: index % 4 === 0 || index % 7 === 2,
    };
  });

  const horizontal: Street[] = Array.from({ length: 26 }, (_, index) => {
    const y = -14 + index * 36;
    return {
      d: horizontalStreet(y, cursor, strength),
      major: index % 6 === 2,
      traffic: index % 4 === 1 || index % 7 === 3,
    };
  });

  const diagonal: Street[] = [
    { offset: -180, slope: 0.24 },
    { offset: 118, slope: 0.3 },
    { offset: 430, slope: 0.23 },
    { offset: 705, slope: -0.18 },
  ].map((item, index) => ({
    d: diagonalStreet(item.offset, cursor, strength, item.slope),
    major: index === 1,
    traffic: index !== 2,
  }));

  return { vertical, horizontal, diagonal };
}

function TrafficDot({
  path,
  index,
  axis,
}: {
  path: string;
  index: number;
  axis: "h" | "v" | "d";
}) {
  const duration =
    axis === "h"
      ? 12 + (index % 4) * 2.1
      : axis === "v"
        ? 15 + (index % 3) * 2.4
        : 18 + (index % 3) * 2.8;
  const begin = -((index * 2.7) % duration);
  const reverse = (index + (axis === "v" ? 1 : 0)) % 3 === 0;
  const fills = [
    "rgba(49,70,59,0.76)",
    "rgba(70,73,162,0.78)",
    "rgba(166,113,68,0.62)",
  ];

  return (
    <circle
      r={index % 5 === 0 ? 2.7 : 2.25}
      className="traffic-dot"
      fill={fills[index % fills.length]}
    >
      <animateMotion
        dur={`${duration}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={path}
        keyPoints={reverse ? "1;0" : "0;1"}
        keyTimes="0;1"
        calcMode="linear"
      />
    </circle>
  );
}

function Streets({
  geometry,
  variant,
}: {
  geometry: ReturnType<typeof buildGeometry>;
  variant: "base" | "deformed";
}) {
  const classPrefix = variant === "base" ? "base-street" : "deformed-street";

  return (
    <>
      {geometry.horizontal.map((street, index) => (
        <path
          key={`${variant}-h-${index}`}
          d={street.d}
          className={`${classPrefix}${street.major ? ` ${classPrefix}--major` : ""}`}
        />
      ))}
      {geometry.vertical.map((street, index) => (
        <path
          key={`${variant}-v-${index}`}
          d={street.d}
          className={`${classPrefix}${street.major ? ` ${classPrefix}--major` : ""}`}
        />
      ))}
      {geometry.diagonal.map((street, index) => (
        <path
          key={`${variant}-d-${index}`}
          d={street.d}
          className={`${classPrefix} ${classPrefix}--diagonal${street.major ? ` ${classPrefix}--major` : ""}`}
        />
      ))}
    </>
  );
}

export function InteractiveTravelField() {
  const frameRef = useRef<number | null>(null);
  const desiredCursor = useRef<Point>({ x: WIDTH * 0.5, y: HEIGHT * 0.46 });
  const currentCursor = useRef<Point>(desiredCursor.current);
  const currentStrength = useRef(0);
  const targetStrength = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const candidate = useRef<Candidate | null>(null);
  const lastMeaningfulPointer = useRef<Point | null>(null);
  const activeRef = useRef(false);

  const [cursor, setCursor] = useState<Point>(currentCursor.current);
  const [strength, setStrength] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const tick = () => {
      const current = currentCursor.current;
      const desired = desiredCursor.current;

      currentCursor.current = {
        x: current.x + (desired.x - current.x) * 0.22,
        y: current.y + (desired.y - current.y) * 0.22,
      };

      // Interaction rises quickly, but the deformed overlay takes its time
      // dissolving into the always-visible base street grid.
      const returning = targetStrength.current === 0;
      const ease = returning ? 0.025 : 0.16;
      currentStrength.current +=
        (targetStrength.current - currentStrength.current) * ease;

      setCursor(currentCursor.current);
      setStrength(currentStrength.current);

      const cursorDelta =
        Math.abs(desired.x - currentCursor.current.x) +
        Math.abs(desired.y - currentCursor.current.y);
      const strengthDelta = Math.abs(
        targetStrength.current - currentStrength.current,
      );

      if (cursorDelta > 0.08 || strengthDelta > 0.025) {
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

    const enterIdle = () => {
      activeRef.current = false;
      targetStrength.current = 0;
      candidate.current = null;
      lastMeaningfulPointer.current = null;
      setActive(false);
      ensureFrame();
    };

    const armIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(enterIdle, IDLE_DELAY_MS);
    };

    const setDesiredFromClient = (point: Point) => {
      desiredCursor.current = {
        x: (point.x / window.innerWidth) * WIDTH,
        y: (point.y / window.innerHeight) * HEIGHT,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY };
      const now = performance.now();

      if (activeRef.current) {
        const previous = lastMeaningfulPointer.current;
        if (previous && distance(point, previous) < ACTIVE_STEP_PX) return;

        lastMeaningfulPointer.current = point;
        setDesiredFromClient(point);
        targetStrength.current = MAX_STRENGTH;
        armIdle();
        ensureFrame();
        return;
      }

      const pending = candidate.current;
      if (!pending || now - pending.startedAt > ACTIVATION_WINDOW_MS) {
        candidate.current = { point, startedAt: now };
        return;
      }

      if (distance(point, pending.point) < ACTIVATION_DISTANCE_PX) return;

      activeRef.current = true;
      candidate.current = null;
      lastMeaningfulPointer.current = point;
      setDesiredFromClient(point);
      targetStrength.current = MAX_STRENGTH;
      setActive(true);
      armIdle();
      ensureFrame();
    };

    const onPointerLeave = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      enterIdle();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const baseGeometry = useMemo(
    () => buildGeometry({ x: WIDTH * 0.5, y: HEIGHT * 0.46 }, 0),
    [],
  );
  const geometry = useMemo(
    () => buildGeometry(cursor, strength),
    [cursor, strength],
  );

  const trafficPaths = [
    ...baseGeometry.horizontal
      .filter((street) => street.traffic)
      .map((street) => ({ d: street.d, axis: "h" as const })),
    ...baseGeometry.vertical
      .filter((street) => street.traffic)
      .map((street) => ({ d: street.d, axis: "v" as const })),
    ...baseGeometry.diagonal
      .filter((street) => street.traffic)
      .map((street) => ({ d: street.d, axis: "d" as const })),
  ].slice(0, 24);

  const cursorPercent = {
    x: `${(cursor.x / WIDTH) * 100}%`,
    y: `${(cursor.y / HEIGHT) * 100}%`,
  };

  // Fade the interacting layer with the same physical quantity that controls
  // deformation. The base grid stays underneath at all times, so the return
  // reads as a dissolve into the normal street network rather than a snap.
  const deformOpacity = Math.min(
    1,
    Math.pow(Math.max(strength, 0) / MAX_STRENGTH, 0.72),
  );

  return (
    <div
      className="street-field"
      data-state={active ? "active" : strength > 0.2 ? "settling" : "idle"}
      data-traffic="real-circles-v5"
      style={
        {
          "--cursor-x": cursorPercent.x,
          "--cursor-y": cursorPercent.y,
          "--deform-opacity": deformOpacity,
        } as CSSProperties
      }
      aria-hidden
    >
      <div className="street-field__base" />
      <div className="street-field__wash street-field__wash--sage" />
      <div className="street-field__wash street-field__wash--sand" />
      <div className="street-field__wash street-field__wash--indigo" />
      <div className="street-field__cursor-wash" />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className="street-field__map"
      >
        <defs>
          <radialGradient id="cursorHalo">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.58" stopColor="rgba(255,255,255,0.055)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g className="street-field__base-grid">
          <Streets geometry={baseGeometry} variant="base" />
        </g>

        <g className="street-field__deformed-grid">
          <Streets geometry={geometry} variant="deformed" />
        </g>

        <g className="street-field__traffic">
          {trafficPaths.map((item, index) => (
            <TrafficDot
              key={`traffic-${index}`}
              path={item.d}
              index={index}
              axis={item.axis}
            />
          ))}
        </g>

        <circle
          cx={cursor.x}
          cy={cursor.y}
          r="166"
          fill="url(#cursorHalo)"
          className="street-field__halo"
        />
      </svg>

      <style jsx>{`
        .street-field {
          --cursor-x: 50%;
          --cursor-y: 46%;
          --deform-opacity: 0;
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
            radial-gradient(circle at 78% 18%, rgba(79, 70, 180, 0.105) 0%, rgba(79, 70, 180, 0.045) 20%, transparent 42%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(244, 242, 236, 0.05)),
            radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.02) 42%);
        }

        .street-field__wash {
          position: absolute;
          width: 54vw;
          height: 54vw;
          min-width: 560px;
          min-height: 560px;
          border-radius: 999px;
          filter: blur(28px);
          opacity: 0.7;
        }

        .street-field__wash--sage {
          left: -22vw;
          top: -30vw;
          background: radial-gradient(circle, rgba(130, 168, 143, 0.17), rgba(130, 168, 143, 0.045) 48%, transparent 72%);
        }

        .street-field__wash--sand {
          right: -19vw;
          bottom: -34vw;
          background: radial-gradient(circle, rgba(219, 175, 119, 0.17), rgba(219, 175, 119, 0.04) 48%, transparent 73%);
        }

        .street-field__wash--indigo {
          width: 44vw;
          height: 44vw;
          right: 5vw;
          top: -8vw;
          opacity: 0.7;
          background: radial-gradient(circle, rgba(76, 67, 176, 0.125), rgba(76, 67, 176, 0.04) 48%, transparent 73%);
        }

        .street-field__cursor-wash {
          position: absolute;
          width: 350px;
          height: 350px;
          left: var(--cursor-x);
          top: var(--cursor-y);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.06) 44%, transparent 72%);
          opacity: 0;
          transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .street-field[data-state="active"] .street-field__cursor-wash {
          opacity: 0.82;
          transition-duration: 180ms;
        }

        .street-field__map {
          position: absolute;
          inset: -3%;
          width: 106%;
          height: 106%;
          opacity: 1;
          filter: saturate(0.94);
        }

        :global(.base-street),
        :global(.deformed-street) {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }

        :global(.base-street) {
          stroke: #737870;
          stroke-width: 0.82;
          stroke-opacity: 0.24;
        }

        :global(.base-street--major) {
          stroke: #676e66;
          stroke-width: 1.12;
          stroke-opacity: 0.34;
        }

        :global(.base-street--diagonal) {
          stroke: #96836f;
          stroke-dasharray: 2 8;
          stroke-opacity: 0.2;
        }

        .street-field__deformed-grid {
          opacity: var(--deform-opacity);
        }

        :global(.deformed-street) {
          stroke: #55635a;
          stroke-width: 0.86;
          stroke-opacity: 0.42;
        }

        :global(.deformed-street--major) {
          stroke: #4b5950;
          stroke-width: 1.18;
          stroke-opacity: 0.54;
        }

        :global(.deformed-street--diagonal) {
          stroke: #92765e;
          stroke-dasharray: 2 8;
          stroke-opacity: 0.34;
        }

        .street-field__traffic {
          opacity: 0.78;
          transition: opacity 760ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .street-field[data-state="active"] .street-field__traffic {
          opacity: 0.58;
          transition-duration: 180ms;
        }

        :global(.traffic-dot) {
          filter: drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.72));
        }

        .street-field__halo {
          mix-blend-mode: screen;
          opacity: 0;
          transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .street-field[data-state="active"] .street-field__halo {
          opacity: 0.5;
          transition-duration: 180ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .street-field__traffic,
          .street-field__deformed-grid {
            display: none;
          }
          .street-field__cursor-wash,
          .street-field__halo {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .street-field__map {
            inset: -14%;
            width: 128%;
            height: 128%;
            opacity: 0.86;
          }
          .street-field__cursor-wash {
            display: none;
          }
          .street-field__traffic {
            opacity: 0.58;
          }
          :global(.base-street) {
            stroke-opacity: 0.22;
          }
        }
      `}</style>
    </div>
  );
}
