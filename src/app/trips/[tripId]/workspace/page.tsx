"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import {
  Button,
  buttonClass,
  Card,
  ConfidenceLabel,
  EmptyState,
  PrototypeBadge,
  TradeoffNote,
  useToast,
} from "@/components/ui";
import { PRODUCT } from "@/config/product";

interface SlotDef {
  key: string;
  label: string;
  summary: string;
  detail: string;
  seg: string;
  estimate: string;
}

function slotsFor(): SlotDef[] {
  return [
    {
      key: "flights",
      label: "Flights",
      summary: "Daytime, fewest stops",
      detail: "Held to your daytime-departure preference. Fares are illustrative until you book.",
      seg: "flights",
      estimate: "≈ $620 pp",
    },
    {
      key: "stay",
      label: "Stay",
      summary: "The design-led resort",
      detail: "The resort this whole direction was chosen around — one held option, one backup.",
      seg: "stays",
      estimate: "≈ $940 pp",
    },
    {
      key: "transport",
      label: "Ground transport",
      summary: "Car-free, door to door",
      detail: "Private transfers and rail so nobody in the group has to drive.",
      seg: "transport",
      estimate: "≈ $180 pp",
    },
    {
      key: "experiences",
      label: "Experiences",
      summary: "A light, unpacked few",
      detail: "One signature moment, one indulgence, and plenty left open on purpose.",
      seg: "experiences",
      estimate: "included / optional",
    },
  ];
}

function BookingSlot({ tripId, slot }: { tripId: string; slot: SlotDef }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg tracking-[-0.02em]">{slot.label}</h3>
            <span className="rounded-full bg-paper-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
              next
            </span>
          </div>
          <p className="mt-0.5 text-[13px] font-medium text-accent">{slot.summary}</p>
        </div>
        <span className="whitespace-nowrap font-display text-sm tracking-[-0.01em] text-ink-soft">
          {slot.estimate}
        </span>
      </div>
      <p className="text-[14px] leading-relaxed text-muted">{slot.detail}</p>
      <div className="mt-auto pt-1">
        <Link href={`/trips/${tripId}/${slot.seg}`} className={buttonClass("ghost", "sm")}>
          Open {slot.label.toLowerCase()} →
        </Link>
      </div>
    </Card>
  );
}

export default function WorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const { toast } = useToast();

  if (!hydrated || !trip) {
    return (
      <div className="grid gap-5">
        <div className="h-10 w-80 rounded-lg shimmer" />
        <div className="h-40 rounded-card shimmer" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-44 rounded-card shimmer" />
          <div className="h-44 rounded-card shimmer" />
        </div>
      </div>
    );
  }

  const selectedId = trip.selectedProposalId;
  const selected = trip.destinationProposals.find((p) => p.id === selectedId);
  const version = trip.tripVersions.find((v) => v.destinationId === selectedId) ?? trip.tripVersions.at(-1);

  if (!selected) {
    return (
      <div>
        <header className="mb-6 max-w-3xl">
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Booking Workspace
          </p>
          <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">
            Nothing built yet
          </h1>
        </header>
        <EmptyState
          title="Pick a direction first"
          body="Choose one of the three destinations and press “Build this trip.” I'll assemble a coordinated version here — flights, stay, transport and a light plan — all in one place."
          action={
            <Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>
              See where I&apos;d go →
            </Link>
          }
        />
      </div>
    );
  }

  const musts = trip.brief.items.filter((i) => i.level === "must");
  const priorities = trip.brief.items.filter((i) => i.level === "prioritize");
  const slots = slotsFor();

  return (
    <div>
      <header className="mb-6 max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Booking Workspace
          </p>
          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-faint">
            Next feature
          </span>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">
          Your {selected.destination} version
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          One coordinated plan, not four separate bookings. This is the shell — {PRODUCT.name} will fill
          in flights, stay and transport together so they actually fit each other, and so nothing
          quietly breaks a “must.”
        </p>
      </header>

      {/* summary band */}
      <div className={`relative mb-6 overflow-hidden rounded-card ${selected.heroTone} p-6`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(20,22,18,0.55)] to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 text-white">
          <div>
            <div className="text-[12px] uppercase tracking-[0.12em] opacity-85">
              {selected.region} · {selected.recommendedWindow}
            </div>
            <h2 className="mt-1 max-w-[22ch] font-display text-2xl leading-tight tracking-[-0.02em] md:text-3xl">
              {selected.conceptTitle}
            </h2>
            {version && (
              <p className="mt-2 text-[13px] opacity-85">
                Working from “{version.label}” · saved {new Date(version.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            href={`/trips/${trip.id}/destinations/${selected.id}`}
            className="rounded-full bg-[rgba(255,255,255,0.16)] px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-[rgba(255,255,255,0.26)]"
          >
            Revisit the proposal
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* left: the build */}
        <div className="grid gap-6">
          <div>
            <h2 className="mb-3 font-display text-xl tracking-[-0.02em]">What I&apos;d coordinate</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {slots.map((s) => (
                <BookingSlot key={s.key} tripId={trip.id} slot={s} />
              ))}
            </div>
          </div>

          <Card className="p-6">
            <h2 className="mb-3 font-display text-lg tracking-[-0.02em]">Why this version works</h2>
            <div className="grid gap-2.5">
              {selected.fitReasons.thisTrip.map((r) => (
                <p key={r} className="flex items-start gap-2 text-[14.5px] text-ink-soft">
                  <span aria-hidden className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {r}
                </p>
              ))}
            </div>
            {selected.tradeoffs.length > 0 && (
              <div className="mt-4 border-t border-hair pt-4">
                {selected.tradeoffs.map((t) => (
                  <TradeoffNote key={t}>{t}</TradeoffNote>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* right: the trip tray */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg tracking-[-0.02em]">Trip Tray</h2>
              <ConfidenceLabel confidence={selected.confidence} />
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Everything held together for {trip.travelers} travelers.
            </p>

            <dl className="mt-4 grid gap-2 text-[14px]">
              {slots.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <dt className="text-muted">{s.label}</dt>
                  <dd className="text-ink-soft">{s.estimate}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 border-t border-hair pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-faint">
                  Estimated total
                </span>
                <span className="font-display text-xl tracking-[-0.02em]">
                  {selected.indicativePrice}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-faint">
                Illustrative prototype pricing — not a quote, nothing is booked or charged.
              </p>
            </div>

            <div className="mt-5 grid gap-2.5">
              <Button
                variant="accent"
                onClick={() =>
                  toast("Prototype — I'd take you to review before anything is confirmed.")
                }
              >
                Review this version
              </Button>
              <Link href={`/trips/${trip.id}/versions`} className={buttonClass("ghost", "sm")}>
                Compare versions
              </Link>
            </div>

            <p className="mt-4 text-[11.5px] leading-relaxed text-faint">
              I won&apos;t book anything or move money without your say-so — this is a planning shell only.
            </p>
          </Card>

          <div className="mt-4">
            <h3 className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
              Still protecting
            </h3>
            <ul className="grid gap-1.5">
              {musts.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-start gap-2 text-[13.5px] text-ink-soft">
                  <span aria-hidden className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                  {m.statement}
                </li>
              ))}
              {priorities.slice(0, 2).map((m) => (
                <li key={m.id} className="flex items-start gap-2 text-[13.5px] text-muted">
                  <span aria-hidden className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {m.statement}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <p className="mt-8 text-[13px] text-faint">
        Booking Workspace is the next feature to be built out — flights, stays, transport and experiences
        are designed placeholders here so the full architecture is visible.
      </p>
    </div>
  );
}
