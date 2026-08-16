"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, buttonClass, Eyebrow, LevelTag, PrototypeBadge, useToast } from "@/components/ui";
import { PREF_CATEGORIES } from "@/lib/types";
import type { LoyaltyEntry, PrefCategory, PrefPriority, PrefScope, ProfilePref } from "@/lib/types";

const PRIORITIES: { key: PrefPriority; label: string }[] = [
  { key: "always", label: "Always prioritize" },
  { key: "usually", label: "Usually prefer" },
  { key: "flexible", label: "Flexible" },
  { key: "avoid", label: "Avoid" },
];
const SCOPES: { key: PrefScope; label: string }[] = [
  { key: "all", label: "All trips" },
  { key: "similar", label: "Trips like this" },
  { key: "this-trip", label: "This trip only" },
  { key: "none", label: "Don't save" },
];
const SOURCE_LABEL: Record<string, string> = {
  onboarding: "Onboarding choice",
  added: "Added by you",
  confirmed: "Confirmed from a decision",
};

function PrefRow({ pref }: { pref: ProfilePref }) {
  const store = useStore();
  return (
    <div className="rounded-lg border border-hair bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex flex-col gap-1">
          <button
            aria-label="Move up"
            onClick={() => store.reorderPref(pref.id, -1)}
            className="grid h-5 w-5 place-items-center rounded text-faint transition hover:bg-hair-2 hover:text-ink"
          >
            ↑
          </button>
          <button
            aria-label="Move down"
            onClick={() => store.reorderPref(pref.id, 1)}
            className="grid h-5 w-5 place-items-center rounded text-faint transition hover:bg-hair-2 hover:text-ink"
          >
            ↓
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <input
            defaultValue={pref.statement}
            onBlur={(e) =>
              store.updatePref(pref.id, { statement: e.target.value.trim() || pref.statement })
            }
            aria-label="Preference wording"
            className="w-full bg-transparent text-[15px] text-ink outline-none focus-visible:text-accent"
          />
          <div className="mt-1 flex items-center gap-2">
            <LevelTag level={pref.priority} />
            <span className="text-[11.5px] text-faint">{SOURCE_LABEL[pref.source]}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={`pri-${pref.id}`}>
              Priority
            </label>
            <select
              id={`pri-${pref.id}`}
              value={pref.priority}
              onChange={(e) => store.movePrefPriority(pref.id, e.target.value as PrefPriority)}
              className="rounded-full border border-hair bg-surface px-2.5 py-1 text-[12px] text-ink-soft outline-none"
            >
              {PRIORITIES.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`scope-${pref.id}`}>
              Scope
            </label>
            <select
              id={`scope-${pref.id}`}
              value={pref.scope}
              onChange={(e) => store.setPrefScope(pref.id, e.target.value as PrefScope)}
              className="rounded-full border border-hair bg-surface px-2.5 py-1 text-[12px] text-ink-soft outline-none"
            >
              {SCOPES.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => store.deletePref(pref.id)}
              className="ml-auto text-[12.5px] font-medium text-muted transition hover:text-[#8a4b3f]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPref({ category }: { category: PrefCategory }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<PrefPriority>("usually");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13.5px] font-medium text-accent transition hover:text-accent-press"
      >
        + Add a preference
      </button>
    );
  }
  return (
    <div className="rounded-lg border border-hair bg-surface-2 p-3">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Prefer boutique hotels over big chains"
        className="w-full rounded-md border border-hair bg-surface px-3 py-2 text-[14px] outline-none focus-visible:border-accent"
      />
      <div className="mt-2 flex items-center gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as PrefPriority)}
          className="rounded-full border border-hair bg-surface px-2.5 py-1 text-[12px] text-ink-soft outline-none"
        >
          {PRIORITIES.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          onClick={() => {
            if (text.trim()) {
              store.addPref({
                category,
                statement: text.trim(),
                priority,
                scope: "all",
                source: "added",
                confidence: 0.6,
              });
            }
            setText("");
            setOpen(false);
          }}
        >
          Add
        </Button>
        <button
          onClick={() => {
            setText("");
            setOpen(false);
          }}
          className="text-[12.5px] text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function LoyaltyBlock({ loyalty }: { loyalty: LoyaltyEntry[] }) {
  const store = useStore();
  const [name, setName] = useState("");
  return (
    <div className="mt-3 border-t border-hair-2 pt-3">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
        Memberships
      </p>
      {loyalty.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {loyalty.map((l) => (
            <button
              key={l.id}
              onClick={() => store.removeLoyalty(l.id)}
              className="rounded-full border border-hair px-3 py-1.5 text-[13px] text-ink-soft transition hover:border-ink"
            >
              {l.name} ✕
            </button>
          ))}
        </div>
      ) : (
        <p className="mb-2 text-[13px] text-faint">None added.</p>
      )}
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              store.addLoyalty({ name: name.trim(), kind: "other" });
              setName("");
            }
          }}
          placeholder="Add a program…"
          className="w-full rounded-md border border-hair bg-surface px-3 py-1.5 text-[13.5px] outline-none focus-visible:border-accent"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (name.trim()) store.addLoyalty({ name: name.trim(), kind: "other" });
            setName("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: PrefCategory }) {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const prefs = store.profile.prefs
    .filter((p) => p.category === category)
    .sort((a, b) => a.order - b.order);
  const isLoyalty = category === "Loyalty";
  const count = prefs.length + (isLoyalty ? store.profile.loyalty.length : 0);
  const summary =
    count === 0
      ? "Nothing yet"
      : prefs[0]?.statement ??
        (isLoyalty ? `${store.profile.loyalty.length} membership(s)` : `${count} preference(s)`);

  return (
    <div className="overflow-hidden rounded-card border border-hair bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-[-0.02em]">{category}</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-paper-2 px-1.5 text-[11px] font-semibold text-ink-soft">
                {count}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">{summary}</p>
        </div>
        <span aria-hidden className={`text-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && (
        <div className="disclose border-t border-hair-2 px-5 pb-5 pt-4">
          <div className="grid gap-2.5">
            {prefs.map((p) => (
              <PrefRow key={p.id} pref={p} />
            ))}
          </div>
          <div className="mt-3">
            <AddPref category={category} />
          </div>
          {isLoyalty && <LoyaltyBlock loyalty={store.profile.loyalty} />}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!store.hydrated) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-12 md:px-8">
        <div className="h-10 w-56 rounded-lg shimmer" />
        <div className="mt-6 grid gap-3">
          <div className="h-16 rounded-card shimmer" />
          <div className="h-16 rounded-card shimmer" />
        </div>
      </div>
    );
  }

  const { profile } = store;

  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 md:px-8 md:py-16">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Eyebrow>Traveler Profile</Eyebrow>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-[clamp(30px,5vw,46px)] tracking-[-0.035em]">
          How you like to travel
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          What Roam has learned, kept apart from any single trip. Everything here is editable, and
          nothing changes without you. Categories are collapsed — open one to refine it.
        </p>
      </header>

      {!profile.calibrated && (
        <div className="mb-6 rounded-card border border-accent-line bg-accent-tint/50 p-5">
          <p className="text-[15px] text-ink">Your profile isn&apos;t calibrated yet.</p>
          <Link href="/calibrate" className={`mt-3 ${buttonClass("accent", "sm")}`}>
            Calibrate now →
          </Link>
        </div>
      )}

      <div className="grid gap-3">
        {PREF_CATEGORIES.map((c) => (
          <CategorySection key={c} category={c} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          onClick={() => {
            store.resetCalibration();
            toast("Calibration reset — starting fresh.");
            router.push("/calibrate");
          }}
          className="text-[13.5px] font-medium text-muted transition hover:text-[#8a4b3f]"
        >
          Reset calibration demo
        </button>
        <Link href="/settings" className="text-[13.5px] font-medium text-muted hover:text-ink">
          Settings
        </Link>
      </div>
    </div>
  );
}
