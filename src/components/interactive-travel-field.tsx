"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
type Route = { kind: "h"; value: number } | { kind: "v"; value: number };
type Mode = "idle" | "gather" | "disperse";

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
  rejoinedAt: number;
};

const WIDTH = 1440;
const HEIGHT = 900;
const DOT_COUNT = 24;
const IDLE_DELAY_MS = 800;
const RESUME_RAMP_MS = 1000;
const VERTICAL_SPACING = 28;
const HORIZONTAL_SPACING = 24;

const GRID_VERTICAL = Array.from(
  { length: Math.ceil((WIDTH + 96) / VERTICAL_SPACING) + 1 },
  (_, index) => -48 + index * VERTICAL_SPACING,
);
const GRID_HORIZONTAL = Array.from(
  { length: Math.ceil((HEIGHT + 96) / HORIZONTAL_SPACING) + 1 },
  (_, index) => -48 + index * HORIZONTAL_SPACING,
);

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const wrap = (value: number) => ((value % 1) + 1) % 1;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const seeded = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function buildRoutes(): Route[] {
  return [
    ...GRID_HORIZONTAL.map((value) => ({ kind: "h" as const, value })),
    ...GRID_VERTICAL.map((value) => ({ kind: "v" as const, value })),
  ];
}

function routePoint(route: Route, progress: number): Point {
  const p = wrap(progress);
  if (route.kind === "h") return { x: -50 + p * (WIDTH + 100), y: route.value };
  return { x: route.value, y: -50 + p * (HEIGHT + 100) };
}

function nearestProgress(route: Route, point: Point) {
  if (route.kind === "h") return clamp((point.x + 50) / (WIDTH + 100));
  return clamp((point.y + 50) / (HEIGHT + 100));
}

function routeSpan(route: Route) {
  return route.kind === "h" ? WIDTH + 100 : HEIGHT + 100;
}

