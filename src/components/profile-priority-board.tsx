"use client";

import { useEffect, useState } from "react";
import type { ProfilePref } from "@/lib/types";
import { Button, Eyebrow } from "@/components/ui";
import { StickyAction } from "@/components/sticky-action";

const SOURCE_LABEL: Record<string, string> = {
  onboarding: "Onboarding choice",
  added: "Added by you",
  confirmed: "Confirmed from a decision",
};

const BOARD_GROUPS: { key: ProfilePref["priority"]; label: string; helper: string }[] = [
  { key: "always", label: "Must-have", helper: "Protect these first." },
  { key: "usually", label: "Prioritize", helper: "Important, but worth trading when needed." },
  { key: "flexible", label: "Flexible", helper: "Useful context, not a constraint." },
];

const ALL_GROUPS: { key: ProfilePref["priority"]; label: string }[] = [
  ...BOARD_GROUPS.map(({ key, label }) => ({ key, label })),
  { key: "avoid", label: "Avoid" },
];

function PreferenceCard({
  pref,
  onSave,
}: {
  pref: ProfilePref;
  onSave: (id: string, patch: Partial<ProfilePref>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState(pref.statement);
  const [priority, setPriority] = useState(pref.priority);

  useEffect(() => {
    setStatement(pref.statement);
    setPriority(pref.priority);
  }, [pref.statement, pref.priority]);

  const save = () => {
    onSave(pref.id, {
      statement: statement.trim() || pref.statement,
      priority,
    });
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
        <span className="min-w-0">
          <span className="block text-[14.5px] font-medium leading-snug text-ink">{pref.statement}</span>
          <span className="mt-1.5 block text-[11.5px] text-faint">
            {pref.category} · {SOURCE_LABEL[pref.source] ?? "Preference"}
          </span>
        </span>
        <span className="mt-0.5 text-[12px] text-faint" aria-hidden>{open ? "Close" : "Edit"}</span>
      </button>

      {open && (
        <div className="disclose border-t border-hair-2 p-4">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
            Preference
          </label>
          <input
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            className="mt-2 w-full rounded-lg border border-hair bg-surface-2 px-3 py-2.5 text-[14px] outline-none focus-visible:border-accent"
            aria-label="Preference wording"
          />
          <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
            Importance
          </label>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as ProfilePref["priority"])}
            className="mt-2 w-full rounded-lg border border-hair bg-surface px-3 py-2.5 text-[13.5px] text-ink outline-none focus-visible:border-accent"
            aria-label="Preference importance"
          >
            {ALL_GROUPS.map((group) => (
              <option key={group.key} value={group.key}>{group.label}</option>
            ))}
          </select>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setStatement(pref.statement);
                setPriority(pref.priority);
                setOpen(false);
              }}
              className="text-[13px] font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <Button size="sm" variant="ink" onClick={save}>Save</Button>
          </div>
        </div>
      )}
    </article>
  );
}

export function ProfilePriorityBoard({
  initial,
  onBack,
  onConfirm,
  onEdit,
}: {
  initial: ProfilePref[];
  onBack: () => void;
  onConfirm: (prefs: ProfilePref[]) => void;
  onEdit: (prefs: ProfilePref[]) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const savePref = (id: string, patch: Partial<ProfilePref>) => {
    setDraft((current) => current.map((pref) => pref.id === id ? { ...pref, ...patch } : pref));
  };
  const avoids = draft.filter((pref) => pref.priority === "avoid");

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8 md:py-12">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back</button>
        <Eyebrow>Your profile</Eyebrow>
      </div>

      <div className="mx-auto mt-8 max-w-[760px] text-center">
        <h1 className="font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]">
          Your travel preferences
        </h1>
        <p className="mx-auto mt-4 max-w-[58ch] text-[16px] leading-relaxed text-muted">
          Review the buckets at a glance. Open any item to edit it, then save before it moves somewhere else.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {BOARD_GROUPS.map((group) => {
          const rows = draft.filter((pref) => pref.priority === group.key);
          return (
            <section key={group.key} className="rounded-[22px] border border-hair bg-surface-2 p-4 md:p-5">
              <div className="flex items-end justify-between gap-3 border-b border-hair-2 pb-4">
                <div>
                  <h2 className="font-display text-[21px] font-semibold tracking-[-0.025em]">{group.label}</h2>
                  <p className="mt-1 text-[12.5px] leading-snug text-muted">{group.helper}</p>
                </div>
                <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{rows.length}</span>
              </div>
              <div className="mt-4 grid gap-3">
                {rows.length > 0 ? rows.map((pref) => (
                  <PreferenceCard key={pref.id} pref={pref} onSave={savePref} />
                )) : (
                  <p className="rounded-[14px] border border-dashed border-hair px-4 py-5 text-center text-[12.5px] text-faint">Nothing here yet.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-5 rounded-[22px] border border-hair bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>Avoid</Eyebrow>
            <h2 className="mt-1 font-display text-[21px] font-semibold tracking-[-0.025em]">Things to steer around</h2>
          </div>
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{avoids.length}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {avoids.length > 0 ? avoids.map((pref) => (
            <PreferenceCard key={pref.id} pref={pref} onSave={savePref} />
          )) : <p className="text-[13px] text-faint">No hard avoids added.</p>}
        </div>
      </section>

      <StickyAction
        meta={`${draft.length} preferences reviewed`}
        note="Nothing is permanent — you can change this profile anytime."
      >
        <button onClick={() => onEdit(draft)} className="px-3 py-2 text-[13.5px] font-semibold text-muted transition hover:text-ink">
          Open full profile
        </button>
        <Button variant="accent" onClick={() => onConfirm(draft)}>Save profile & start planning →</Button>
      </StickyAction>
    </div>
  );
}
