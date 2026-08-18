"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BriefLevel, ProtectChoice, Trip, TripBriefItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button, Disclosure, Eyebrow } from "@/components/ui";
import { StickyAction } from "@/components/sticky-action";
import { PRODUCT } from "@/config/product";

const BOARD_LEVELS: { level: BriefLevel; label: string; helper: string }[] = [
  { level: "must", label: "Must-have", helper: `Non-negotiables. ${PRODUCT.name} should never trade these away.` },
  { level: "prioritize", label: "Prioritize", helper: "Important, but worth balancing against the whole trip." },
  { level: "flexible", label: "Flexible", helper: `Preferences ${PRODUCT.name} can negotiate when there is a better fit.` },
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
  const list = lead.length <= 1 ? lead[0] ?? "a trip that fits how you travel" : `${lead.slice(0, -1).join(", ")} and ${lead[lead.length - 1]}`;
  return `A trip built around ${list} — with the details left open until they matter.`;
}

function ConstraintCard({ tripId, item }: { tripId: string; item: TripBriefItem }) {
  const store = useStore();
  const [text, setText] = useState(item.statement);
  const [editing, setEditing] = useState(false);

  useEffect(() => setText(item.statement), [item.statement]);

  const save = () => {
    const next = text.trim();
    if (next && next !== item.statement) store.editBriefItem(tripId, item.id, next);
    else setText(item.statement);
    setEditing(false);
  };

  return (
    <article
      draggable={!editing}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/brief-item", item.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="group rounded-[16px] border border-hair bg-surface p-4 shadow-[var(--shadow-card)] transition hover:border-ink/20"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 cursor-grab select-none text-[15px] text-faint group-active:cursor-grabbing" aria-hidden>⋮⋮</span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <textarea
              autoFocus
              value={text}
              rows={3}
              onChange={(event) => setText(event.target.value)}
              onBlur={save}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") save();
                if (event.key === "Escape") { setText(item.statement); setEditing(false); }
              }}
              className="w-full resize-none rounded-lg border border-accent-line bg-surface-2 px-3 py-2.5 text-[14px] font-medium leading-snug text-ink outline-none focus-visible:border-accent"
            />
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="w-full text-left text-[14.5px] font-medium leading-snug text-ink">
              {item.statement}
            </button>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[11px] text-faint">{editing ? "⌘ Enter to save · Esc to cancel" : "Click text to edit"}</span>
            <button type="button" onClick={() => store.removeBriefItem(tripId, item.id)} className="text-[11.5px] font-semibold text-faint opacity-0 transition hover:text-[#8a4b3f] group-hover:opacity-100">Remove</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function AddDetail({ tripId }: { tripId: string }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<BriefLevel>("prioritize");
  if (!open) return <button onClick={() => setOpen(true)} className="text-[13.5px] font-semibold text-accent transition hover:text-accent-press">+ Add another detail</button>;
  const add = () => {
    if (!text.trim()) return;
    store.addBriefItem(tripId, text.trim(), level);
    setText(""); setLevel("prioritize"); setOpen(false);
  };
  return (
    <div className="rounded-[18px] border border-accent-line bg-accent-tint/35 p-4">
      <input autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder="e.g. we'd love a spa, or keep flights under 8 hours" onKeyDown={(event) => { if (event.key === "Enter") add(); if (event.key === "Escape") setOpen(false); }} className="w-full rounded-lg border border-hair bg-surface px-3 py-2.5 text-[14px] outline-none focus-visible:border-accent" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LEVELS.map((option) => <button key={option.level} type="button" onClick={() => setLevel(option.level)} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${level === option.level ? "border-accent bg-accent text-white" : "border-hair bg-surface text-muted"}`}>{option.label}</button>)}
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
  const [dragOver, setDragOver] = useState<BriefLevel | null>(null);

  const dropInto = (event: React.DragEvent, level: BriefLevel) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/brief-item");
    if (id) store.setBriefLevel(trip.id, id, level);
    setDragOver(null);
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow>Your trip brief</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(34px,5vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]">Here&apos;s what matters</h1>
        <p className="mx-auto mt-4 max-w-[58ch] text-[17px] leading-relaxed text-muted">{summarize(trip)}</p>
        <p className="mt-3 text-[12.5px] text-faint">Drag anything between columns to change how strongly {PRODUCT.name} should protect it.</p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {BOARD_LEVELS.map((group) => {
          const items = trip.brief.items.filter((item) => item.level === group.level);
          const active = dragOver === group.level;
          return (
            <section key={group.level} onDragOver={(event) => { event.preventDefault(); setDragOver(group.level); }} onDragLeave={() => setDragOver(null)} onDrop={(event) => dropInto(event, group.level)} className={`rounded-[22px] border p-4 transition md:p-5 ${active ? "border-accent bg-accent-tint/30" : "border-hair bg-surface-2"}`}>
              <div className="flex items-end justify-between gap-3 border-b border-hair-2 pb-4">
                <div><h2 className="font-display text-[21px] font-semibold tracking-[-0.025em]">{group.label}</h2><p className="mt-1 text-[12.5px] leading-snug text-muted">{group.helper}</p></div>
                <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{items.length}</span>
              </div>
              <div className="mt-4 grid min-h-[140px] gap-3 content-start">
                {items.length > 0 ? items.map((item) => <ConstraintCard key={item.id} tripId={trip.id} item={item} />) : <p className="rounded-[14px] border border-dashed border-hair px-4 py-8 text-center text-[12.5px] text-faint">Drop something here.</p>}
              </div>
            </section>
          );
        })}
      </div>

      <section onDragOver={(event) => { event.preventDefault(); setDragOver("avoid"); }} onDragLeave={() => setDragOver(null)} onDrop={(event) => dropInto(event, "avoid")} className={`mt-5 rounded-[22px] border p-5 transition ${dragOver === "avoid" ? "border-[#a36d63] bg-[#f5e8e5]" : "border-hair bg-surface"}`}>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>Avoid</Eyebrow><h2 className="mt-1 font-display text-[21px] font-semibold tracking-[-0.025em]">Things that would make this trip worse</h2></div><span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{avoids.length}</span></div>
        <div className="mt-4 grid min-h-[80px] gap-3 md:grid-cols-2 lg:grid-cols-3">{avoids.length > 0 ? avoids.map((item) => <ConstraintCard key={item.id} tripId={trip.id} item={item} />) : <p className="text-[13px] text-faint">Drop a hard avoid here.</p>}</div>
      </section>

      <div className="mt-6"><AddDetail tripId={trip.id} /></div>

      <div className="mt-8">
        <Disclosure label="Assumptions & what to protect">
          <div className="grid gap-7 md:grid-cols-2">
            <div><p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">What I&apos;m assuming</p><div className="rounded-lg border border-hair bg-surface">{trip.brief.assumptions.map((assumption) => <div key={assumption.id} className="flex items-center justify-between gap-4 border-b border-hair-2 px-4 py-3 last:border-b-0"><span className="text-[12.5px] font-medium text-faint">{assumption.label}</span><input defaultValue={assumption.value} onBlur={(event) => store.editAssumption(trip.id, assumption.id, event.target.value.trim() || assumption.value)} className="w-44 rounded-md bg-transparent px-2 py-1 text-right text-[13.5px] text-ink outline-none focus-visible:bg-surface-2" /></div>)}</div></div>
            <div><p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">Protect above everything else</p><div className="flex flex-wrap gap-2">{PROTECT.map((option) => { const active = trip.protect === option.key; return <button key={option.key} onClick={() => store.setProtect(trip.id, active ? null : option.key)} className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${active ? "border-accent bg-accent text-white" : "border-hair bg-surface text-ink-soft hover:border-ink"}`}>{option.label}</button>; })}</div></div>
          </div>
        </Disclosure>
      </div>

      <StickyAction meta="Brief ready" note={`${PRODUCT.name} has 3 distinct concepts ready to compare.`}><Button variant="accent" onClick={() => router.push(`/trips/${trip.id}/destinations`)}>See 3 trip concepts →</Button></StickyAction>
    </div>
  );
}