function routeDistance(route: Route, point: Point) {
  return distance(routePoint(route, nearestProgress(route, point)), point);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
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
      rejoinedAt: 0,
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
          strokeWidth={focus ? (index % 8 === 2 ? 0.92 : 0.7) : index % 8 === 2 ? 0.82 : 0.62}
          opacity={focus ? (index % 8 === 2 ? 0.3 : 0.22) : 1}
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
          strokeWidth={focus ? (index % 8 === 1 ? 0.92 : 0.7) : index % 8 === 1 ? 0.82 : 0.62}
          opacity={focus ? (index % 8 === 1 ? 0.3 : 0.22) : 1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
}

export function InteractiveTravelField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const routes = useMemo(() => buildRoutes(), []);
  const particlesRef = useRef<Particle[]>(buildParticles(routes));
  const modeRef = useRef<Mode>("idle");
  const swarmTargetRef = useRef<Point>({ x: WIDTH * 0.5, y: HEIGHT * 0.46 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const [particles, setParticles] = useState<Point[]>(() => particlesRef.current.map((particle) => particle.position));
  const [swarmCenter, setSwarmCenter] = useState<Point>(swarmTargetRef.current);
  const [cursorScreen, setCursorScreen] = useState<Point>({ x: 0, y: 0 });
  const [mode, setMode] = useState<Mode>("idle");
  const [pointerSeen, setPointerSeen] = useState(false);
  const [overTextInput, setOverTextInput] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    reducedMotionRef.current = reducedQuery.matches;
    setReducedMotion(reducedQuery.matches);

    if (finePointerQuery.matches && !reducedQuery.matches) {
      document.documentElement.classList.add("roam-swarm-cursor");
    }

    const toFieldPoint = (point: Point) => {
      const rect = fieldRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return swarmTargetRef.current;
      const scale = Math.max(rect.width / WIDTH, rect.height / HEIGHT);
      const renderedWidth = WIDTH * scale;
      const renderedHeight = HEIGHT * scale;
      const offsetX = (rect.width - renderedWidth) / 2;
      const offsetY = (rect.height - renderedHeight) / 2;
      return {
        x: (point.x - rect.left - offsetX) / scale,
        y: (point.y - rect.top - offsetY) / scale,
      };
    };

    const beginDisperse = () => {
      if (modeRef.current !== "gather") return;
      const now = performance.now();
      const origin = { ...swarmTargetRef.current };
      const nearbyRoutes = routes
        .map((route, routeIndex) => ({ route, routeIndex, distance: routeDistance(route, origin) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 16);

      modeRef.current = "disperse";
      setMode("disperse");

      particlesRef.current.forEach((particle, index) => {
        const choice = nearbyRoutes[(index * 5 + Math.floor(seeded(index + now * 0.001 + 91) * 9)) % nearbyRoutes.length];
        const route = choice.route;
        const baseProgress = nearestProgress(route, origin);
        const outwardDirection: 1 | -1 = seeded(index + now * 0.0017 + 117) > 0.5 ? 1 : -1;
        const localTravel = 8 + seeded(index + 131) * 28;
        const targetProgress = wrap(baseProgress + (outwardDirection * localTravel) / routeSpan(route));

        particle.position = { ...origin };
        particle.scatterFrom = { ...origin };
        particle.scatterRouteIndex = choice.routeIndex;
        particle.scatterProgress = targetProgress;
        particle.scatterTo = routePoint(route, targetProgress);
        particle.scatterStartedAt = now;
        particle.scatterDelay = 20 + seeded(index + 151) * 120;
        particle.scatterDuration = 1050 + seeded(index + 171) * 500;
        particle.scatterBend = (seeded(index + 191) - 0.5) * 8;
        particle.direction = outwardDirection;
        particle.speed = 0.016 + seeded(index + now * 0.001 + 211) * 0.021;
        particle.rejoinedAt = 0;
      });
    };

    const armIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(beginDisperse, IDLE_DELAY_MS);
    };

    const onPointerMove = (event: PointerEvent) => {
      const screen = { x: event.clientX, y: event.clientY };
      const target = event.target instanceof Element ? event.target : null;
      const isText = Boolean(target?.closest("input, textarea, [contenteditable='true']"));

      setCursorScreen(screen);
      setPointerSeen(true);
      setOverTextInput(isText);

      if (reducedMotionRef.current) return;

      const mapped = toFieldPoint(screen);
      swarmTargetRef.current = mapped;
      setSwarmCenter(mapped);
      modeRef.current = "gather";
      setMode("gather");
      armIdle();
    };

    const onPointerLeave = () => {
      setOverTextInput(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      beginDisperse();
    };

    const tick = (now: number) => {
      const previous = lastFrameRef.current ?? now;
      const dt = Math.min(0.05, (now - previous) / 1000);
      lastFrameRef.current = now;
      const currentMode = modeRef.current;
      const gatherEase = 1 - Math.exp(-dt * 11.5);
      let dispersing = false;

      particlesRef.current.forEach((particle) => {
        if (currentMode === "gather") {
          particle.position = {
            x: particle.position.x + (swarmTargetRef.current.x - particle.position.x) * gatherEase,
            y: particle.position.y + (swarmTargetRef.current.y - particle.position.y) * gatherEase,
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
          if (raw < 1) {
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
            dispersing = true;
            return;
          }

          if (!particle.rejoinedAt) {
            particle.routeIndex = particle.scatterRouteIndex;
            particle.progress = particle.scatterProgress;
            particle.rejoinedAt = now;
          }

          const ramp = clamp((now - particle.rejoinedAt) / RESUME_RAMP_MS);
          const speedScale = 0.04 + easeOutCubic(ramp) * 0.96;
          particle.progress = wrap(particle.progress + particle.speed * speedScale * particle.direction * dt);
          particle.position = routePoint(routes[particle.routeIndex], particle.progress);
          if (ramp < 1) dispersing = true;
          return;
        }

        const ramp = particle.rejoinedAt ? clamp((now - particle.rejoinedAt) / RESUME_RAMP_MS) : 1;
        const speedScale = particle.rejoinedAt ? 0.04 + easeOutCubic(ramp) * 0.96 : 1;
        if (ramp >= 1) particle.rejoinedAt = 0;
        particle.progress = wrap(particle.progress + particle.speed * speedScale * particle.direction * dt);
        particle.position = routePoint(routes[particle.routeIndex], particle.progress);
      });

      if (currentMode === "disperse" && !dispersing) {
        modeRef.current = "idle";
        setMode("idle");
      }

      if (!reducedMotionRef.current) {
        setParticles(particlesRef.current.map((particle) => ({ ...particle.position })));
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

  const focusOpacity = mode === "gather" ? 1 : mode === "disperse" ? 0.28 : 0;
  const cursorOpacity = pointerSeen && !overTextInput && !reducedMotion ? 1 : 0;

  return (
    <div ref={fieldRef} className="street-field" data-state={mode} aria-hidden>
      <div className="street-field__base" />
      <div className="street-field__wash street-field__wash--sage" />
      <div className="street-field__wash street-field__wash--sand" />
      <div className="street-field__wash street-field__wash--indigo" />

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="street-field__map">
        <defs>
          <linearGradient id="oceanStreet" gradientUnits="userSpaceOnUse" x1="-260" y1="0" x2="980" y2="900">
            <stop offset="0" stopColor="#465048" stopOpacity="0.082" />
            <stop offset="0.26" stopColor="#465048" stopOpacity="0.115" />
            <stop offset="0.47" stopColor="#666f98" stopOpacity="0.17" />
            <stop offset="0.65" stopColor="#5d7769" stopOpacity="0.138" />
            <stop offset="0.84" stopColor="#465048" stopOpacity="0.098" />
            <stop offset="1" stopColor="#465048" stopOpacity="0.075" />
            {!reducedMotion && <animateTransform attributeName="gradientTransform" type="translate" values="-220 -70; 240 90; -220 -70" dur="20s" repeatCount="indefinite" />}
          </linearGradient>
          <radialGradient id="gridFocusMaskGradient" gradientUnits="userSpaceOnUse" cx={swarmCenter.x} cy={swarmCenter.y} r="112">
            <stop offset="0" stopColor="white" stopOpacity="1" />
            <stop offset="0.58" stopColor="white" stopOpacity="0.9" />
            <stop offset="0.82" stopColor="white" stopOpacity="0.48" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gridFocusMask" maskUnits="userSpaceOnUse" x="0" y="0" width={WIDTH} height={HEIGHT}>
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#gridFocusMaskGradient)" />
          </mask>
        </defs>

        <g className="street-field__base-grid"><GridLines /></g>
        <g className="street-field__focus-grid" mask="url(#gridFocusMask)" style={{ opacity: focusOpacity }}><GridLines focus /></g>
        <g className="street-field__traffic">
          {particles.map((point, index) => {
            const particle = particlesRef.current[index];
            const remaining = distance(point, swarmCenter);
            const gatherFade = mode === "gather" ? clamp((remaining - 5) / 24) : 1;
            return (
              <circle
                key={`particle-${index}`}
                cx={point.x}
                cy={point.y}
                r={particle?.radius ?? 2.25}
                fill={particle?.color ?? "rgba(49,70,59,0.74)"}
                opacity={(mode === "gather" ? 0.72 : 0.92) * gatherFade}
              />
            );
          })}
        </g>
      </svg>

      <div
        className="street-field__cursor-dot"
        style={{ left: cursorScreen.x, top: cursorScreen.y, opacity: cursorOpacity }}
      />

      <style jsx global>{`
        html.roam-swarm-cursor,
        html.roam-swarm-cursor body,
        html.roam-swarm-cursor * { cursor: none !important; }
        html.roam-swarm-cursor input,
        html.roam-swarm-cursor textarea,
        html.roam-swarm-cursor [contenteditable="true"] { cursor: text !important; }
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
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 1;
          filter: saturate(0.96);
        }
        .street-field__focus-grid {
          transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .street-field[data-state="gather"] .street-field__focus-grid {
          transition-duration: 120ms;
        }
        .street-field__cursor-dot {
          position: fixed;
          z-index: 1000;
          width: 10px;
          height: 10px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          pointer-events: none;
          background: #414996;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.72), 0 4px 14px rgba(57, 67, 60, 0.08);
          transition: opacity 120ms ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .street-field__traffic,
          .street-field__focus-grid,
          .street-field__cursor-dot { display: none; }
        }
        @media (max-width: 700px) {
          .street-field__map { opacity: 0.88; }
          .street-field__focus-grid,
          .street-field__cursor-dot { display: none; }
        }
      `}</style>
    </div>
  );
}
