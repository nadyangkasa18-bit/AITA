"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Point = { x: number; y: number };
type Candidate = { point: Point; startedAt: number };
type Route =
  | { kind: "h"; value: number }
  | { kind: "v"; value: number }
  | { kind: "d"; offset: number; slope: number };

type Particle = {
  routeIndex: number;
  progress: number;
  direction: 1 | -1;
  speed: number;
  radius: number;
  color: string;
  position: Point;
  scatterFrom: Point;
  scatterTo: Point;
  scatterRouteIndex: number;
  scatterProgress: number;
  scatterStartedAt: number;
  scatterDuration: number;
  scatterBend: number;
};

const WIDTH = 1440;
const HEIGHT = 900;
const DOT_COUNT = 24;
const IDLE_DELAY_MS = 125;
const ACTIVATION_DISTANCE_PX = 11;
const ACTIVATION_WINDOW_MS = 135;
const ACTIVE_STEP_PX = 2.75;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const wrap = (value: number) => ((value % 1) + 1) % 1;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const seeded = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function buildRoutes(): Route[] {
  const horizontal = Array.from({ length: 11 }, (_, index) => ({
    kind: "h" as const,
    value: 48 + index * 76,
  }));
  const vertical = Array.from({ length: 10 }, (_, index) => ({
    kind: "v" as const,
    value: 62 + index * 142,
  }));
  const diagonal: Route[] = [
    { kind: "d", offset: 110, slope: 0.22 },
    { kind: "d", offset: 410, slope: 0.26 },
    { kind: "d", offset: 705, slope: -0.16 },
  ];

  return [...horizontal, ...vertical, ...diagonal];
}

function routePoint(route: Route, progress: number): Point {
  const p = wrap(progress);
  if (route.kind === "h") {
    return { x: -50 + p * (WIDTH + 100), y: route.value };
  }
  if (route.kind === "v") {
    return { x: route.value, y: -50 + p * (HEIGHT + 100) };
  }

  const x = -110 + p * (WIDTH + 220);
  return { x, y: x * route.slope + route.offset };
}

