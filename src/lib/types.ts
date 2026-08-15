/* ============================================================
   Roam — typed domain models (prototype)
   ============================================================ */

export type PreferenceScope = "all" | "similar" | "this-trip";
export type PreferenceSource = "user" | "profile" | "inferred";
export type PreferenceStrength = "gentle" | "clear" | "strong";

export interface Preference {
  id: string;
  category: string; // e.g. "Flights", "Stays", "Pace"
  statement: string;
  strength: PreferenceStrength;
  scope: PreferenceScope;
  confidence: number; // 0..1 (prototype)
  source: PreferenceSource;
  lastConfirmedAt: string | null;
}

export interface LoyaltyProgram {
  id: string;
  kind: "airline" | "hotel" | "other";
  name: string;
  tier?: string;
  member?: string;
}

export interface PartyDefaults {
  travelers: number;
  notes?: string;
}

export interface TravelerProfile {
  id: string;
  name: string;
  homeAirport: string; // e.g. "Jakarta (CGK)"
  partyDefaults: PartyDefaults;
  preferences: Preference[];
  loyaltyPrograms: LoyaltyProgram[];
}

/* -------------------- Trip Brief -------------------- */

export type BriefLevel = "must" | "prioritize" | "flexible" | "avoid";

export interface TripBriefItem {
  id: string;
  statement: string;
  level: BriefLevel;
  source: PreferenceSource; // user | profile | inferred
  editable: boolean;
}

export interface TripAssumption {
  id: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface TripBrief {
  items: TripBriefItem[];
  assumptions: TripAssumption[];
}

/* -------------------- Follow-up -------------------- */

export type ProtectChoice = "resort" | "journey" | "total" | "flexible" | null;

/* -------------------- Destination proposals -------------------- */

export type RecommendationType = "top" | "easier" | "wildcard";
export type Confidence = "strong" | "good-with-tradeoff" | "needs-input";

export interface FitReasons {
  /** Long-term Traveler Profile preferences relevant here. */
  you: string[];
  /** Specific Trip Brief requirements this satisfies. */
  thisTrip: string[];
  /** Prototype date / weather / crowd / price context. */
  rightNow: string[];
}

export interface RhythmDay {
  day: string; // "Day 1"
  summary: string;
}

export interface DestinationProposal {
  id: string; // "hakone" | "perth" | "queenstown"
  destination: string;
  region: string;
  recommendationType: RecommendationType;
  conceptTitle: string;
  recommendedWindow: string;
  indicativePrice: string; // "per person" range, clearly prototype
  weatherComfort: string;
  journeyEffort: string;
  mobilityFit: string; // car-free confidence
  resortFit: string;
  confidence: Confidence;
  fitReasons: FitReasons;
  tradeoffs: string[];
  externalSignals: { label: string; value: string }[];
  rhythmPreview: RhythmDay[];
  signatureExperience: string;
  indulgentMoment: string;
  localPleasure: string;
  protectedDowntime: string;
  stillUnconfirmed: string[];
  heroTone: string; // gradient class hint for the mock hero
  status: "suggested" | "saved" | "selected" | "rejected";
}

export interface RuledOut {
  place: string;
  reason: string;
}

/* -------------------- Trip -------------------- */

export type TripStatus = "draft" | "proposing" | "version-selected" | "booked";

export interface TripVersion {
  id: string;
  label: string;
  destinationId: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  name: string;
  status: TripStatus;
  originalPrompt: string;
  travelers: number;
  brief: TripBrief;
  protect: ProtectChoice;
  tripLength: number | null; // nights
  destinationProposals: DestinationProposal[];
  ruledOut: RuledOut[];
  savedProposalIds: string[];
  selectedProposalId: string | null;
  tripVersions: TripVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ReasoningStep {
  label: string;
}
