"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BriefLevel, Trip, TripBriefItem, ProtectChoice } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button, Disclosure, Eyebrow, LevelTag } from "@/components/ui";

const LEVELS: { level: BriefLevel; label: string }[] = [
  { level: "must", label: "Must work" },
  { level: "prioritize", label: "Prioritize" },
  { level: "flexible", label: "Flexible" },
  { level: "avoid", label: "Avoid" },
];

/* order constraints so must-haves read first */
const LEVEL_ORDER: Record<BriefLevel, number> = { must: 0, prioritize: 1, avoid: 2, flexible: 3 };

function summarize(trip: Trip): string {
  const priorities = trip.brief.items
    .filter((i) => i.level === "prioritize" || i.level === "must")
    .map((i) => i.statement.toLowerCase());
  const lead = priorities.slice(0, 3);
  const list =
    lead.length <= 1
      ? lead[0] ?? "a trip that fits how you travel"
      : `${lead.slice(0, -1).join(", ")} and ${lead[lead.length - 1]}`;
  return `A trip built around ${list} — with the details left to me until they matter.`;
}

function ConstraintRow({ tripId, item }: { tripId: string; item: TripBriefItem }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(item.statement);

  return (
    <div className="border-b border-hair-2 last:border-b-0">
      <div className="flex items-center justify-between gap-3 py-3.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <span className="text-[16px] text-ink transition group-hover:text-accent">
            {item.statement}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <LevelTag level={item.level} />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Edit constraint"
            className="grid h-7 w-7 place-items-center rounded-full text-faint transition hover:bg-hair-2 hover:text-ink"
          >
            {open ? "⌃" : "✎"}
          </button>
        </div>
      </div>

      {open && (
        <div className="disclose mb-4 rounded-lg border border-hair bg-surface p-4">
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
            Constraint
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => store.editBriefItem(tripId, item.id, text.trim() || item.statement)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                store.editBriefItem(tripId, item.id, text.trim() || item.statement);
                setOpen(false);
              }
            }}
            className="w-full rounded-lg border border-accent-line bg-surface px-3 py-2 text-[15px] outline-none focus-visible:outline-2 focus-visible:outline-accent"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {LEVELS.map((l) => {
              const active = item.level === l.level;
              return (
                <button
                  key={l.level}
                  onClick={() => store.setBriefLevel(tripId, item.id, l.level)}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${
                    active
                      ? "border-accent bg-accent-tint text-accent"
                      : "border-hair text-muted hover:border-ink"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
            <button
              onClick={() => store.removeBriefItem(tripId, item.id)}
              className="ml-auto text-[12.5px] font-medium text-muted transition hover:text-[#8a4b3f]"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddDetail({ tripId }: { tripId: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 text-[14px] font-medium text-accent transition hover:text-accent-press"
      >
        + Add a detail
      </button>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-2">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. we'd love a spa, or keep flights under 8 hours"
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            store.addBriefItem(tripId, text.trim(), "prioritize");
            setText("");
            setOpen(false);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full rounded-full border border-accent-line bg-surface px-4 py-2 text-[14px] outline-none"
      />
      <Button
        size="sm"
        onClick={() => {
          if (text.trim()) store.addBriefItem(tripId, text.trim(), "prioritize");
          setText("");
          setOpen(false);
        }}
      >
        Add
      </Button>
    </div>
  );
}

const PROTECT: { key: Exclude<ProtectChoice, null>; label: string }[] = [
  { key: "resort", label: "The best resort" },
  { key: "journey", label: "The easiest journey" },
  { key: "total", label: "The lowest total" },
  { key: "flexible", label: "Whatever you'd choose" },
];

export function TripBrief({ trip }: { trip: Trip }) {
  const store = useStore();
  const router = useRouter();

  const constraints = [...trip.brief.items].sort(
    (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
  );

  return (
    <div className="measure mx-auto">
      <Eyebrow>Your trip brief</Eyebrow>
      <h1 className="mt-3 font-display text-[clamp(30px,5vw,46px)] leading-[1.05] tracking-[-0.035em]">
        Here&apos;s what matters
      </h1>
      <p className="mt-4 text-[18px] leading-relaxed text-muted">{summarize(trip)}</p>

      <div className="mt-9">
        {constraints.map((it) => (
          <ConstraintRow key={it.id} tripId={trip.id} item={it} />
        ))}
        <AddDetail tripId={trip.id} />
      </div>

      <div className="mt-8">
        <Disclosure label="Adjust the brief">
          <div className="grid gap-6">
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">
                What I&apos;m assuming
              </p>
              <div className="rounded-lg border border-hair bg-surface">
                {trip.brief.assumptions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-4 border-b border-hair-2 px-4 py-2.5 last:border-b-0"
                  >
                    <span className="text-[13px] font-medium text-faint">{a.label}</span>
                    <input
                      defaultValue={a.value}
                      onBlur={(e) =>
                        store.editAssumption(trip.id, a.id, e.target.value.trim() || a.value)
                      }
                      className="w-44 rounded-md bg-transparent px-2 py-1 text-right text-[14px] text-ink outline-none focus-visible:bg-surface-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">
                Anything you&apos;d most like me to protect?
              </p>
              <div className="flex flex-wrap gap-2">
                {PROTECT.map((p) => {
                  const active = trip.protect === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => store.setProtect(trip.id, active ? null : p.key)}
                      className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                        active
                          ? "border-accent bg-accent text-[#f3f6f1]"
                          : "border-hair text-ink-soft hover:border-ink"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Disclosure>
      </div>

      <div className="mt-10 flex flex-col items-start gap-3">
        <Button variant="accent" onClick={() => router.push(`/trips/${trip.id}/destinations`)}>
          Show me the best fit →
        </Button>
        <p className="text-[13px] text-faint">
          Nothing is locked — you can keep editing this afterwards.
        </p>
      </div>
    </div>
  );
}
