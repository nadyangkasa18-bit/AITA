# Roam — agentic travel (prototype)

Roam is a design-forward prototype of an agentic travel advisor. You tell it what you
know about a trip — even vaguely — and it produces a **Trip Brief**, then a short,
opinionated shortlist of **destination directions** with honest reasoning and trade-offs,
learning from your reactions along the way.

> **Prototype.** All prices, weather, availability and reasoning are illustrative, not
> live. There is no account, no server, no real booking, and no money ever moves.
> Everything you do is stored in your browser's `localStorage`.

The product name is intentionally a placeholder. It lives in **one file** —
[`src/config/product.ts`](src/config/product.ts) — so renaming the whole product is a
one-line change.

## Stack

- **Next.js 16 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `src/app/globals.css`)
- Client state via **React Context + `localStorage`** (SSR-safe hydration, debounced persist)
- **Self-hosted variable fonts** (`next/font/local`) — Bricolage Grotesque (display),
  Hanken Grotesk (UI), Newsreader (editorial). No build-time network dependency.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # eslint (clean)
npm run build    # production build (clean)
npm run start    # serve the production build
```

## Deploying to Vercel

This repo is a standard Next.js app and needs no special configuration.

1. Push to a GitHub repository.
2. In Vercel, **New Project → Import** the repo. Framework preset auto-detects Next.js.
3. Deploy. Every branch push gets a **preview** URL; merging to your production branch
   promotes to production.

Or, with the Vercel CLI locally:

```bash
vercel          # preview deployment
vercel --prod   # production
```

## Architecture

Navigation is **non-linear**, not a wizard. A global nav (Roam / Explore / Trips / Saved /
Traveler Profile) sits above a contextual **trip nav** (Brief / Destinations / Workspace /
Plan / Bookings / Readiness). You can move freely; state is never lost on back/refresh.

```
src/
  config/product.ts        # single source of truth for the product name + ecosystem
  lib/
    types.ts               # typed domain models (Trip, Brief, Proposal, Preference…)
    store.tsx              # StoreProvider / useStore / useTrip — localStorage-backed
    mock/seed.ts           # all prototype data (traveler profile, proposals, brief)
  components/
    ui.tsx                 # Orb, Button, Card, labels, SidePanel, Toast, PlaceholderPage…
    shell.tsx              # GlobalNavigation, TripNavigation, AssistantComposer, AppShell
    brief.tsx              # TripBrief and editable brief rows
    destinations.tsx       # DestinationProposalCard, WhyThisFits, RuledOutSection
    reasoning.tsx          # transparent, reduced-motion-aware reasoning reveal
    trip-placeholder.tsx   # trip-scoped placeholder wrapper
  app/                     # routes (see below)
  fonts/                   # self-hosted woff2 variable fonts
legacy/prototype.html      # the original single-file HTML prototype, archived
```

### The one fully-built feature

**Intent → Trip Brief → Destination Proposals** is implemented end to end:

- **`/`** — describe a trip (or pick an example); a transparent reasoning pass runs.
- **`/trips/[tripId]/brief`** — the editable Trip Brief: must/prioritize/flexible/avoid
  levels, provenance on every item (you said it / from your profile / Roam inferred it),
  editable assumptions, and a "what to protect" follow-up.
- **`/trips/[tripId]/destinations`** — three directions (one to choose, one easier, one
  wildcard), quick reactions that visibly re-rank, and a collapsible "what I ruled out."
- **`/trips/[tripId]/destinations/[destinationId]`** — the full advisor proposal.
- **`/trips/[tripId]/workspace`** — the linked Booking Workspace shell you land in after
  "Build this trip" (designed, labeled *next feature*).

Everything else is a **routed, designed placeholder** so the full architecture and every
nav link work, without pretending to be built.

### Recommended next feature

**Traveler Profile Calibration** (`/profile/calibrate`) — light "this or that" choices
that teach the profile, with every learned preference clearly **scoped** (this trip /
similar / always) and reversible. Inferences never silently become permanent, and
trip-specific requirements stay distinct from long-term preferences.

## Product principles baked in

Don't drown people in options; lead with one clear recommendation. Never silently break a
stated "must." Explain trade-offs honestly. Keep the assistant persistent but secondary —
chat refines, it isn't the whole interface. Label all prototype data; make no "best price"
or "live" claims; take no financial action without explicit approval.
