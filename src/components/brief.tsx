"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BriefLevel, Trip, TripBriefItem, TripAssumption, ProtectChoice } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button, Card, SourceTag, useToast } from "@/components/ui";

const LEVELS: { level: BriefLevel; label: string; hint: string }[] = [
  { level: "must", label: "Must work", hint: "Roam won't break these without asking" },
  { level: "prioritize", label: "Prioritize", hint: "Optimised around, not guaranteed" },
  { level: "flexible", label: "Flexible", hint: "Roam can decide these for you" },
  { level: "avoid", label: "Must avoid", hint: "Steer clear of these" },
];
const LEVEL_LABEL: Record<BriefLevel, string> = {
  must: "Must work",
  prioritize: "Prioritize",
  flexible: "Flexible",
  avoid: "Must avoid",
};

function LevelSelect({
  value,
  onChange,
}: {
  value: BriefLevel;
  onChange: (l: BriefLevel) => void;
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">Importance</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BriefLevel)}
        className="cursor-pointer appearance-none rounded-full border border-hair bg-surface py-1.5 pl-3 pr-7 text-[12.5px] font-medium text-ink-soft transition hover:border-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        {LEVELS.map((l) => (
          <option key={l.level} value={l.level}>
            {l.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint">
        ▾
      </span>
    </label>
  );
}

function BriefItemRow({ tripId, item }: { tripId: string; item: TripBriefItem }) {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.statement);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hair-2 py-3.5 last:border-b-0">
      <div className="min-w-[200px] flex-1">
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              store.editBriefItem(tripId, item.id, text.trim() || item.statement);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                store.editBriefItem(tripId, item.id, text.trim() || item.statement);
                setEditing(false);
              }
              if (e.key === "Escape") {
                setText(item.statement);
                setEditing(false);
              }
            }}
            className="w-full rounded-lg border border-accent-line bg-surface px-3 py-1.5 text-[15px] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left text-[15px] font-medium text-ink hover:text-accent"
            title="Edit"
          >
            {item.statement}
          </button>
        )}
        <div className="mt-1">
          <SourceTag source={item.source} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LevelSelect value={item.level} onChange={(l) => store.setBriefLevel(tripId, item.id, l)} />
        <button
          onClick={() => setEditing((e) => !e)}
          aria-label="Edit detail"
          className="grid h-8 w-8 place-items-center rounded-full border border-hair text-muted transition hover:border-ink hover:text-ink"
        >
          ✎
        </button>
        <button
          onClick={() => store.removeBriefItem(tripId, item.id)}
          aria-label="Remove detail"
          className="grid h-8 w-8 place-items-center rounded-full border border-hair text-muted transition hover:border-ink hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AssumptionRow({ tripId, a }: { tripId: string; a: TripAssumption }) {
  const store = useStore();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(a.value);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hair-2 py-3 last:border-b-0">
      <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">{a.label}</div>
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            store.editAssumption(tripId, a.id, val.trim() || a.value);
            setEditing(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && (store.editAssumption(tripId, a.id, val.trim() || a.value), setEditing(false))}
          className="w-52 rounded-lg border border-accent-line bg-surface px-3 py-1.5 text-[15px] outline-none"
        />
      ) : (
        <button onClick={() => setEditing(true)} className="text-[15px] font-medium hover:text-accent">
          {a.value} <span className="text-faint">✎</span>
        </button>
      )}
    </div>
  );
}

function AddDetail({ tripId }: { tripId: string }) {
  const store = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 rounded-full border border-dashed border-hair px-4 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
      >
        + Add a detail
      </button>
    );
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. we'd love a spa, or keep flights under 8 hours"
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            store.addBriefItem(tripId, text.trim(), "prioritize");
            toast(`Added — "${text.trim()}"`);
            setText("");
            setOpen(false);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full max-w-md rounded-full border border-accent-line bg-surface px-4 py-2 text-sm outline-none"
      />
      <Button
        size="sm"
        onClick={() => {
          if (text.trim()) {
            store.addBriefItem(tripId, text.trim(), "prioritize");
            toast(`Added — "${text.trim()}"`);
            setText("");
          }
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
  { key: "flexible", label: "I'm flexible — show me what you'd choose" },
];

function FollowUp({ trip }: { trip: Trip }) {
  const store = useStore();
  return (
    <Card className="p-6">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">One quick thing</p>
      <h3 className="mt-2 font-display text-2xl tracking-[-0.02em]">What would you most like me to protect?</h3>
      <p className="mt-1.5 text-[15px] text-muted">Optional — skip it and I&apos;ll choose well on your behalf.</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {PROTECT.map((p) => {
          const active = trip.protect === p.key;
          return (
            <button
              key={p.key}
              onClick={() => store.setProtect(trip.id, active ? null : p.key)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-accent bg-accent text-[#f3f6f1]"
                  : "border-hair bg-surface text-ink-soft hover:border-ink"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-hair-2 pt-5">
        <span className="text-[13px] text-faint">Trip length</span>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => store.setTripLength(trip.id, trip.tripLength === n ? null : n)}
            className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
              trip.tripLength === n ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink"
            }`}
          >
            {n} nights
          </button>
        ))}
        <span className="text-[12px] text-faint">— or leave it to Roam</span>
      </div>
    </Card>
  );
}

export function TripBrief({ trip }: { trip: Trip }) {
  const router = useRouter();
  const grouped = LEVELS.map((l) => ({
    ...l,
    items: trip.brief.items.filter((it) => it.level === l.level),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid gap-5">
        {grouped.map((g) =>
          g.items.length === 0 && g.level === "avoid" ? null : (
            <Card key={g.level} className="p-6">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl tracking-[-0.02em]">{g.label}</h3>
                <span className="text-[12.5px] text-faint">{g.hint}</span>
              </div>
              {g.items.length === 0 ? (
                <p className="py-3 text-sm text-faint">Nothing here yet — move a detail in, or add one.</p>
              ) : (
                <div>
                  {g.items.map((it) => (
                    <BriefItemRow key={it.id} tripId={trip.id} item={it} />
                  ))}
                </div>
              )}
              {g.level === "prioritize" && <AddDetail tripId={trip.id} />}
            </Card>
          )
        )}
      </div>

      <div className="grid content-start gap-5">
        <Card className="p-6">
          <h3 className="font-display text-xl tracking-[-0.02em]">What I&apos;m assuming</h3>
          <p className="mt-1 text-[13px] text-muted">Editable — these are prototype assumptions, not fixed facts.</p>
          <div className="mt-3">
            {trip.brief.assumptions.map((a) => (
              <AssumptionRow key={a.id} tripId={trip.id} a={a} />
            ))}
          </div>
        </Card>

        <FollowUp trip={trip} />

        <div className="sticky bottom-24 lg:bottom-6">
          <Button
            className="w-full"
            variant="ink"
            onClick={() => router.push(`/trips/${trip.id}/destinations`)}
          >
            Show me where you&apos;d go →
          </Button>
          <p className="mt-2 text-center text-[12px] text-faint">
            You can keep editing the brief afterwards — nothing is locked.
          </p>
        </div>
      </div>
    </div>
  );
}

export { LEVEL_LABEL };
