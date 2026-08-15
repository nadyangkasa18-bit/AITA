"use client";

import Link from "next/link";
import { buttonClass, Card, PrototypeBadge, SourceTag } from "@/components/ui";
import { travelerProfile } from "@/lib/mock/seed";

const SCOPE_COPY: Record<string, { label: string; cls: string }> = {
  all: { label: "Every trip", cls: "bg-accent-tint text-accent" },
  similar: { label: "Similar trips", cls: "bg-amber-tint text-amber" },
  "this-trip": { label: "This trip only", cls: "bg-paper-2 text-ink-soft" },
};

export default function PreferencesPage() {
  const prefs = travelerProfile.preferences;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Traveler Profile · Preferences
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Your preferences</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Long-term preferences are kept apart from any one trip&apos;s requirements. Each shows where it
          came from and how far it reaches. Editing them is part of the next feature — here they&apos;re
          shown read-only so you can see the model.
        </p>
      </header>

      <div className="grid gap-3">
        {prefs.map((pref) => {
          const scope = SCOPE_COPY[pref.scope];
          return (
            <Card key={pref.id} className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                  {pref.category}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${scope.cls}`}>
                  {scope.label}
                </span>
                <span className="ml-auto text-[11px] text-faint">
                  {Math.round(pref.confidence * 100)}% confident
                </span>
              </div>
              <p className="text-[16px] text-ink">{pref.statement}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <SourceTag source={pref.source} />
                {pref.lastConfirmedAt && (
                  <span className="text-[11.5px] text-faint">
                    Last confirmed {new Date(pref.lastConfirmedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link href="/profile" className={buttonClass("ghost", "sm")}>
          ← Traveler Profile
        </Link>
        <Link href="/profile/calibrate" className={buttonClass("ink", "sm")}>
          Calibrate these
        </Link>
      </div>
    </div>
  );
}
