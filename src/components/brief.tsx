"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BriefLevel, ProtectChoice, Trip, TripBriefItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button, Disclosure, Eyebrow, LevelTag } from "@/components/ui";
import { StickyAction } from "@/components/sticky-action";

const BOARD_LEVELS: { level: BriefLevel; label: string; helper: string }[] = [
  { level: "must", label: "Must-have", helper: "Non-negotiables. Roam should never trade these away." },
  { level: "prioritize", label: "Prioritize", helper: "Important, but worth balancing against the whole trip." },
  { level: "flexible", label: "Flexible", helper: "Preferences Roam can negotiate when there is a better fit." },
];

const LEVELS: { level: BriefLevel; label: string }[] = [
  { level: "must", label: "Must-have" },
  { level: "prioritize", label: "Prioritize" },
  { level: "flexible", label: "Flexible" },
  { level: "avoid", label: "Avoid" },
];

function summarize(trip: Trip): string {
  const priorities = trip.brief.items
    .filter((item) => item.level === "must" || item.level === "prioritize")
    .map((item) => item.statement.toLowerCase());
  const lead = priorities.slice(0, 3);
  const list = lead.length <= 1
    ? lead[0] ?? "a trip that fits how you travel"
    : `${lead.slice(0, -1).join(", ")} and ${lead[lead.length - 1]}`;
  return `A trip built around ${list} — with the details left open until they matter.`;
}

function ConstraintCard({ tripId, item }: { tripId: string; item: TripBriefItem }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(item.statement);
  const [level, setLevel] = useState(item.level);

  useEffect(() => {
    setText(item.statement);
    setLevel(item.level);
  }, [item.statement, item.level]);

  const save = () => {
    store.editBriefItem(tripId, item.id, text.trim() || item.statement);
    if (level !== item.level) store.setBriefLevel(tripId, item.id, level);
    setOpen(false);
  };

  return (
    <article className="rounded-[16px] border border-hair bg-surface shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="min-w-0 text-[14.5px] font-medium leading-snug text-ink">{item.statement}</span>
        <span className="shrink-0 text-[12px] text-faint">{open ? "Close" : "Edit"}</span>
      </button>

      {open && (
        <div className="disclose border-t border-hair-2 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Constraint</label>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-2 w-full rounded-lg border border-hair bg-surface-2 px-3 py-2.5 text-[14px] outline-none focus-visible:border-accent"
          />
          <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Importance</label>
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value as BriefLevel)}
            className="mt-2 w-full rounded-lg border border-hair bg-surface px-3 py-2.5 text-[13.5px] outline-none focus-visible:border-accent"
          >
            {LEVELS.map((option) => <option key={option.level} value={option.level}>{option.label}</option>)}
          </select>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => store.removeBriefItem(tripId, item.id)}
              className="text-[12.5px] font-semibold text-muted transition hover:text-[#8a4b3f]"
            >
              Remove
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setText(item.statement);
                  setLevel(item.level);
                  setOpen(false);
                }}
                className="text-[13px] font-semibold text-muted hover:text-ink"
              >
                Cancel
              </button>
              <Button size="sm" variant="ink" onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function AddDetail({ tripId }: { tripId: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<BriefLevel>("prioritize");

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[13.5px] font-semibold text-accent transition hover:text-accent-press">
        + Add another detail
      </button>
    );
  }

  const add = () => {
    if (!text.trim()) return;
    store.addBriefItem(tripId, text.trim(), level);
    setText("");
    setLevel("prioritize");
    setOpen(false);
  };

  return (
    <div className="rounded-[18px] border border-accent-line bg-accent-tint/35 p-4">
      <input
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="e.g. we'd love a spa, or keep flights under 8 hours"
        onKeyDown={(event) => {
          if (event.key === "Enter") add();
          if (event.key === "Escape") setOpen(false);
        }}
        className="w-full rounded-lg border border-hair bg-surface px-3 py-2.5 text-[14px] outline-none focus-visible:border-accent"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LEVELS.map((option) => (
          <button
            key={option.level}
            type="button"
            onClick={() => setLevel(option.level)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${level === option.level ? "border-accent bg-accent text-white" : "border-hair bg-surface text-muted"}`}
          >
            {option.label}
          </button>
        ))}
        <Button size="sm" variant="ink" className="ml-auto" onClick={add}>Add</Button>
      </div>
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
  const avoids = trip.brief.items.filter((item) => item.level === "avoid");

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow>Your trip brief</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(34px,5vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]">Here&apos;s what matters</h1>
        <p className="mx-auto mt-4 max-w-[58ch] text-[17px] leading-relaxed text-muted">{summarize(trip)}</p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {BOARD_LEVELS.map((group) => {
          const items = trip.brief.items.filter((item) => item.level === group.level);
          return (
            <section key={group.level} className="rounded-[22px] border border-hair bg-surface-2 p-4 md:p-5">
              <div className="flex items-end justify-between gap-3 border-b border-hair-2 pb-4">
                <div>
                  <h2 className="font-display text-[21px] font-semibold tracking-[-0.025em]">{group.label}</h2>
                  <p className="mt-1 text-[12.5px] leading-snug text-muted">{group.helper}</p>
                </div>
                <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{items.length}</span>
              </div>
              <div className="mt-4 grid gap-3">
                {items.length > 0 ? items.map((item) => <ConstraintCard key={item.id} tripId={trip.id} item={item} />) : (
                  <p className="rounded-[14px] border border-dashed border-hair px-4 py-5 text-center text-[12.5px] text-faint">Nothing here yet.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-5 rounded-[22px] border border-hair bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><Eyebrow>Avoid</Eyebrow><h2 className="mt-1 font-display text-[21px] font-semibold tracking-[-0.025em]">Things that would make this trip worse</h2></div>
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{avoids.length}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {avoids.length > 0 ? avoids.map((item) => <ConstraintCard key={item.id} tripId={trip.id} item={item} />) : <p className="text-[13px] text-faint">No hard avoids yet.</p>}
        </div>
      </section>

      <div className="mt-6"><AddDetail tripId={trip.id} /></div>

      <div className="mt-8">
        <Disclosure label="Assumptions & what to protect">
          <div className="grid gap-7 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">What I&apos;m assuming</p>
              <div className="rounded-lg border border-hair bg-surface">
                {trip.brief.assumptions.map((assumption) => (
                  <div key={assumption.id} className="flex items-center justify-between gap-4 border-b border-hair-2 px-4 py-3 last:border-b-0">
                    <span className="text-[12.5px] font-medium text-faint">{assumption.label}</span>
                    <input
                      defaultValue={assumption.value}
                      onBlur={(event) => store.editAssumption(trip.id, assumption.id, event.target.value.trim() || assumption.value)}
                      className="w-44 rounded-md bg-transparent px-2 py-1 text-right text-[13.5px] text-ink outline-none focus-visible:bg-surface-2"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">Protect above everything else</p>
              <div className="flex flex-wrap gap-2">
                {PROTECT.map((option) => {
                  const active = trip.protect === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => store.setProtect(trip.id, active ? null : option.key)}
                      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${active ? "border-accent bg-accent text-white" : "border-hair bg-surface text-ink-soft hover:border-ink"}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Disclosure>
      </div>

      <StickyAction meta="Brief ready" note="Roam has 3 distinct directions ready to compare.">
        <Button variant="accent" onClick={() => router.push(`/trips/${trip.id}/destinations`)}>See 3 trip directions →</Button>
      </StickyAction>
    </div>
  );
}
