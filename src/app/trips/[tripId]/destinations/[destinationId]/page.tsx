"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import {
  Button,
  buttonClass,
  Card,
  ConfidenceLabel,
  EmptyState,
  PrototypeBadge,
  RecommendationLabel,
  TradeoffNote,
  useToast,
} from "@/components/ui";
import { WhyThisFits } from "@/components/destinations";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        {title}
      </h2>
      <div className="text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function DestinationDetailPage() {
  const { tripId, destinationId } = useParams<{ tripId: string; destinationId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!hydrated || !trip) {
    return <div className="h-[60vh] rounded-card shimmer" />;
  }
  const p = trip.destinationProposals.find((x) => x.id === destinationId);
  if (!p) {
    return (
      <EmptyState
        title="That proposal isn't here"
        body="It may have been replaced. Head back to the shortlist."
        action={
          <Link href={`/trips/${tripId}/destinations`} className={buttonClass("ink", "sm")}>
            Back to destinations
          </Link>
        }
      />
    );
  }

  const saved = trip.savedProposalIds.includes(p.id);

  return (
    <article className="mx-auto max-w-4xl">
      <Link
        href={`/trips/${tripId}/destinations`}
        className="mb-5 inline-flex text-sm text-muted transition hover:text-ink"
      >
        ← All destinations
      </Link>

      {/* hero */}
      <div className={`relative overflow-hidden rounded-card ${p.heroTone} min-h-[300px]`}>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,22,18,0.6)] to-transparent" />
        <div className="absolute left-6 top-6">
          <RecommendationLabel type={p.recommendationType} />
        </div>
        <div className="absolute inset-x-6 bottom-6 text-white">
          <div className="text-[12px] uppercase tracking-[0.12em] opacity-85">
            {p.region} · {p.recommendedWindow}
          </div>
          <h1 className="mt-1 max-w-[20ch] font-display text-[clamp(28px,4vw,42px)] leading-[1.04] tracking-[-0.03em]">
            {p.conceptTitle}
          </h1>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ConfidenceLabel confidence={p.confidence} />
        <PrototypeBadge />
        <span className="ml-auto font-display text-lg tracking-[-0.02em]">{p.indicativePrice}</span>
      </div>

      {/* advisor note */}
      <Card className="mt-5 p-6">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
          {p.recommendationType === "top" ? "Why I'd choose it" : "Why I would — or wouldn't"}
        </p>
        <p className="editorial mt-2 text-[19px] leading-relaxed text-ink">
          {p.recommendationType === "top"
            ? "Of the three, this is the one I'd book. It's the most complete answer to what you actually asked for."
            : p.recommendationType === "easier"
            ? "I'd choose this if the journey matters more than the escape. It's the smoothest trip — just a touch less resort."
            : "I'd only choose this if you want the drama and have budget headroom. It's the most special, and the most effort."}
        </p>
        <div className="mt-5">
          <WhyThisFits reasons={p.fitReasons} />
        </div>
      </Card>

      {/* details grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="grid gap-5 p-6">
          <Section title="Journey shape">{p.journeyEffort}</Section>
          <Section title="Resort style">{p.resortFit}</Section>
          <Section title="Car-free transport strategy">{p.mobilityFit}</Section>
          <Section title="Weather comfort">{p.weatherComfort}</Section>
        </Card>
        <Card className="grid gap-5 p-6">
          <Section title="One signature experience">{p.signatureExperience}</Section>
          <Section title="One indulgent moment">{p.indulgentMoment}</Section>
          <Section title="One local pleasure">{p.localPleasure}</Section>
          <Section title="Protected downtime">{p.protectedDowntime}</Section>
        </Card>
      </div>

      {/* rhythm */}
      <Card className="mt-6 p-6">
        <h2 className="mb-4 font-display text-xl tracking-[-0.02em]">A light rhythm, not a schedule</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {p.rhythmPreview.map((d) => (
            <li key={d.day} className="flex gap-3 rounded-lg border border-hair bg-surface-2 p-4">
              <span className="font-display text-sm font-semibold text-accent">{d.day}</span>
              <span className="text-[14.5px] text-ink-soft">{d.summary}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* trade-off + unconfirmed */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-3 font-display text-lg tracking-[-0.02em]">An honest trade-off</h2>
          <div className="grid gap-2">
            {p.tradeoffs.map((t) => (
              <TradeoffNote key={t}>{t}</TradeoffNote>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 font-display text-lg tracking-[-0.02em]">Still unconfirmed</h2>
          <ul className="grid gap-2">
            {p.stillUnconfirmed.map((u) => (
              <li key={u} className="flex items-start gap-2 text-[14.5px] text-ink-soft">
                <span aria-hidden className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                {u}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 text-[13px] text-faint">
        Prototype proposal — prices, weather and availability are illustrative and not booked or
        guaranteed.
      </p>

      {/* actions */}
      <div className="sticky bottom-4 mt-8 flex flex-wrap items-center gap-3 rounded-card border border-hair bg-[rgba(255,255,255,0.9)] p-4 backdrop-blur">
        <Button
          variant="accent"
          onClick={() => {
            store.buildTrip(trip.id, p.id);
            toast(`Building your ${p.destination} version…`);
            router.push(`/trips/${trip.id}/workspace`);
          }}
        >
          Build this trip →
        </Button>
        <Button
          variant={saved ? "ghost" : "ink"}
          onClick={() => {
            store.toggleSaveProposal(trip.id, p.id);
            toast(saved ? "Removed from saved" : `Saved ${p.destination}`);
          }}
        >
          {saved ? "Saved ✓" : "Save this direction"}
        </Button>
        <Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ghost")}>
          Compare with the others
        </Link>
      </div>
    </article>
  );
}
