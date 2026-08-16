"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  scatterDelay: number;
  scatterBend: number;
};

const WIDTH = 1440;
const HEIGHT = 900;
const DOT_COUNT = 24;
const IDLE_DELAY_MS = 520;
const ACTIVATION_DISTANCE_PX = 11;
const ACTIVATION_WINDOW_MS = 135;
const ACTIVE_STEP_PX = 2.75;

const GRID_VERTICAL = Array.from({ length: 36 }, (_, index) => -18 + index * 42);
const GRID_HORIZONTAL = Array.from({ length: 26 }, (_, index) => -14 + index * 36);
const DIAGONAL_ROADS = [
  { offset: -180, slope: 0.24 },
  { offset: 118, slope: 0.3 },
  { offset: 430, slope: 0.23 },
  { offset: 705, slope: -0.18 },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const wrap = (value: number) => ((value % 1) + 1) % 1;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const seeded = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function buildRoutes(): Route[] {
  const horizontal = GRID_HORIZONTAL.map((value) => ({ kind: "h" as const, value }));
  const vertical = GRID_VERTICAL.map((value) => ({ kind: "v" as const, value }));
  const diagonal: Route[] = DIAGONAL_ROADS.map((road) => ({ kind: "d", ...road }));
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

function routeSpan(route: Route) {
  if (route.kind === "h") return WIDTH + 100;
  if (route.kind === "v") return HEIGHT + 100;
  return (WIDTH + 220) * Math.sqrt(1 + route.slope * route.slope);
}

function routeDistance(route: Route, point: Point) {
  const progress = nearestProgress(route, point);
  return distance(routePoint(route, progress), point);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function buildParticles(routes: Route[]): Particle[] {
  const colors = [
    "rgba(49,70,59,0.74)",
    "rgba(70,73,162,0.76)",
    "rgba(166,113,68,0.6)",
  ];

  return Array.from({ length: DOT_COUNT }, (_, index) => {
    const routeIndex = Math.floor(seeded(index + 7) * routes.length) % routes.length;
    const progress = seeded(index + 11);
    return {
      routeIndex,
      progress,
      direction: seeded(index + 31) > 0.48 ? 1 : -1,
      speed: 0.017 + seeded(index + 51) * 0.02,
      radius: index % 5 === 0 ? 2.8 : 2.25,
      color: colors[index % colors.length],
      position: routePoint(routes[routeIndex], progress),
      scatterFrom: { x: 0, y: 0 },
      scatterTo: { x: 0, y: 0 },
      scatterRouteIndex: routeIndex,
      scatterProgress: progress,
      scatterStartedAt: 0,
      scatterDuration: 1200,
      scatterDelay: 0,
      scatterBend: 0,
    };
  });
}

function GridLines({ focus = false }: { focus?: boolean }) {
  return (
    <>
      {GRID_HORIZONTAL.map((y, index) => (
        <line
          key={`${focus ? "focus" : "base"}-h-${index}`}
          x1={-40}
          y1={y}
          x2={WIDTH + 40}
          y2={y}
          stroke={focus ? "#303934" : "url(#oceanStreet)"}
          strokeWidth={focus ? (index % 6 === 2 ? 0.92 : 0.72) : index % 6 === 2 ? 0.8 : 0.58}
          opacity={focus ? (index % 6 === 2 ? 0.28 : 0.21) : 1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {GRID_VERTICAL.map((x, index) => (
        <line
          key={`${focus ? "focus" : "base"}-v-${index}`}
          x1={x}
          y1={-40}
          x2={x}
          y2={HEIGHT + 40}
          stroke={focus ? "#303934" : "url(#oceanStreet)"}
          strokeWidth={focus ? (index % 6 === 1 ? 0.92 : 0.72) : index % 6 === 1 ? 0.8 : 0.58}
          opacity={focus ? (index % 6 === 1 ? 0.28 : 0.21) : 1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {DIAGONAL_ROADS.map((road, index) => {
        const x1 = -100;
        const x2 = WIDTH + 100;
        return (
          <line
            key={`${focus ? "focus" : "base"}-d-${index}`}
            x1={x1}
            y1={x1 * road.slope + road.offset}
            x2={x2}
            y2={x2 * road.slope + road.offset}
            stroke={focus ? "#725b4b" : "url(#oceanWarm)"}
            strokeWidth={focus ? 0.76 : 0.62}
            opacity={focus ? 0.2 : 1}
            strokeDasharray="2 8"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </>
  );
}

export function InteractiveTravelField() {
  const routes = useMemo(() => buildRoutes(), []);
  const particlesRef = useRef<Particle[]>(buildParticles(routes));
  const modeRef = useRef<"idle" | "gather" | "disperse">("idle");
  const visualCursorRef = useRef<Point>({ x: WIDTH * 0.5, y: HEIGHT * 0.46 });
  const swarmTargetRef = useRef<Point>(visualCursorRef.current);
  const candidateRef = useRef<Candidate | null>(null);
  const lastMeaningfulPointer = useRef<Point | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const [particles, setParticles] = useState<Point[]>(() =>
    particlesRef.current.map((particle) => particle.position),
  );
  const [cursor, setCursor] = useState<Point>(visualCursorRef.current);
  const [swarmCenter, setSwarmCenter] = useState<Point>(swarmTargetRef.current);
  const [mode, setMode] = useState<"idle" | "gather" | "disperse">("idle");
  const [pointerSeen, setPointerSeen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    reducedMotionRef.current = reducedQuery.matches;
    setReducedMotion(reducedQuery.matches);

    if (finePointerQuery.matches && !reducedQuery.matches) {
      document.documentElement.classList.add("roam-swarm-cursor");
    }

    const toFieldPoint = (point: Point) => ({
      x: (point.x / window.innerWidth) * WIDTH,
      y: (point.y / window.innerHeight) * HEIGHT,
    });

    const beginDisperse = () => {
      if (modeRef.current !== "gather") return;

      const now = performance.now();
      const origin = { ...swarmTargetRef.current };
      const nearbyRoutes = routes
        .map((route, routeIndex) => ({
          route,
          routeIndex,
          distance: routeDistance(route, origin),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 18);

      modeRef.current = "disperse";
      setMode("disperse");

      particlesRef.current.forEach((particle, index) => {
        const choice = nearbyRoutes[
          (index * 5 + Math.floor(seeded(index + now * 0.001 + 91) * 7)) % nearbyRoutes.length
        ];
        const route = choice.route;
        const baseProgress = nearestProgress(route, origin);
        const outwardDirection: 1 | -1 = seeded(index + now * 0.0017 + 117) > 0.5 ? 1 : -1;
        const localTravel = 24 + seeded(index + 131) * 72;
        const targetProgress = wrap(
          baseProgress + (outwardDirection * localTravel) / routeSpan(route),
        );

        particle.position = { ...origin };
        particle.scatterFrom = { ...origin };
        particle.scatterRouteIndex = choice.routeIndex;
        particle.scatterProgress = targetProgress;
        particle.scatterTo = routePoint(route, targetProgress);
        particle.scatterStartedAt = now;
        particle.scatterDelay = seeded(index + 151) * 260;
        particle.scatterDuration = 1050 + seeded(index + 171) * 620;
        particle.scatterBend = (seeded(index + 191) - 0.5) * 18;
        particle.direction = outwardDirection;
        particle.speed = 0.016 + seeded(index + now * 0.001 + 211) * 0.021;
      });
    };

    const armIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(beginDisperse, IDLE_DELAY_MS);
    };

    const activate = (point: Point) => {
      const mapped = toFieldPoint(point);
      swarmTargetRef.current = mapped;
      visualCursorRef.current = mapped;
      setSwarmCenter(mapped);
      setCursor(mapped);
      setPointerSeen(true);
      modeRef.current = "gather";
      setMode("gather");
      lastMeaningfulPointer.current = point;
      candidateRef.current = null;
      armIdle();
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY };
      const mapped = toFieldPoint(point);
      const now = performance.now();

      visualCursorRef.current = mapped;
      setCursor(mapped);
      setPointerSeen(true);

      if (reducedMotionRef.current) return;

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
      const gatherEase = 1 - Math.exp(-dt * 8.4);
      let dispersing = false;

      particlesRef.current.forEach((particle) => {
        if (currentMode === "gather") {
          particle.position = {
            x:
              particle.position.x +
              (swarmTargetRef.current.x - particle.position.x) * gatherEase,
            y:
              particle.position.y +
              (swarmTargetRef.current.y - particle.position.y) * gatherEase,
          };
          return;
        }

        if (currentMode === "disperse") {
          const elapsed = now - particle.scatterStartedAt - particle.scatterDelay;
          if (elapsed <= 0) {
            particle.position = { ...particle.scatterFrom };
            dispersing = true;
            return;
          }

          const raw = clamp(elapsed / particle.scatterDuration);
          const eased = easeInOutCubic(raw);
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
            particle.position = routePoint(
              routes[particle.routeIndex],
              particle.progress,
            );
          }
          return;
        }

        particle.progress = wrap(
          particle.progress + particle.speed * particle.direction * dt,
        );
        particle.position = routePoint(
          routes[particle.routeIndex],
          particle.progress,
        );
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

  const focusOpacity = mode === "gather" ? 1 : mode === "disperse" ? 0.34 : 0;
  const cursorDotOpacity = pointerSeen
    ? mode === "gather"
      ? 1
      : mode === "disperse"
        ? 0.58
        : 0.38
    : 0;
  const cursorDotRadius = mode === "gather" ? 6.5 : mode === "disperse" ? 4.5 : 3;

  return (
    <div className="street-field" data-state={mode} aria-hidden>
      <div className="street-field__base" />
      <div className="street-field__wash street-field__wash--sage" />
      <div className="street-field__wash street-field__wash--sand" />
      <div className="street-field__wash street-field__wash--indigo" />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className="street-field__map"
      >
        <defs>
          <linearGradient
            id="oceanStreet"
            gradientUnits="userSpaceOnUse"
            x1="-260"
            y1="0"
            x2="980"
            y2="900"
          >
            <stop offset="0" stopColor="#465048" stopOpacity="0.06" />
            <stop offset="0.28" stopColor="#465048" stopOpacity="0.085" />
            <stop offset="0.48" stopColor="#666f98" stopOpacity="0.13" />
            <stop offset="0.65" stopColor="#5d7769" stopOpacity="0.1" />
            <stop offset="0.84" stopColor="#465048" stopOpacity="0.07" />
            <stop offset="1" stopColor="#465048" stopOpacity="0.055" />
            {!reducedMotion && (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-220 -70; 240 90; -220 -70"
                dur="20s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>

          <linearGradient
            id="oceanWarm"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="-180"
            x2="1100"
            y2="760"
          >
            <stop offset="0" stopColor="#8d755f" stopOpacity="0.045" />
            <stop offset="0.36" stopColor="#9a8067" stopOpacity="0.075" />
            <stop offset="0.58" stopColor="#7777a3" stopOpacity="0.09" />
            <stop offset="0.8" stopColor="#8d755f" stopOpacity="0.055" />
            <stop offset="1" stopColor="#8d755f" stopOpacity="0.04" />
            {!reducedMotion && (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="160 70; -180 -50; 160 70"
                dur="24s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>

          <radialGradient
            id="gridFocusMaskGradient"
            gradientUnits="userSpaceOnUse"
            cx={swarmCenter.x}
            cy={swarmCenter.y}
            r="112"
          >
            <stop offset="0" stopColor="white" stopOpacity="1" />
            <stop offset="0.58" stopColor="white" stopOpacity="0.9" />
            <stop offset="0.82" stopColor="white" stopOpacity="0.48" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <mask
            id="gridFocusMask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
          >
            <rect
              x="0"
              y="0"
              width={WIDTH}
              height={HEIGHT}
              fill="url(#gridFocusMaskGradient)"
            />
          </mask>
        </defs>

        <g className="street-field__base-grid">
          <GridLines />
        </g>

        <g
          className="street-field__focus-grid"
          mask="url(#gridFocusMask)"
          style={{ opacity: focusOpacity }}
        >
          <GridLines focus />
        </g>

        <g className="street-field__traffic">
          {particles.map((point, index) => {
            const particle = particlesRef.current[index];
            return (
              <circle
                key={`particle-${index}`}
                cx={point.x}
                cy={point.y}
                r={particle?.radius ?? 2.25}
                fill={particle?.color ?? "rgba(49,70,59,0.74)"}
                opacity={mode === "gather" ? 0.7 : 0.92}
              />
            );
          })}
        </g>
      </svg>

      <div
        className="street-field__cursor-dot"
        style={{
          left: `${(cursor.x / WIDTH) * 100}%`,
          top: `${(cursor.y / HEIGHT) * 100}%`,
          width: cursorDotRadius * 2,
          height: cursorDotRadius * 2,
          opacity: cursorDotOpacity,
        }}
      />

      <style jsx global>{`
        html.roam-swarm-cursor,
        html.roam-swarm-cursor body,
        html.roam-swarm-cursor * {
          cursor: none !important;
        }
      `}</style>

      <style jsx>{`
        .street-field {
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

        .street-field__focus-grid {
          transition: opacity 760ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .street-field[data-state="gather"] .street-field__focus-grid {
          transition-duration: 180ms;
        }

        .street-field__cursor-dot {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: #414996;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.7),
            0 4px 16px rgba(57, 67, 60, 0.1);
          transition:
            width 240ms cubic-bezier(0.22, 1, 0.36, 1),
            height 240ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .street-field__traffic,
          .street-field__focus-grid,
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

          .street-field__focus-grid,
          .street-field__cursor-dot {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