function nearestProgress(route: Route, point: Point) {
  if (route.kind === "h") return clamp((point.x + 50) / (WIDTH + 100));
  if (route.kind === "v") return clamp((point.y + 50) / (HEIGHT + 100));
  return clamp((point.x + 110) / (WIDTH + 220));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function buildParticles(routes: Route[]): Particle[] {
  const colors = [
    "rgba(49,70,59,0.76)",
    "rgba(70,73,162,0.78)",
    "rgba(166,113,68,0.62)",
  ];

  return Array.from({ length: DOT_COUNT }, (_, index) => {
    const routeIndex = index % routes.length;
    const progress = seeded(index + 11);
    return {
      routeIndex,
      progress,
      direction: seeded(index + 31) > 0.42 ? 1 : -1,
      speed: 0.018 + seeded(index + 51) * 0.021,
      radius: index % 5 === 0 ? 2.8 : 2.25,
      color: colors[index % colors.length],
      position: routePoint(routes[routeIndex], progress),
      scatterFrom: { x: 0, y: 0 },
      scatterTo: { x: 0, y: 0 },
      scatterRouteIndex: routeIndex,
      scatterProgress: progress,
      scatterStartedAt: 0,
      scatterDuration: 1000,
      scatterBend: 0,
    };
  });
}

export function InteractiveTravelField() {
  const routes = useMemo(() => buildRoutes(), []);
  const particlesRef = useRef<Particle[]>(buildParticles(routes));
  const modeRef = useRef<"idle" | "gather" | "disperse">("idle");
  const pointerRef = useRef<Point>({ x: WIDTH * 0.5, y: HEIGHT * 0.46 });
  const candidateRef = useRef<Candidate | null>(null);
  const lastMeaningfulPointer = useRef<Point | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const [particles, setParticles] = useState<Point[]>(() =>
    particlesRef.current.map((particle) => particle.position),
  );
  const [cursor, setCursor] = useState<Point>(pointerRef.current);
  const [mode, setMode] = useState<"idle" | "gather" | "disperse">("idle");
  const [pointerSeen, setPointerSeen] = useState(false);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    reducedMotionRef.current = reducedQuery.matches;

    if (finePointerQuery.matches && !reducedQuery.matches) {
      document.documentElement.classList.add("roam-swarm-cursor");
    }

    const beginDisperse = () => {
      if (modeRef.current !== "gather") return;

      const now = performance.now();
      modeRef.current = "disperse";
      setMode("disperse");

      particlesRef.current.forEach((particle, index) => {
        const routeIndex = Math.floor(seeded(index + now * 0.001 + 91) * routes.length) % routes.length;
        const route = routes[routeIndex];
        const baseProgress = nearestProgress(route, pointerRef.current);
        const jitter = (seeded(index + now * 0.002 + 123) - 0.5) * 0.22;
        const targetProgress = wrap(baseProgress + jitter);

        particle.scatterFrom = { ...particle.position };
        particle.scatterRouteIndex = routeIndex;
        particle.scatterProgress = targetProgress;
        particle.scatterTo = routePoint(route, targetProgress);
        particle.scatterStartedAt = now;
        particle.scatterDuration = 950 + seeded(index + 151) * 520;
        particle.scatterBend = (seeded(index + 171) - 0.5) * 58;
      });
    };

    const armIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(beginDisperse, IDLE_DELAY_MS);
    };

    const activate = (point: Point) => {
      pointerRef.current = {
        x: (point.x / window.innerWidth) * WIDTH,
        y: (point.y / window.innerHeight) * HEIGHT,
      };
      setCursor(pointerRef.current);
      setPointerSeen(true);
      modeRef.current = "gather";
      setMode("gather");
      lastMeaningfulPointer.current = point;
      candidateRef.current = null;
      armIdle();
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY };
      const now = performance.now();
      setPointerSeen(true);

      if (reducedMotionRef.current) {
        pointerRef.current = {
          x: (point.x / window.innerWidth) * WIDTH,
          y: (point.y / window.innerHeight) * HEIGHT,
        };
        setCursor(pointerRef.current);
        return;
      }

      if (modeRef.current === "gather") {
        const previous = lastMeaningfulPointer.current;
        if (previous && distance(point, previous) < ACTIVE_STEP_PX) return;
        activate(point);
        return;
      }

      const pending = candidateRef.current;
      if (!pending || now - pending.startedAt > ACTIVATION_WINDOW_MS) {
        candidateRef.current = { point, startedAt: now };
        return;
      }

      if (distance(point, pending.point) < ACTIVATION_DISTANCE_PX) return;
      activate(point);
    };

    const onPointerLeave = () => {
      candidateRef.current = null;
      lastMeaningfulPointer.current = null;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      beginDisperse();
    };

    const tick = (now: number) => {
      const previous = lastFrameRef.current ?? now;
      const dt = Math.min(0.05, (now - previous) / 1000);
      lastFrameRef.current = now;
      const currentMode = modeRef.current;
      const gatherEase = 1 - Math.exp(-dt * 8.2);
      let dispersing = false;

      particlesRef.current.forEach((particle) => {
        if (currentMode === "gather") {
          particle.position = {
            x: particle.position.x + (pointerRef.current.x - particle.position.x) * gatherEase,
            y: particle.position.y + (pointerRef.current.y - particle.position.y) * gatherEase,
          };
          return;
        }

        if (currentMode === "disperse") {
          const raw = clamp((now - particle.scatterStartedAt) / particle.scatterDuration);
          const eased = easeOutCubic(raw);
          const from = particle.scatterFrom;
          const to = particle.scatterTo;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.max(1, Math.hypot(dx, dy));
          const nx = -dy / length;
          const ny = dx / length;
          const arc = Math.sin(Math.PI * raw) * particle.scatterBend;

          particle.position = {
            x: from.x + dx * eased + nx * arc,
            y: from.y + dy * eased + ny * arc,
          };

          if (raw < 1) {
            dispersing = true;
          } else {
            particle.routeIndex = particle.scatterRouteIndex;
            particle.progress = particle.scatterProgress;
            particle.position = routePoint(routes[particle.routeIndex], particle.progress);
          }
          return;
        }

        particle.progress = wrap(
          particle.progress + particle.speed * particle.direction * dt,
        );
        particle.position = routePoint(routes[particle.routeIndex], particle.progress);
      });

      if (currentMode === "disperse" && !dispersing) {
        modeRef.current = "idle";
        setMode("idle");
      }

      if (!reducedMotionRef.current) {
        setParticles(
          particlesRef.current.map((particle) => ({ ...particle.position })),
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("roam-swarm-cursor");
    };
  }, [routes]);

  const cursorPercent = {
    x: `${(cursor.x / WIDTH) * 100}%`,
    y: `${(cursor.y / HEIGHT) * 100}%`,
  };

  const baseVertical = Array.from({ length: 36 }, (_, index) => -18 + index * 42);
  const baseHorizontal = Array.from({ length: 26 }, (_, index) => -14 + index * 36);
  const diagonalRoads = [
    { offset: -180, slope: 0.24 },
    { offset: 118, slope: 0.3 },
    { offset: 430, slope: 0.23 },
    { offset: 705, slope: -0.18 },
  ];

  const focusOpacity = mode === "gather" ? 1 : mode === "disperse" ? 0.45 : 0;
  const cursorDotOpacity = pointerSeen ? (mode === "gather" ? 1 : mode === "disperse" ? 0.55 : 0.32) : 0;
  const cursorDotRadius = mode === "gather" ? 6.5 : mode === "disperse" ? 4.2 : 2.8;

  return (
    <div
      className="street-field"
      data-state={mode}
      style={
        {
          "--cursor-x": cursorPercent.x,
          "--cursor-y": cursorPercent.y,
          "--focus-opacity": focusOpacity,
          "--cursor-dot-opacity": cursorDotOpacity,
          "--cursor-dot-radius": `${cursorDotRadius}px`,
        } as CSSProperties
      }
      aria-hidden
    >
      <div className="street-field__base" />
      <div className="street-field__wash street-field__wash--sage" />
      <div className="street-field__wash street-field__wash--sand" />
      <div className="street-field__wash street-field__wash--indigo" />
      <div className="street-field__focus" />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className="street-field__map"
      >
        <g>
          {baseHorizontal.map((y, index) => (
            <line
              key={`h-${index}`}
              x1={-40}
              y1={y}
              x2={WIDTH + 40}
              y2={y}
              stroke="#465048"
              strokeWidth={index % 6 === 2 ? 0.82 : 0.62}
              opacity={index % 6 === 2 ? 0.145 : 0.105}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {baseVertical.map((x, index) => (
            <line
              key={`v-${index}`}
              x1={x}
              y1={-40}
              x2={x}
              y2={HEIGHT + 40}
              stroke="#465048"
              strokeWidth={index % 6 === 1 ? 0.82 : 0.62}
              opacity={index % 6 === 1 ? 0.145 : 0.105}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {diagonalRoads.map((road, index) => {
            const x1 = -100;
            const x2 = WIDTH + 100;
            return (
              <line
                key={`d-${index}`}
                x1={x1}
                y1={x1 * road.slope + road.offset}
                x2={x2}
                y2={x2 * road.slope + road.offset}
                stroke="#8f735a"
                strokeWidth={0.68}
                opacity={0.09}
                strokeDasharray="2 8"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>

        <g>
          {particles.map((point, index) => {
            const particle = particlesRef.current[index];
            return (
              <circle
                key={`particle-${index}`}
                cx={point.x}
                cy={point.y}
                r={particle?.radius ?? 2.25}
                fill={particle?.color ?? "rgba(49,70,59,0.76)"}
                opacity={mode === "gather" ? 0.72 : 0.92}
              />
            );
          })}
        </g>
      </svg>

      <div className="street-field__cursor-dot" />

      <style jsx global>{`
        html.roam-swarm-cursor,
        html.roam-swarm-cursor body,
        html.roam-swarm-cursor * {
          cursor: none !important;
        }
      `}</style>

      <style jsx>{`
        .street-field {
          --cursor-x: 50%;
          --cursor-y: 46%;
          --focus-opacity: 0;
          --cursor-dot-opacity: 0;
          --cursor-dot-radius: 3px;
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
            radial-gradient(circle at 78% 18%, rgba(79, 70, 180, 0.1) 0%, rgba(79, 70, 180, 0.04) 20%, transparent 42%),
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

        .street-field__map {
          position: absolute;
          inset: -3%;
          width: 106%;
          height: 106%;
          opacity: 0.98;
          filter: saturate(0.94);
        }

        .street-field__focus {
          position: absolute;
          width: 220px;
          height: 220px;
          left: var(--cursor-x);
          top: var(--cursor-y);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(24, 28, 25, 0.17) 0%, rgba(24, 28, 25, 0.09) 38%, rgba(24, 28, 25, 0.025) 58%, transparent 72%);
          mix-blend-mode: multiply;
          opacity: var(--focus-opacity);
          transition: opacity 680ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .street-field[data-state="gather"] .street-field__focus {
          transition-duration: 180ms;
        }

        .street-field__cursor-dot {
          position: absolute;
          left: var(--cursor-x);
          top: var(--cursor-y);
          width: calc(var(--cursor-dot-radius) * 2);
          height: calc(var(--cursor-dot-radius) * 2);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: #414996;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.72),
            0 4px 18px rgba(57, 67, 60, 0.12);
          opacity: var(--cursor-dot-opacity);
          transition:
            width 220ms cubic-bezier(0.22, 1, 0.36, 1),
            height 220ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .street-field__focus,
          .street-field__cursor-dot {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .street-field__map {
            inset: -14%;
            width: 128%;
            height: 128%;
            opacity: 0.72;
          }
          .street-field__focus,
          .street-field__cursor-dot {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
