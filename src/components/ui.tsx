"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Confidence, PreferenceSource, RecommendationType } from "@/lib/types";
import { PRODUCT } from "@/config/product";

/* -------------------- Orb -------------------- */
export function Orb({ size = 26, busy = false }: { size?: number; busy?: boolean }) {
  return (
    <span
      className={`orb${busy ? " busy" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/* -------------------- Button -------------------- */
type BtnVariant = "ink" | "accent" | "ghost" | "quiet";
export function buttonClass(variant: BtnVariant = "ink", size: "md" | "sm" = "md") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[transform,background,border-color,box-shadow] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent";
  const sizes = size === "sm" ? "h-9 px-4 text-sm" : "h-12 px-6 text-[15px]";
  const variants: Record<BtnVariant, string> = {
    ink: "bg-ink text-paper hover:shadow-[var(--shadow-float)]",
    accent: "bg-accent text-[#f3f6f1] hover:bg-accent-press",
    ghost: "bg-transparent text-ink border border-hair hover:border-ink",
    quiet: "bg-transparent text-muted hover:text-ink",
  };
  return `${base} ${sizes} ${variants[variant]}`;
}
export function Button({
  variant = "ink",
  size = "md",
  className = "",
  ...props
}: { variant?: BtnVariant; size?: "md" | "sm" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

/* -------------------- Card -------------------- */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-card border border-hair bg-surface ${className}`}>{children}</div>
  );
}

/* -------------------- Prototype badge / provenance -------------------- */
export function PrototypeBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber-tint px-2.5 py-1 text-[11px] font-semibold text-amber ${className}`}
      title={PRODUCT.prototypeNote}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber" /> Demo data
    </span>
  );
}

const SOURCE_COPY: Record<PreferenceSource, string> = {
  user: "You said this",
  profile: "From your Traveler Profile",
  inferred: "Inferred from your choices",
};
export function SourceTag({ source }: { source: PreferenceSource }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-faint">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          source === "user" ? "bg-ink" : source === "profile" ? "bg-accent" : "bg-amber"
        }`}
      />
      {SOURCE_COPY[source]}
    </span>
  );
}

/* -------------------- Labels -------------------- */
const CONF: Record<Confidence, { text: string; cls: string }> = {
  strong: { text: "Strong fit", cls: "bg-accent-tint text-accent" },
  "good-with-tradeoff": { text: "Good fit, one trade-off", cls: "bg-amber-tint text-amber" },
  "needs-input": { text: "Needs your input", cls: "bg-paper-2 text-ink-soft" },
};
export function ConfidenceLabel({ confidence }: { confidence: Confidence }) {
  const c = CONF[confidence];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${c.cls}`}>
      {c.text}
    </span>
  );
}

const RECO: Record<RecommendationType, string> = {
  top: "Recommended",
  easier: "Easier alternative",
  wildcard: "Wildcard option",
};
export function RecommendationLabel({ type }: { type: RecommendationType }) {
  return (
    <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
      {RECO[type]}
    </span>
  );
}

export function TradeoffNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-ink-soft">
      <span aria-hidden className="mt-[3px] text-amber">
        ⚑
      </span>
      <span>{children}</span>
    </p>
  );
}

/* -------------------- Editorial primitives -------------------- */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11.5px] font-semibold uppercase tracking-[0.16em] text-faint ${className}`}>
      {children}
    </p>
  );
}

/** A calm strip of short, verifiable proof points. */
export function ConfidenceStrip({ chips }: { chips: string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted">
      {chips.map((c, i) => (
        <li key={c} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-hair">·</span>}
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="text-accent">✓</span>
            {c}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Inline progressive-disclosure toggle. */
export function Disclosure({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent transition hover:text-accent-press"
      >
        {label}
        <span aria-hidden className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && <div className="disclose mt-3">{children}</div>}
    </div>
  );
}

const LEVEL_TAG: Record<string, { label: string; cls: string }> = {
  must: { label: "Must work", cls: "bg-accent-tint text-accent" },
  prioritize: { label: "Prioritize", cls: "bg-amber-tint text-amber" },
  flexible: { label: "Flexible", cls: "bg-paper-2 text-ink-soft" },
  avoid: { label: "Avoid", cls: "bg-[#f0e2e0] text-[#8a4b3f]" },
};
export function LevelTag({ level }: { level: string }) {
  const t = LEVEL_TAG[level] ?? LEVEL_TAG.flexible;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${t.cls}`}>
      {t.label}
    </span>
  );
}

/* -------------------- Quick reaction -------------------- */
export function QuickReaction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-hair bg-surface px-3.5 py-2 text-sm text-ink-soft transition hover:border-ink"
    >
      {label}
    </button>
  );
}

/* -------------------- Empty state -------------------- */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-hair bg-surface-2 p-10 text-center">
      <div className="mx-auto mb-4 w-fit">
        <Orb size={30} />
      </div>
      <h3 className="font-display text-xl tracking-[-0.02em]">{title}</h3>
      {body && <p className="mx-auto mt-2 max-w-[46ch] text-[15px] text-muted">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* -------------------- Placeholder page -------------------- */
export function PlaceholderPage({
  eyebrow = "Coming next",
  title,
  body,
  bullets,
  backHref = "/",
  backLabel = "Back",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
      <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        {eyebrow}
      </p>
      <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-muted">{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-8 grid gap-3">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 rounded-lg border border-hair bg-surface px-4 py-3 text-[15px] text-ink-soft"
            >
              <span aria-hidden className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {b}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
        <Link href={backHref} className={buttonClass("ghost", "sm")}>
          ← {backLabel}
        </Link>
      </div>
    </div>
  );
}

/* -------------------- Side panel / drawer -------------------- */
export function SidePanel({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[rgba(27,26,23,0.28)] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute right-0 top-0 flex h-full w-[440px] max-w-[92vw] flex-col border-l border-hair bg-paper shadow-[var(--shadow-pop)] transition-transform duration-[450ms] [transition-timing-function:var(--ease-spring)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-hair px-6 py-5">
          <h2 className="font-display text-xl tracking-[-0.02em]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-hair text-muted transition hover:border-ink hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-hair bg-surface-2 px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

/* -------------------- Toast -------------------- */
interface ToastCtx {
  toast: (msg: string) => void;
}
const ToastContext = createContext<ToastCtx | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2600);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper shadow-[var(--shadow-pop)] transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-[#9cc0a6]" />
        {msg}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => {} };
}
