"use client";

import { useState, type ReactNode } from "react";
import type { DestinationProposal } from "@/lib/types";
import { useStore } from "@/lib/store";
import { personalizationLine } from "@/lib/calibration";
import { Photo } from "@/components/photo";
import {
  Button,
  buttonClass,
  ConfidenceStrip,
  Disclosure,
  Eyebrow,
  PrototypeBadge,
  SidePanel,
  TradeoffNote,
} from "@/components/ui";

const RECO_EYEBROW: Record<string, string> = {
  top: "The one I'd choose for you",
  easier: "The easier alternative",
  wildcard: "The wildcard",
};

function Facts({ proposal }: { proposal: DestinationProposal }) {
  const weather =
    proposal.externalSignals.find((s) => /weather/i.test(s.label))?.value ?? proposal.weatherComfort;
  const facts: { label: string; value: string }[] = [
    { label: "Suggested", value: proposal.recommendedWindow },
    { label: "Approx. total", value: proposal.indicativePrice },
    { label: "Flight", value: proposal.flightTime },
    { label: "Weather", value: weather },
    { label: "Getting around", value: "No car needed" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {facts.map((f) => (
        <div key={f.label}>
          <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">
            {f.label}
          </dt>
          <dd className="mt-1 text-[15px] leading-snug text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-[clamp(22px,3vw,30px)] leading-tight tracking-[-0.03em]">
      {children}
    </h2>
  );
}

/**
 * Single, opinionated recommendation rendered as an editorial preview.
 * Actions are supplied by the parent so this view serves both the
 * proposal reveal and a specific destination route.
 */
export function ProposalView({
  proposal,
  saved,
  onSaveIdea,
  onPrimary,
  primaryLabel,
  secondary,
  eyebrowOverride,
}: {
  proposal: DestinationProposal;
  saved: boolean;
  onSaveIdea: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  secondary?: ReactNode;
  eyebrowOverride?: string;
}) {
  const [stayOpen, setStayOpen] = useState(false);
  const { profile } = useStore();
  const personal = personalizationLine(profile.prefs);
  const eyebrow = eyebrowOverride ?? RECO_EYEBROW[proposal.recommendationType];
  const strongNoConflict = proposal.confidence === "strong";

  return (
    <article className="pb-24">
      {/* ---------- Hero ---------- */}
      <div className="relative">
        <Photo
          image={proposal.heroImage}
          ratio="hero"
          tone={proposal.heroTone}
          width={1800}
          rounded="rounded-card"
          priority
          className="max-h-[62vh]"
        />
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-[rgba(20,22,18,0.55)] px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
            {eyebrow}
          </span>
        </div>
      </div>

      {/* ---------- Above-the-fold summary ---------- */}
      <div className="measure mt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow>{proposal.region}</Eyebrow>
            <h1 className="mt-2 font-display text-[clamp(32px,5.5vw,52px)] leading-[1.02] tracking-[-0.04em]">
              {proposal.destination}
            </h1>
          </div>
          <button
            onClick={onSaveIdea}
            aria-pressed={saved}
            className="mt-2 shrink-0 rounded-full border border-hair px-3.5 py-2 text-[13px] font-medium text-ink-soft transition hover:border-ink"
          >
            {saved ? "Saved ✓" : "♥ Save idea"}
          </button>
        </div>

        <p className="mt-4 text-[19px] leading-relaxed text-ink-soft">{proposal.thesis}</p>

        <div className="mt-7">
          <Facts proposal={proposal} />
        </div>

        <div className="mt-6 border-t border-hair-2 pt-5">
          <ConfidenceStrip chips={proposal.confidenceChips} />
          {personal && (
            <p className="mt-3 text-[13.5px] italic leading-snug text-muted">{personal}</p>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button variant="accent" onClick={onPrimary}>
            {primaryLabel} →
          </Button>
          <span className="text-[12.5px] text-faint">Saving a draft — nothing is booked.</span>
        </div>

        <div className="mt-6">
          <Disclosure label="Why this fits">
            <ul className="grid gap-2.5">
              {proposal.whyThisFits.slice(0, 3).map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-[15px] leading-snug text-ink-soft">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      </div>

      {/* ---------- Where you'd stay ---------- */}
      <section className="mt-20 md:mt-28">
        <div className="measure">
          <Eyebrow>Where you&apos;d stay</Eyebrow>
        </div>
        <div className="mt-5">
          <Photo
            image={proposal.stay.image}
            ratio="hero"
            tone={proposal.heroTone}
            width={1600}
            rounded="rounded-card"
            className="max-h-[56vh]"
          />
        </div>
        <div className="measure mt-6">
          <SectionHeading>{proposal.stay.name}</SectionHeading>
          <p className="mt-1 text-[14px] text-muted">{proposal.stay.location}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {proposal.stay.attributes.map((a) => (
              <li
                key={a}
                className="rounded-full bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-ink-soft ring-1 ring-hair-2"
              >
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">{proposal.stay.why}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="font-display text-lg tracking-[-0.02em]">{proposal.stay.price}</span>
            <button
              onClick={() => setStayOpen(true)}
              className="text-[14px] font-semibold text-accent transition hover:text-accent-press"
            >
              View stay details
            </button>
          </div>
        </div>
      </section>

      {/* ---------- How you'd get there ---------- */}
      <section className="mt-20 md:mt-28">
        <div className="measure">
          <Eyebrow>How you&apos;d get there</Eyebrow>
          <div className="mt-5 rounded-card border border-hair bg-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-display text-xl tracking-[-0.02em]">{proposal.flight.route}</div>
                <div className="mt-0.5 text-[13px] text-muted">{proposal.flight.airline}</div>
              </div>
              <span className="font-display text-lg tracking-[-0.02em]">{proposal.flight.price}</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="text-center">
                <div className="font-display text-lg">{proposal.flight.depart}</div>
                <div className="text-[11px] uppercase tracking-wide text-faint">Depart</div>
              </div>
              <div className="flex-1">
                <div className="relative h-px bg-hair">
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface px-2 text-[11px] text-muted">
                    {proposal.flight.duration} · {proposal.flight.stops}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-lg">{proposal.flight.arrive}</div>
                <div className="text-[11px] uppercase tracking-wide text-faint">Arrive</div>
              </div>
            </div>

            <div className="mt-5 border-t border-hair-2 pt-4">
              <Disclosure label="Fare details">
                <p className="text-[14px] text-ink-soft">
                  {proposal.flight.fareType}. Timed to your daytime-departure preference. Fares are
                  illustrative and not held until you choose to book.
                </p>
              </Disclosure>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- What the trip could feel like ---------- */}
      <section className="mt-20 md:mt-28">
        <div className="measure">
          <Eyebrow>What the trip could feel like</Eyebrow>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            The rhythm, not the schedule — a slow morning, one anchor, an easy evening.
          </p>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {proposal.moments.map((m) => (
            <figure key={m.title}>
              <Photo
                image={m.image}
                ratio="4/3"
                tone={proposal.heroTone}
                width={800}
                rounded="rounded-lg"
              />
              <figcaption className="mt-3">
                <div className="font-display text-lg tracking-[-0.02em]">{m.title}</div>
                <p className="mt-0.5 text-[14px] leading-snug text-muted">{m.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- A taste of the table ---------- */}
      <section className="mt-20 md:mt-28">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <Photo
            image={proposal.dining.image}
            ratio="4/3"
            tone={proposal.heroTone}
            width={900}
            rounded="rounded-card"
          />
          <div>
            <Eyebrow>A taste of the table</Eyebrow>
            <SectionHeading>{proposal.dining.name}</SectionHeading>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">{proposal.dining.note}</p>
          </div>
        </div>
      </section>

      {/* ---------- Estimated cost ---------- */}
      <section className="mt-20 md:mt-28">
        <div className="measure">
          <Eyebrow>Estimated cost</Eyebrow>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-[clamp(28px,4vw,40px)] tracking-[-0.03em]">
              {proposal.indicativePrice}
            </span>
            <PrototypeBadge />
          </div>
          <div className="mt-4">
            <Disclosure label="See full price breakdown">
              <dl className="grid gap-2 text-[14.5px]">
                <div className="flex justify-between border-b border-hair-2 py-2">
                  <dt className="text-muted">Stay</dt>
                  <dd className="text-ink-soft">{proposal.stay.price}</dd>
                </div>
                <div className="flex justify-between border-b border-hair-2 py-2">
                  <dt className="text-muted">Flights</dt>
                  <dd className="text-ink-soft">{proposal.flight.price}</dd>
                </div>
                <div className="flex justify-between border-b border-hair-2 py-2">
                  <dt className="text-muted">Private transfers</dt>
                  <dd className="text-ink-soft">≈ $180 pp</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-muted">Experiences</dt>
                  <dd className="text-ink-soft">A few, mostly optional</dd>
                </div>
              </dl>
              <p className="mt-3 text-[12.5px] text-faint">
                Illustrative prototype pricing per person — not a quote. Nothing is booked or charged.
              </p>
            </Disclosure>
          </div>
        </div>
      </section>

      {/* ---------- Anything to worry about ---------- */}
      <section className="mt-16">
        <div className="measure rounded-card border border-hair bg-surface-2 p-6">
          <Eyebrow>{strongNoConflict ? "Nothing to worry about" : "One honest trade-off"}</Eyebrow>
          {strongNoConflict ? (
            <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
              Nothing conflicts with your must-haves. This fits {proposal.confidenceChips.length} of
              the things you care about, with no compromises worth flagging.
            </p>
          ) : (
            <div className="mt-3 grid gap-2">
              {proposal.tradeoffs.map((t) => (
                <TradeoffNote key={t}>{t}</TradeoffNote>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Sticky action (one dominant button) ---------- */}
      <div className="sticky bottom-4 z-30 mt-12">
        <div className="measure flex items-center justify-between gap-4 rounded-full border border-hair bg-[rgba(255,255,255,0.92)] px-4 py-3 shadow-[var(--shadow-float)] backdrop-blur">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-ink">{proposal.destination}</div>
            <div className="text-[11.5px] text-faint">{proposal.indicativePrice}</div>
          </div>
          <div className="flex items-center gap-3">
            {secondary}
            <Button variant="accent" size="sm" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- Stay details drawer ---------- */}
      <SidePanel open={stayOpen} onClose={() => setStayOpen(false)} title={proposal.stay.name}>
        <p className="text-[15px] leading-relaxed text-ink-soft">{proposal.stay.why}</p>

        <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">
          A likely rhythm
        </h3>
        <ol className="mt-3 grid gap-2.5">
          {proposal.rhythmPreview.map((d) => (
            <li key={d.day} className="flex gap-3 text-[14px]">
              <span className="w-14 shrink-0 font-semibold text-accent">{d.day}</span>
              <span className="text-ink-soft">{d.summary}</span>
            </li>
          ))}
        </ol>

        <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">
          What Roam checked
        </h3>
        <ul className="mt-3 grid gap-2">
          {proposal.fitReasons.rightNow.map((r) => (
            <li key={r} className="flex items-start gap-2 text-[14px] text-ink-soft">
              <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              {r}
            </li>
          ))}
        </ul>

        {proposal.stillUnconfirmed.length > 0 && (
          <>
            <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">
              Still unconfirmed
            </h3>
            <ul className="mt-3 grid gap-2">
              {proposal.stillUnconfirmed.map((u) => (
                <li key={u} className="flex items-start gap-2 text-[14px] text-ink-soft">
                  <span aria-hidden className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {u}
                </li>
              ))}
            </ul>
          </>
        )}
      </SidePanel>
    </article>
  );
}

/* Small helper reused by the destination route for a quiet back link. */
export function backLink(href: string, label: string) {
  return (
    <a href={href} className={buttonClass("ghost", "sm")}>
      {label}
    </a>
  );
}
