"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DateRangePickerProps = {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
};

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
  ready: boolean;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const VIEWPORT_PADDING = 16;
const POPOVER_GAP = 10;
const DESKTOP_POPOVER_WIDTH = 380;
const FALLBACK_POPOVER_HEIGHT = 420;

function toValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromValue(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDay(a: Date, b: Date | null) {
  return Boolean(b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
}

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function readableRange(startDate: string, endDate: string) {
  if (!startDate) return "Choose dates";
  const start = fromValue(startDate)!;
  const startLabel = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(start);
  if (!endDate) return `${startLabel} → choose return`;
  const end = fromValue(endDate)!;
  const endLabel = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(end);
  return `${startLabel} → ${endLabel}`;
}

function nightsBetween(startDate: string, endDate: string) {
  const start = fromValue(startDate);
  const end = fromValue(endDate);
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, width: DESKTOP_POPOVER_WIDTH, ready: false });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(fromValue(startDate) ?? today));
  const start = fromValue(startDate);
  const end = fromValue(endDate);
  const choosingEnd = Boolean(startDate && !endDate);
  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const nights = nightsBetween(startDate, endDate);

  useEffect(() => setMounted(true), []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const compact = viewportWidth < 640;
    const width = Math.min(
      compact ? viewportWidth - 24 : DESKTOP_POPOVER_WIDTH,
      viewportWidth - VIEWPORT_PADDING * 2,
    );
    const popoverHeight = popoverRef.current?.offsetHeight ?? FALLBACK_POPOVER_HEIGHT;

    if (compact) {
      setPosition({
        top: Math.max(12, (viewportHeight - popoverHeight) / 2),
        left: Math.max(12, (viewportWidth - width) / 2),
        width,
        ready: true,
      });
      return;
    }

    const maxLeft = Math.max(VIEWPORT_PADDING, viewportWidth - width - VIEWPORT_PADDING);
    const left = Math.min(Math.max(rect.left, VIEWPORT_PADDING), maxLeft);
    const roomBelow = viewportHeight - rect.bottom - POPOVER_GAP;
    const roomAbove = rect.top - POPOVER_GAP;
    const openAbove = roomBelow < popoverHeight && roomAbove > roomBelow;
    const preferredTop = openAbove ? rect.top - popoverHeight - POPOVER_GAP : rect.bottom + POPOVER_GAP;
    const maxTop = Math.max(VIEWPORT_PADDING, viewportHeight - popoverHeight - VIEWPORT_PADDING);
    const top = Math.min(Math.max(preferredTop, VIEWPORT_PADDING), maxTop);

    setPosition({ top, left, width, ready: true });
  }, []);

  useEffect(() => {
    if (!open) return;

    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (startDate) setVisibleMonth(startOfMonth(fromValue(startDate)!));
  }, [startDate]);

  function choose(date: Date) {
    if (date < today) return;
    const value = toValue(date);
    if (!startDate || endDate || (start && date < start)) {
      onChange(value, "");
      return;
    }
    onChange(startDate, value);
    window.setTimeout(() => setOpen(false), 160);
  }

  const popover = open && mounted ? createPortal(
    <>
      <button
        type="button"
        aria-label="Close date picker"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[190] cursor-default bg-transparent sm:hidden"
      />
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Choose trip dates"
        className="date-range-popover fixed z-[200] overflow-hidden rounded-[22px] border border-[rgba(27,26,23,0.12)] bg-[rgba(255,255,255,0.98)] shadow-[0_26px_70px_-28px_rgba(27,26,23,0.42)] backdrop-blur-xl"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          visibility: position.ready ? "visible" : "hidden",
        }}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <button type="button" onClick={() => setVisibleMonth((month) => addMonths(month, -1))} className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-paper-2 hover:text-ink" aria-label="Previous month">←</button>
          <div className="text-center">
            <p className="font-display text-[15px] font-semibold text-ink">{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(visibleMonth)}</p>
            <p className="mt-0.5 text-[10.5px] text-faint">{choosingEnd ? "Now choose your return" : endDate ? `${nights} night${nights === 1 ? "" : "s"} selected` : "Choose departure, then return"}</p>
          </div>
          <button type="button" onClick={() => setVisibleMonth((month) => addMonths(month, 1))} className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-paper-2 hover:text-ink" aria-label="Next month">→</button>
        </div>

        <div className="px-3 pb-3">
          <div className="grid grid-cols-7 px-1 pb-1.5">
            {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="py-1 text-center text-[9.5px] font-semibold uppercase tracking-[0.08em] text-faint">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((date) => {
              const value = toValue(date);
              const inMonth = date.getMonth() === visibleMonth.getMonth();
              const disabled = date < today;
              const isStart = sameDay(date, start);
              const isEnd = sameDay(date, end);
              const inRange = Boolean(start && end && date > start && date < end);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() => choose(date)}
                  className={`relative grid h-10 place-items-center text-[12px] transition ${!inMonth ? "text-faint/45" : "text-ink-soft"} ${disabled ? "cursor-not-allowed opacity-25" : "hover:z-10 hover:text-ink"}`}
                  aria-label={new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date)}
                >
                  {inRange && <span className="absolute inset-y-1 left-0 right-0 bg-accent-tint" aria-hidden />}
                  {isStart && end && <span className="absolute inset-y-1 left-1/2 right-0 bg-accent-tint" aria-hidden />}
                  {isEnd && start && <span className="absolute inset-y-1 left-0 right-1/2 bg-accent-tint" aria-hidden />}
                  <span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full ${isStart || isEnd ? "bg-ink font-semibold text-paper shadow-[0_7px_18px_-12px_rgba(27,26,23,0.72)]" : disabled ? "" : "hover:bg-paper-2"}`}>{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-hair-2 px-4 py-3">
          <button type="button" onClick={() => onChange("", "")} className="text-[11px] font-semibold text-muted transition hover:text-ink">Clear</button>
          <p className="text-[11px] text-faint">{startDate ? readableRange(startDate, endDate) : "Select your trip window"}</p>
        </div>
      </div>
    </>,
    document.body,
  ) : null;

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">When</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setPosition((current) => ({ ...current, ready: false }));
          setOpen((current) => !current);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`home-guided-control flex h-[60px] w-full items-center justify-between gap-3 rounded-full border bg-[rgba(255,255,255,0.74)] px-4 text-left backdrop-blur-md transition ${open ? "border-accent bg-white" : "border-[rgba(27,26,23,0.14)] hover:bg-[rgba(255,255,255,0.92)]"}`}
      >
        <span className="min-w-0">
          <span className={`block truncate font-display text-[15px] font-semibold ${startDate ? "text-ink" : "text-faint"}`}>
            {readableRange(startDate, endDate)}
          </span>
          {endDate && nights > 0 && <span className="mt-0.5 block text-[10.5px] text-faint">{nights} night{nights === 1 ? "" : "s"}</span>}
        </span>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-muted" aria-hidden>
          <rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 3.5v4M16 3.5v4M4 9.5h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {popover}
    </div>
  );
}
