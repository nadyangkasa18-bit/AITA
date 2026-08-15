"use client";

import Link from "next/link";
import { buttonClass, Card, PrototypeBadge, SourceTag } from "@/components/ui";
import { travelerProfile } from "@/lib/mock/seed";
import { PRODUCT } from "@/config/product";

const SCOPE_COPY: Record<string, string> = {
  all: "Applies to every trip",
  similar: "Applies to similar trips",
  "this-trip": "This trip only",
};

export default function ProfilePage() {
  const p = travelerProfile;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Traveler Profile
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">{p.name}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          What {PRODUCT.name} has learned about how you like to travel — kept separate from any single
          trip, and never quietly changed without you. This is the memory behind every &ldquo;because you
          usually&hellip;&rdquo;
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Home airport
          </h2>
          <p className="mt-1 font-display text-lg tracking-[-0.02em]">{p.homeAirport}</p>
        </Card>
        <Card className="p-5">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Usual party
          </h2>
          <p className="mt-1 font-display text-lg tracking-[-0.02em]">
            {p.partyDefaults.travelers} travelers
          </p>
          {p.partyDefaults.notes && (
            <p className="mt-0.5 text-[13px] text-muted">{p.partyDefaults.notes}</p>
          )}
        </Card>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl tracking-[-0.02em]">How you like to travel</h2>
          <Link href="/profile/preferences" className="text-sm text-accent hover:underline">
            Manage →
          </Link>
        </div>
        <div className="grid gap-3">
          {p.preferences.map((pref) => (
            <Card key={pref.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {pref.category}
                  </span>
                  <span className="text-[11px] text-faint">{SCOPE_COPY[pref.scope]}</span>
                </div>
                <p className="text-[15px] text-ink">{pref.statement}</p>
                <div className="mt-1.5">
                  <SourceTag source={pref.source} />
                </div>
              </div>
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-faint">
                {pref.strength}
              </span>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/profile/calibrate"
          className="rounded-card border border-hair bg-surface p-4 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-card)]"
        >
          <div className="font-display text-base tracking-[-0.02em]">Calibrate</div>
          <p className="mt-1 text-[13px] text-muted">Teach me with quick this-or-that choices.</p>
          <span className="mt-2 inline-block rounded-full bg-paper-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
            Next
          </span>
        </Link>
        <Link
          href="/profile/preferences"
          className="rounded-card border border-hair bg-surface p-4 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-card)]"
        >
          <div className="font-display text-base tracking-[-0.02em]">Preferences</div>
          <p className="mt-1 text-[13px] text-muted">Review scope and provenance for each one.</p>
        </Link>
        <Link
          href="/profile/loyalty"
          className="rounded-card border border-hair bg-surface p-4 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-card)]"
        >
          <div className="font-display text-base tracking-[-0.02em]">Loyalty</div>
          <p className="mt-1 text-[13px] text-muted">Airline and hotel programs on file.</p>
        </Link>
      </div>

      <div className="mt-6">
        <Link href="/" className={buttonClass("ghost", "sm")}>
          ← Back to start
        </Link>
      </div>
    </div>
  );
}
