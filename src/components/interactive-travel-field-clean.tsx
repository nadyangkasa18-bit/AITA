"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
type Route = { kind: "h" | "v"; value: number };
type Mode = "idle" | "gather" | "disperse";

type Particle = {
  routeIndex: number;
  progress: number;
  direction: 1 | -1;
  speed: number;
  radius: number;
  color: string;
  position: Point;
  from: Point;
  to: Point;
  targetRoute: number;
  targetProgress: number;
  startedAt: number;
  delay: number;
  duration: number;
};

const WIDTH = 1440;
const HEIGHT = 900;
const GRID = 28;
const DOT_COUNT = 28;
const IDLE_DELAY = 760;
const RESUME_RAMP = 900;

const VERTICAL = Array.from({ length: Math.ceil(WIDTH / GRID) + 3 }, (_, index) => -GRID + index * GRID);
const HORIZONTAL = Array.from({ length: Math.ceil(HEIGHT / GRID) + 3 }, (_, index) => -GRID + index * GRID);

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const wrap = (value: number) => ((value % 1) + 1) % 1;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const seeded = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function routes(): Route[] {
  return [
    ...HORIZONTAL.map((value) => ({ kind: "h" as const, value })),
    ...VERTICAL.map((value) => ({ kind: "v" as const, value })),
  ];
}

function routePoint(route: Route, progress: number): Point {
  const p = wrap(progress);
  return route.kind === "h" ? { x: p * WIDTH, y: route.value } : { x: route.value, y: p * HEIGHT };
}

function nearestProgress(route: Route, point: Point) {
  return route.kind === "h" ? clamp(point.x / WIDTH) : clamp(point.y / HEIGHT);
}

