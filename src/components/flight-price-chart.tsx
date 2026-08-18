"use client";

import { useMemo, useState } from "react";

export type PricePeriod = "1W" | "1M" | "3M" | "6M";
export type PriceFlight = {
  id: string;
  label: string;
  currentPrice: number;
};

const PERIODS: PricePeriod[] = ["1W", "1M", "3M", "6M"];
const PERIOD_POINTS: Record<PricePeriod, number> = {
  "1W": 7,
  "1M": 15,
  "3M": 19,
  "6M": 25,
};
const PERIOD_DAYS: Record<PricePeriod, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
};
const COLORS = ["#6257ff", "#607a67", "#a36f49", "#32312d", "#7d6e91"];

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function seedFor(id: string) {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildSeries(flight: PriceFlight, period: PricePeriod) {
  const points = PERIOD_POINTS[period];
  const seed = seedFor(flight.id);
  const amplitude =
    period === "1W"
      ? 280_000
      : period === "1M"
        ? 650_000
        : period === "3M"
          ? 1_050_000
          : 1_450_000;

  return Array.from({ length: points }, (_, index) => {
    if (index === points - 1) return flight.currentPrice;
    const progress = index / Math.max(1, points - 1);
    const wave = Math.sin(index * 0.82 + seed * 0.031) * amplitude * 0.48;
    const secondary = Math.cos(index * 0.41 + seed * 0.017) * amplitude * 0.19;
    const drift = (progress - 0.5) * amplitude * (((seed % 7) - 3) * 0.075);
    return Math.round((flight.currentPrice + wave + secondary + drift) / 50_000) * 50_000;
  });
}

function dateLabels(period: PricePeriod, points: number) {
  const totalDays = PERIOD_DAYS[period];
  const today = new Date();
  const formatter = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
  return Array.from({ length: points }, (_, index) => {
    const daysAgo = Math.round(totalDays * (1 - index / Math.max(1, points - 1)));
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return formatter.format(date);
  });
}

export function FlightPriceChart({
  flights,
  title = "How these fares have been moving",
  subtitle = "Hover a day to compare the flights at that point in time.",
  defaultPeriod = "1M",
}: {
  flights: PriceFlight[];
  title?: string;
  subtitle?: string;
  defaultPeriod?: PricePeriod;
}) {
  const [period, setPeriod] = useState<PricePeriod>(defaultPeriod);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 760;
  const height = 270;
  const padX = 44;
  const padTop = 22;
  const padBottom = 34;

  const series = useMemo(
    () => flights.map((flight) => buildSeries(flight, period)),
    [flights, period],
  );
  const labels = useMemo(
    () => dateLabels(period, PERIOD_POINTS[period]),
    [period],
  );

  if (!flights.length) return null;

  const values = series.flat();
  const min = Math.min(...values) - 350_000;
  const max = Math.max(...values) + 350_000;
  const range = Math.max(1, max - min);
  const plotWidth = width - padX * 2;
  const plotHeight = height - padTop - padBottom;
  const points = PERIOD_POINTS[period];

  const xFor = (index: number) =>
    padX + (index / Math.max(1, points - 1)) * plotWidth;
  const yFor = (value: number) =>
    padTop + (1 - (value - min) / range) * plotHeight;

  const moveHover = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * width;
    const clamped = Math.max(padX, Math.min(width - padX, svgX));
    const ratio = (clamped - padX) / plotWidth;
    setHoverIndex(Math.round(ratio * (points - 1)));
  };

  const activeIndex = hoverIndex ?? points - 1;
  const activeX = xFor(activeIndex);

  return (
    <section className="rounded-[22px] border border-hair bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[22px] font-semibold tracking-[-0.03em]">{title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{subtitle}</p>
        </div>
        <div className="flex rounded-full border border-hair bg-surface-2 p-1">
          {PERIODS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setPeriod(item);
                setHoverIndex(null);
              }}
              className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${
                period === item ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
              aria-pressed={period === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {flights.map((flight, index) => (
          <div key={flight.id} className="flex items-center gap-2 text-[12px] font-semibold text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
            {flight.label}
          </div>
        ))}
      </div>

      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full touch-none overflow-visible"
          role="img"
          aria-label={`${period} illustrative flight price history`}
          onPointerMove={moveHover}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {[0, 1, 2, 3].map((line) => {
            const y = padTop + (line / 3) * plotHeight;
            return (
              <line
                key={line}
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="rgba(35,34,31,.09)"
                strokeWidth="1"
              />
            );
          })}

          {hoverIndex !== null && (
            <>
              <rect
                x={activeX - 11}
                y={padTop}
                width="22"
                height={plotHeight}
                rx="8"
                fill="rgba(98,87,255,.055)"
              />
              <line
                x1={activeX}
                x2={activeX}
                y1={padTop}
                y2={height - padBottom}
                stroke="rgba(98,87,255,.32)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
            </>
          )}

          {series.map((flightSeries, seriesIndex) => {
            const path = flightSeries
              .map((value, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(value)}`)
              .join(" ");
            return (
              <g key={flights[seriesIndex].id}>
                <path
                  d={path}
                  fill="none"
                  stroke={COLORS[seriesIndex % COLORS.length]}
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {hoverIndex !== null && (
                  <circle
                    cx={activeX}
                    cy={yFor(flightSeries[activeIndex])}
                    r="4"
                    fill={COLORS[seriesIndex % COLORS.length]}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          <text x={padX} y={height - 7} fontSize="11" fill="rgba(35,34,31,.48)">{labels[0]}</text>
          <text x={width - padX} y={height - 7} textAnchor="end" fontSize="11" fill="rgba(35,34,31,.48)">Today</text>
        </svg>

        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-3 z-20 min-w-[210px] -translate-x-1/2 rounded-[14px] border border-hair bg-[rgba(255,255,255,.96)] p-3 shadow-[var(--shadow-card)] backdrop-blur"
            style={{ left: `${(activeX / width) * 100}%` }}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">{labels[activeIndex]}</p>
            <div className="mt-2 grid gap-2">
              {flights.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between gap-4 text-[12px]">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-ink-soft">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                    <span className="truncate">{flight.label}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink">{IDR.format(series[index][activeIndex])}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-1 text-[11.5px] text-faint">Illustrative demo history, not live fare data.</p>
    </section>
  );
}
