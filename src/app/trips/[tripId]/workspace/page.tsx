"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import { Photo } from "@/components/photo";
import {
  Button,
  buttonClass,
  ConfidenceLabel,
  Eyebrow,
  EmptyState,
  PrototypeBadge,
  useToast,
} from "@/components/ui";
import type { DestinationProposal } from "@/lib/types";

type ModuleId = "stay" | "flights" | "experiences";

function Module({
  id,
  title,
  status,
  decided,
  open,
  onToggle,
  children,
}: {
  id: ModuleId;
  title: string;
  status: string;
  decided: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-hair bg-surface">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`mod-${id}`}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-xl tracking-[-0.02em]">{title}</span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
              decided ? "bg-accent-tint text-accent" : "bg-amber-tint text-amber"
            }`}
          >
            {status}
          </span>
        </div>
        <span aria-hidden className={`text-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && (
        <div id={`mod-${id}`} className="disclose border-t border-hair-2 px-6 pb-6 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [openModule, setOpenModule] = useState<ModuleId>("stay");

  if (!hydrated || !trip) {
    return (
      <div className="grid gap-5">
        <div className="h-[42vh] rounded-card shimmer" />
        <div className="h-24 rounded-card shimmer" />
        <div className="h-40 rounded-card shimmer" />
      </div>
    );
  }

  const selected: DestinationProposal | undefined = trip.destinationProposals.find(
    (p) => p.id === trip.selectedProposalId
  );

  if (!selected) {
    return (
      <EmptyState
        title="Your trip isn't started yet"
        body="Pick a direction and press “Start with this trip.” I'll assemble a coordinated plan here — stay, flights and a light rhythm, all in one place."
        action={
          <Link href={`/trips/${trip.id}/destinations`} className={buttonClass("accent", "sm")}>
            See my recommendation →
          </Link>
        }
      />
    );
  }

  const toggle = (m: ModuleId) => setOpenModule((cur) => (cur === m ? cur : m));

  return (
    <div>
      {/* hero */}
      <div className="relative">
        <Photo
          image={selected.heroImage}
          ratio="hero"
          tone={selected.heroTone}
          width={1800}
          rounded="rounded-card"
          priority
          className="max-h-[44vh]"
        />
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white">
          <div>
            <span className="rounded-full bg-[rgba(20,22,18,0.5)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
              Trip started
            </span>
            <h1 className="mt-2 font-display text-[clamp(26px,4vw,40px)] leading-tight tracking-[-0.03em] drop-shadow">
              {selected.destination}
            </h1>
          </div>
          <Link
            href={`/trips/${trip.id}/destinations/${selected.id}`}
            className="hidden rounded-full bg-[rgba(255,255,255,0.18)] px-4 py-2 text-[13px] font-semibold backdrop-blur transition hover:bg-[rgba(255,255,255,0.28)] sm:block"
          >
            Revisit the proposal
          </Link>
        </div>
      </div>

      {/* status + recommended next action */}
      <div className="measure mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow>Trip workspace</Eyebrow>
          <ConfidenceLabel confidence={selected.confidence} />
          <PrototypeBadge />
        </div>
        <p className="mt-3 text-[18px] leading-relaxed text-ink-soft">
          Your {selected.destination} trip now exists as a draft. Here&apos;s what&apos;s in place and the
          one thing I&apos;d decide next — nothing is booked or charged.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
              Estimated total
            </div>
            <div className="mt-1 font-display text-2xl tracking-[-0.02em]">
              {selected.indicativePrice}
            </div>
          </div>
          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
              Selected
            </div>
            <div className="mt-1 text-[15px] text-ink">The {selected.destination} direction</div>
          </div>
          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
              Still to decide
            </div>
            <div className="mt-1 text-[15px] text-ink">Stay · flights · experiences</div>
          </div>
        </div>

        {/* one recommended next action */}
        <div className="mt-7 rounded-card border border-accent-line bg-accent-tint/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent">
                Recommended next
              </div>
              <p className="mt-1 text-[16px] text-ink">
                Confirm your stay — it&apos;s the choice everything else fits around.
              </p>
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setOpenModule("stay");
                toast("Prototype — I'd walk you through confirming the stay here.");
              }}
            >
              Review the stay
            </Button>
          </div>
        </div>
      </div>

      {/* modules */}
      <div className="measure mt-8 grid gap-4">
        <Module
          id="stay"
          title="Stay"
          status="Needs a decision"
          decided={false}
          open={openModule === "stay"}
          onToggle={() => toggle("stay")}
        >
          <Photo
            image={selected.stay.image}
            ratio="hero"
            tone={selected.heroTone}
            width={1200}
            rounded="rounded-lg"
            className="max-h-[40vh]"
          />
          <div className="mt-4">
            <div className="font-display text-lg tracking-[-0.02em]">{selected.stay.name}</div>
            <div className="text-[13px] text-muted">{selected.stay.location}</div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{selected.stay.why}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="font-display text-lg tracking-[-0.02em]">{selected.stay.price}</span>
              <Link href={`/trips/${trip.id}/stays`} className="text-[14px] font-semibold text-accent">
                Open stay details →
              </Link>
            </div>
          </div>
        </Module>

        <Module
          id="flights"
          title="Flights"
          status="Held to daytime"
          decided={false}
          open={openModule === "flights"}
          onToggle={() => toggle("flights")}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg tracking-[-0.02em]">{selected.flight.route}</div>
              <div className="text-[13px] text-muted">{selected.flight.airline}</div>
            </div>
            <span className="font-display text-lg tracking-[-0.02em]">{selected.flight.price}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[13px]">
            <div className="rounded-lg bg-surface-2 py-2">
              <div className="font-semibold text-ink">{selected.flight.depart}</div>
              <div className="text-[11px] text-faint">Depart</div>
            </div>
            <div className="rounded-lg bg-surface-2 py-2">
              <div className="font-semibold text-ink">{selected.flight.duration}</div>
              <div className="text-[11px] text-faint">{selected.flight.stops}</div>
            </div>
            <div className="rounded-lg bg-surface-2 py-2">
              <div className="font-semibold text-ink">{selected.flight.arrive}</div>
              <div className="text-[11px] text-faint">Arrive</div>
            </div>
          </div>
          <Link
            href={`/trips/${trip.id}/flights`}
            className="mt-4 inline-block text-[14px] font-semibold text-accent"
          >
            Open flight options →
          </Link>
        </Module>

        <Module
          id="experiences"
          title="Experiences"
          status="A light few"
          decided={false}
          open={openModule === "experiences"}
          onToggle={() => toggle("experiences")}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {selected.moments.map((m) => (
              <figure key={m.title}>
                <Photo
                  image={m.image}
                  ratio="4/3"
                  tone={selected.heroTone}
                  width={700}
                  rounded="rounded-lg"
                />
                <figcaption className="mt-2">
                  <div className="text-[14px] font-semibold text-ink">{m.title}</div>
                  <p className="text-[13px] leading-snug text-muted">{m.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <Link
            href={`/trips/${trip.id}/experiences`}
            className="mt-4 inline-block text-[14px] font-semibold text-accent"
          >
            Open experiences →
          </Link>
        </Module>
      </div>

      <p className="measure mt-8 text-[13px] text-faint">
        Booking Workspace is the next feature to be built out — these modules are designed placeholders,
        and nothing here is booked or charged.
      </p>
    </div>
  );
}