function routeDistance(route: Route, point: Point) {
  return distance(routePoint(route, nearestProgress(route, point)), point);
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function particlesFor(routeList: Route[]): Particle[] {
  const colors = ["rgba(49,70,59,.74)", "rgba(70,73,162,.78)", "rgba(166,113,68,.62)"];
  return Array.from({ length: DOT_COUNT }, (_, index) => {
    const routeIndex = Math.floor(seeded(index + 11) * routeList.length) % routeList.length;
    const progress = seeded(index + 29);
    const position = routePoint(routeList[routeIndex], progress);
    return {
      routeIndex,
      progress,
      direction: seeded(index + 41) > .5 ? 1 : -1,
      speed: .017 + seeded(index + 57) * .021,
      radius: index % 5 === 0 ? 2.9 : 2.25,
      color: colors[index % colors.length],
      position,
      from: position,
      to: position,
      targetRoute: routeIndex,
      targetProgress: progress,
      startedAt: 0,
      delay: 0,
      duration: 1000,
    };
  });
}

export function InteractiveTravelFieldClean() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const routeList = useMemo(routes, []);
  const particlesRef = useRef<Particle[]>(particlesFor(routeList));
  const modeRef = useRef<Mode>("idle");
  const targetRef = useRef<Point>({ x: WIDTH / 2, y: HEIGHT / 2 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrame = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const finePointer = useRef(false);
  const rejoinedAt = useRef(0);

  const [mode, setMode] = useState<Mode>("idle");
  const [points, setPoints] = useState<Point[]>(() => particlesRef.current.map((particle) => particle.position));
  const [cursor, setCursor] = useState<Point>({ x: 0, y: 0 });
  const [focusLocal, setFocusLocal] = useState<Point>({ x: 0, y: 0 });
  const [pointerSeen, setPointerSeen] = useState(false);
  const [overText, setOverText] = useState(false);

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineQuery = window.matchMedia("(pointer: fine)");
    reducedMotion.current = reduceQuery.matches;
    finePointer.current = fineQuery.matches;

    if (fineQuery.matches && !reduceQuery.matches) {
      document.documentElement.classList.add("roam-clean-cursor");
    }

    const mapPoint = (screen: Point) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return targetRef.current;
      const scale = Math.max(rect.width / WIDTH, rect.height / HEIGHT);
      const renderedWidth = WIDTH * scale;
      const renderedHeight = HEIGHT * scale;
      return {
        x: (screen.x - rect.left - (rect.width - renderedWidth) / 2) / scale,
        y: (screen.y - rect.top - (rect.height - renderedHeight) / 2) / scale,
      };
    };

    const localPoint = (screen: Point) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return screen;
      return { x: screen.x - rect.left, y: screen.y - rect.top };
    };

    const disperse = () => {
      if (modeRef.current !== "gather") return;
      const now = performance.now();
      const origin = { ...targetRef.current };
      const nearby = routeList
        .map((route, index) => ({ route, index, distance: routeDistance(route, origin) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 16);

      modeRef.current = "disperse";
      setMode("disperse");
      rejoinedAt.current = 0;

      particlesRef.current.forEach((particle, index) => {
        const choice = nearby[(index * 5 + Math.floor(seeded(index + now * .001) * nearby.length)) % nearby.length];
        const progress = nearestProgress(choice.route, origin);
        const direction: 1 | -1 = seeded(index + now * .0017) > .5 ? 1 : -1;
        const delta = (8 + seeded(index + 73) * 26) / (choice.route.kind === "h" ? WIDTH : HEIGHT);
        const targetProgress = wrap(progress + direction * delta);
        particle.from = { ...origin };
        particle.position = { ...origin };
        particle.to = routePoint(choice.route, targetProgress);
        particle.targetRoute = choice.index;
        particle.targetProgress = targetProgress;
        particle.startedAt = now;
        particle.delay = 18 + seeded(index + 91) * 105;
        particle.duration = 900 + seeded(index + 103) * 430;
        particle.direction = direction;
      });
    };

    const armIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(disperse, IDLE_DELAY);
    };

    const move = (event: PointerEvent) => {
      const screen = { x: event.clientX, y: event.clientY };
      setCursor(screen);
      setFocusLocal(localPoint(screen));
      setPointerSeen(true);

      const target = event.target instanceof Element ? event.target : null;
      setOverText(Boolean(target?.closest("input, textarea, [contenteditable='true']")));

      if (reducedMotion.current || !finePointer.current) return;

      targetRef.current = mapPoint(screen);
      modeRef.current = "gather";
      setMode("gather");
      armIdle();
    };

    const leave = () => {
      setOverText(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      disperse();
    };

    const tick = (now: number) => {
      const previous = lastFrame.current ?? now;
      const dt = Math.min(.05, (now - previous) / 1000);
      lastFrame.current = now;
      let stillDispersing = false;

      particlesRef.current.forEach((particle) => {
        if (modeRef.current === "gather") {
          const ease = 1 - Math.exp(-dt * 10.6);
          particle.position = {
            x: particle.position.x + (targetRef.current.x - particle.position.x) * ease,
            y: particle.position.y + (targetRef.current.y - particle.position.y) * ease,
          };
          return;
        }

        if (modeRef.current === "disperse") {
          const elapsed = now - particle.startedAt - particle.delay;
          if (elapsed < 0) {
            stillDispersing = true;
            return;
          }
          const raw = clamp(elapsed / particle.duration);
          if (raw < 1) {
            const eased = easeOutCubic(raw);
            particle.position = {
              x: particle.from.x + (particle.to.x - particle.from.x) * eased,
              y: particle.from.y + (particle.to.y - particle.from.y) * eased,
            };
            stillDispersing = true;
            return;
          }
          particle.routeIndex = particle.targetRoute;
          particle.progress = particle.targetProgress;
          if (!rejoinedAt.current) rejoinedAt.current = now;
        }

        const ramp = rejoinedAt.current ? clamp((now - rejoinedAt.current) / RESUME_RAMP) : 1;
        const speedScale = rejoinedAt.current ? .08 + easeOutCubic(ramp) * .92 : 1;
        if (ramp >= 1) rejoinedAt.current = 0;
        particle.progress = wrap(particle.progress + particle.speed * speedScale * particle.direction * dt);
        particle.position = routePoint(routeList[particle.routeIndex], particle.progress);
      });

      if (modeRef.current === "disperse" && !stillDispersing) {
        modeRef.current = "idle";
        setMode("idle");
      }

      if (!reducedMotion.current) {
        setPoints(particlesRef.current.map((particle) => ({ ...particle.position })));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("mouseleave", leave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("mouseleave", leave);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("roam-clean-cursor");
    };
  }, [routeList]);

  const focusOpacity = mode === "gather" ? 1 : mode === "disperse" ? .38 : 0;
  const haloOpacity = mode === "gather" ? .72 : mode === "disperse" ? .22 : 0;
  const cursorOpacity = pointerSeen && !overText && !reducedMotion.current && finePointer.current ? 1 : 0;

  return (
    <div ref={rootRef} className="clean-field" data-state={mode} aria-hidden>
      <div className="clean-field__base" />
      <div className="clean-field__grid" />
      <div
        className="clean-field__focus-grid"
        style={{
          opacity: focusOpacity,
          ["--focus-x" as string]: `${focusLocal.x}px`,
          ["--focus-y" as string]: `${focusLocal.y}px`,
        }}
      />
      <div
        className="clean-field__focus-halo"
        style={{ left: focusLocal.x, top: focusLocal.y, opacity: haloOpacity }}
      />
      <div className="clean-field__wash clean-field__wash--sage" />
      <div className="clean-field__wash clean-field__wash--sand" />
      <div className="clean-field__wash clean-field__wash--indigo" />

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="clean-field__traffic">
        {points.map((point, index) => {
          const particle = particlesRef.current[index];
          const remaining = distance(point, targetRef.current);
          const fade = mode === "gather" ? clamp((remaining - 2) / 18) : 1;
          const radiusScale = mode === "gather" ? .82 + clamp(remaining / 120) * .18 : 1;
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={particle.radius * radiusScale}
              fill={particle.color}
              opacity={(mode === "gather" ? .84 : .92) * fade}
            />
          );
        })}
      </svg>

      <div className="clean-field__cursor" style={{ left: cursor.x, top: cursor.y, opacity: cursorOpacity }} />

      <style jsx global>{`
        html.roam-clean-cursor,
        html.roam-clean-cursor body,
        html.roam-clean-cursor * { cursor: none !important; }
        html.roam-clean-cursor input,
        html.roam-clean-cursor textarea,
        html.roam-clean-cursor [contenteditable="true"] { cursor: text !important; }
      `}</style>

      <style jsx>{`
        .clean-field {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background: #f4f2ec;
        }
        .clean-field__base {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 78% 18%, rgba(79,70,180,.1) 0%, rgba(79,70,180,.04) 20%, transparent 42%),
            radial-gradient(circle at 50% 42%, rgba(255,255,255,.58), rgba(255,255,255,.02) 42%),
            linear-gradient(180deg, rgba(255,255,255,.3), rgba(244,242,236,.05));
        }
        .clean-field__grid,
        .clean-field__focus-grid {
          position: absolute;
          inset: 0;
          background-size: ${GRID}px ${GRID}px;
          background-position: 0 0;
        }
        .clean-field__grid {
          background-image:
            linear-gradient(to right, rgba(70,80,72,.105) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(70,80,72,.105) 1px, transparent 1px);
          mask-image: radial-gradient(circle at 50% 42%, #000 0%, rgba(0,0,0,.95) 44%, rgba(0,0,0,.72) 76%, rgba(0,0,0,.48) 100%);
          -webkit-mask-image: radial-gradient(circle at 50% 42%, #000 0%, rgba(0,0,0,.95) 44%, rgba(0,0,0,.72) 76%, rgba(0,0,0,.48) 100%);
        }
        .clean-field__focus-grid {
          z-index: 2;
          background-image:
            linear-gradient(to right, rgba(42,53,47,.34) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(42,53,47,.34) 1px, transparent 1px);
          mask-image: radial-gradient(circle 150px at var(--focus-x) var(--focus-y), #000 0%, rgba(0,0,0,.96) 44%, rgba(0,0,0,.56) 72%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle 150px at var(--focus-x) var(--focus-y), #000 0%, rgba(0,0,0,.96) 44%, rgba(0,0,0,.56) 72%, transparent 100%);
          transition: opacity 720ms cubic-bezier(.22,1,.36,1);
          will-change: opacity, mask-position;
        }
        .clean-field[data-state="gather"] .clean-field__focus-grid {
          transition-duration: 90ms;
        }
        .clean-field__focus-halo {
          position: absolute;
          z-index: 1;
          width: 300px;
          height: 300px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(52,72,62,.07) 0%, rgba(72,73,162,.025) 42%, transparent 72%);
          filter: blur(8px);
          transition: opacity 650ms cubic-bezier(.22,1,.36,1);
          will-change: left, top, opacity;
        }
        .clean-field[data-state="gather"] .clean-field__focus-halo {
          transition: opacity 90ms ease;
        }
        .clean-field__wash {
          position: absolute;
          width: 54vw;
          height: 54vw;
          min-width: 560px;
          min-height: 560px;
          border-radius: 999px;
          filter: blur(30px);
          opacity: .66;
        }
        .clean-field__wash--sage {
          left: -22vw;
          top: -30vw;
          background: radial-gradient(circle, rgba(130,168,143,.17), rgba(130,168,143,.04) 48%, transparent 72%);
        }
        .clean-field__wash--sand {
          right: -19vw;
          bottom: -34vw;
          background: radial-gradient(circle, rgba(219,175,119,.16), rgba(219,175,119,.04) 48%, transparent 73%);
        }
        .clean-field__wash--indigo {
          width: 44vw;
          height: 44vw;
          right: 5vw;
          top: -8vw;
          background: radial-gradient(circle, rgba(76,67,176,.12), rgba(76,67,176,.035) 48%, transparent 73%);
        }
        .clean-field__traffic {
          position: absolute;
          z-index: 3;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .clean-field__cursor {
          position: fixed;
          z-index: 1000;
          width: 10px;
          height: 10px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          pointer-events: none;
          background: #414996;
          box-shadow: 0 0 0 1px rgba(255,255,255,.72), 0 4px 14px rgba(57,67,60,.08);
          transition: opacity 90ms ease;
        }
        @media (max-width: 700px) {
          .clean-field__cursor,
          .clean-field__focus-grid,
          .clean-field__focus-halo { display: none; }
          .clean-field__grid { opacity: .9; }
        }
        @media (prefers-reduced-motion: reduce) {
          .clean-field__traffic,
          .clean-field__cursor,
          .clean-field__focus-grid,
          .clean-field__focus-halo { display: none; }
        }
      `}</style>
    </div>
  );
}
