"use client";

import Link from "next/link";
import { buttonClass, Card, PrototypeBadge } from "@/components/ui";
import { travelerProfile } from "@/lib/mock/seed";

const KIND_COPY: Record<string, string> = {
  airline: "Airline",
  hotel: "Hotel",
  other: "Other",
};

export default function LoyaltyPage() {
  const programs = travelerProfile.loyaltyPrograms;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Traveler Profile · Loyalty
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Loyalty programs</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Programs on file so recommendations can lean toward what you already earn on. In this
          prototype they&apos;re illustrative and never connect to a real account.
        </p>
      </header>

      <div className="grid gap-3">
        {programs.map((prog) => (
          <Card key={prog.id} className="flex items-center justify-between gap-4 p-5">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {KIND_COPY[prog.kind]}
                </span>
                {prog.tier && (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                    {prog.tier}
                  </span>
                )}
              </div>
              <p className="font-display text-lg tracking-[-0.02em]">{prog.name}</p>
            </div>
            {prog.member && <span className="font-mono text-[13px] text-faint">{prog.member}</span>}
          </Card>
        ))}
      </div>

      <p className="mt-5 text-[13px] text-faint">
        Prototype data — no loyalty account is linked, and no points are read or spent.
      </p>

      <div className="mt-6">
        <Link href="/profile" className={buttonClass("ghost", "sm")}>
          ← Traveler Profile
        </Link>
      </div>
    </div>
  );
}
