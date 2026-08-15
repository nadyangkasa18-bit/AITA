"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  BriefLevel,
  DestinationProposal,
  ProtectChoice,
  Trip,
} from "@/lib/types";
import { makeSeedTrip, SEED_TRIP_ID } from "@/lib/mock/seed";

const STORAGE_KEY = "roam.prototype.v1";

interface PersistShape {
  trips: Record<string, Trip>;
  order: Record<string, string[]>;
  reactions: Record<string, string[]>;
  /** Which proposal is currently being shown as "the one I'd choose". */
  featured: Record<string, string>;
}

const empty: PersistShape = { trips: {}, order: {}, reactions: {}, featured: {} };

interface StoreValue {
  hydrated: boolean;
  trips: Record<string, Trip>;
  order: Record<string, string[]>;
  reactions: Record<string, string[]>;
  featured: Record<string, string>;
  getFeaturedId: (id: string) => string | null;
  showAnother: (id: string) => DestinationProposal | null;
  resetFeatured: (id: string) => void;
  createTripFromPrompt: (prompt: string) => string;
  ensureSeedTrip: () => void;
  getTrip: (id: string) => Trip | undefined;
  patchTrip: (id: string, patch: Partial<Trip>) => void;
  setBriefLevel: (id: string, itemId: string, level: BriefLevel) => void;
  editBriefItem: (id: string, itemId: string, statement: string) => void;
  removeBriefItem: (id: string, itemId: string) => void;
  addBriefItem: (id: string, statement: string, level: BriefLevel) => void;
  editAssumption: (id: string, assumptionId: string, value: string) => void;
  setProtect: (id: string, choice: ProtectChoice) => void;
  setTripLength: (id: string, nights: number | null) => void;
  toggleSaveProposal: (id: string, proposalId: string) => void;
  buildTrip: (id: string, proposalId: string) => void;
  applyReaction: (id: string, reaction: string) => string;
  orderedProposals: (id: string) => DestinationProposal[];
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const REACTION_TARGET: Record<string, string> = {
  "Make it more luxurious": "queenstown",
  "Less travel time": "perth",
  "More nightlife": "perth",
  "Lower the total": "perth",
  "Show me somewhere warmer": "perth",
  "Surprise me more": "queenstown",
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistShape>(empty);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // hydrate once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // One-time hydration from localStorage (an external store) on mount — the
      // endorsed use of setState in an effect, not a render-cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ ...empty, ...(JSON.parse(raw) as PersistShape) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // persist (debounced)
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* quota / private mode */
      }
    }, 120);
  }, [state, hydrated]);

  const touch = (t: Trip): Trip => ({ ...t, updatedAt: new Date().toISOString() });

  const createTripFromPrompt = useCallback((prompt: string) => {
    const trip = makeSeedTrip(prompt);
    setState((s) => ({
      ...s,
      trips: { ...s.trips, [trip.id]: trip },
      order: { ...s.order, [trip.id]: trip.destinationProposals.map((p) => p.id) },
      reactions: { ...s.reactions, [trip.id]: [] },
      featured: { ...s.featured, [trip.id]: trip.destinationProposals[0]?.id ?? "" },
    }));
    return trip.id;
  }, []);

  const ensureSeedTrip = useCallback(() => {
    setState((s) => {
      if (s.trips[SEED_TRIP_ID]) return s;
      const trip = makeSeedTrip("");
      return {
        ...s,
        trips: { ...s.trips, [trip.id]: trip },
        order: { ...s.order, [trip.id]: trip.destinationProposals.map((p) => p.id) },
        reactions: { ...s.reactions, [trip.id]: [] },
        featured: { ...s.featured, [trip.id]: trip.destinationProposals[0]?.id ?? "" },
      };
    });
  }, []);

  const updateTrip = useCallback(
    (id: string, fn: (t: Trip) => Trip) => {
      setState((s) => {
        const t = s.trips[id];
        if (!t) return s;
        return { ...s, trips: { ...s.trips, [id]: touch(fn(t)) } };
      });
    },
    []
  );

  const value: StoreValue = useMemo(() => {
    return {
      hydrated,
      trips: state.trips,
      order: state.order,
      reactions: state.reactions,
      featured: state.featured,
      getFeaturedId: (id) => {
        const t = state.trips[id];
        if (!t) return null;
        return state.featured[id] ?? t.destinationProposals[0]?.id ?? null;
      },
      showAnother: (id) => {
        const t = state.trips[id];
        if (!t) return null;
        const list = t.destinationProposals;
        if (list.length < 2) return null;
        const currentId = state.featured[id] ?? list[0].id;
        const idx = list.findIndex((p) => p.id === currentId);
        const next = list[(idx + 1) % list.length];
        setState((s) => ({ ...s, featured: { ...s.featured, [id]: next.id } }));
        return next;
      },
      resetFeatured: (id) => {
        const t = state.trips[id];
        if (!t) return;
        setState((s) => ({
          ...s,
          featured: { ...s.featured, [id]: t.destinationProposals[0]?.id ?? "" },
        }));
      },
      createTripFromPrompt,
      ensureSeedTrip,
      getTrip: (id) => state.trips[id],
      patchTrip: (id, patch) => updateTrip(id, (t) => ({ ...t, ...patch })),
      setBriefLevel: (id, itemId, level) =>
        updateTrip(id, (t) => ({
          ...t,
          brief: {
            ...t.brief,
            items: t.brief.items.map((it) => (it.id === itemId ? { ...it, level } : it)),
          },
        })),
      editBriefItem: (id, itemId, statement) =>
        updateTrip(id, (t) => ({
          ...t,
          brief: {
            ...t.brief,
            items: t.brief.items.map((it) => (it.id === itemId ? { ...it, statement } : it)),
          },
        })),
      removeBriefItem: (id, itemId) =>
        updateTrip(id, (t) => ({
          ...t,
          brief: { ...t.brief, items: t.brief.items.filter((it) => it.id !== itemId) },
        })),
      addBriefItem: (id, statement, level) =>
        updateTrip(id, (t) => ({
          ...t,
          brief: {
            ...t.brief,
            items: [
              ...t.brief.items,
              { id: `b-${Date.now()}`, statement, level, source: "user", editable: true },
            ],
          },
        })),
      editAssumption: (id, assumptionId, val) =>
        updateTrip(id, (t) => ({
          ...t,
          brief: {
            ...t.brief,
            assumptions: t.brief.assumptions.map((a) =>
              a.id === assumptionId ? { ...a, value: val } : a
            ),
          },
        })),
      setProtect: (id, choice) => updateTrip(id, (t) => ({ ...t, protect: choice })),
      setTripLength: (id, nights) => updateTrip(id, (t) => ({ ...t, tripLength: nights })),
      toggleSaveProposal: (id, proposalId) =>
        updateTrip(id, (t) => {
          const saved = t.savedProposalIds.includes(proposalId)
            ? t.savedProposalIds.filter((x) => x !== proposalId)
            : [...t.savedProposalIds, proposalId];
          return { ...t, savedProposalIds: saved };
        }),
      buildTrip: (id, proposalId) =>
        updateTrip(id, (t) => ({
          ...t,
          status: "version-selected",
          selectedProposalId: proposalId,
          tripVersions: t.tripVersions.some((v) => v.destinationId === proposalId)
            ? t.tripVersions
            : [
                ...t.tripVersions,
                {
                  id: `v-${Date.now()}`,
                  label: `The ${proposalId} version`,
                  destinationId: proposalId,
                  createdAt: new Date().toISOString(),
                },
              ],
        })),
      applyReaction: (id, reaction) => {
        const target = REACTION_TARGET[reaction];
        setState((s) => {
          const current = s.order[id] ?? (s.trips[id]?.destinationProposals.map((p) => p.id) ?? []);
          let next = current;
          if (target && current.includes(target)) {
            next = [target, ...current.filter((x) => x !== target)];
          }
          return {
            ...s,
            order: { ...s.order, [id]: next },
            reactions: { ...s.reactions, [id]: [...(s.reactions[id] ?? []), reaction] },
          };
        });
        return target ? `Refined — ${reaction.toLowerCase()}` : `Noted — ${reaction.toLowerCase()}`;
      },
      orderedProposals: (id) => {
        const t = state.trips[id];
        if (!t) return [];
        const ord = state.order[id];
        if (!ord) return t.destinationProposals;
        const byId = new Map(t.destinationProposals.map((p) => [p.id, p]));
        return ord.map((pid) => byId.get(pid)).filter(Boolean) as DestinationProposal[];
      },
      reset: () => {
        setState(empty);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      },
    };
  }, [hydrated, state, createTripFromPrompt, ensureSeedTrip, updateTrip]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/** Convenience: ensures the seeded trip exists, returns it once hydrated. */
export function useTrip(id: string) {
  const store = useStore();
  const { hydrated, ensureSeedTrip } = store;
  useEffect(() => {
    if (hydrated && id === SEED_TRIP_ID && !store.trips[id]) ensureSeedTrip();
  }, [hydrated, id, ensureSeedTrip, store.trips]);
  return { trip: store.trips[id], store, hydrated };
}
