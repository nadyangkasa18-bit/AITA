/* ============================================================
   RoaminRabbit — typed domain models
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

/* -------------------- Imagery + editorial content -------------------- */

export interface ImageRef {
  /** Fixed images.unsplash.com/photo-... URL (query params added by the loader). */
  url: string;
  alt: string;
  /** object-position, e.g. "center 40%" */
  position?: string;
  /** Attribution / caption shown subtly where appropriate. */
  credit?: string;
}

export interface StayPreview {
  name: string;
  location: string;
  image: ImageRef;
  attributes: string[]; // exactly three essential attributes
  price: string; // clearly indicative
  why: string; // one sentence tying it to the traveler
}

export interface FlightPreview {
  airline: string;
  route: string; // "CGK → HND"
  depart: string;
  arrive: string;
  duration: string;
  stops: string; // "Direct" | "1 stop"
  fareType: string;
  price: string;
}

export interface TripMoment {
  title: string; // "Slow morning"
  note: string; // one short sentence
  image: ImageRef;
}

export interface DiningPreview {
  name: string;
  note: string;
  image: ImageRef;
}

export interface DestinationProposal {
  id: string; // "hakone" | "perth" | "queenstown"
  destination: string;
  region: string;
  recommendationType: RecommendationType;
  conceptTitle: string;
  /** One-sentence trip thesis: why this fits, said plainly. */
  thesis: string;
  recommendedWindow: string;
  indicativePrice: string; // "per person" range, clearly prototype
  flightTime: string; // for the essential-facts row
  weatherComfort: string;
  journeyEffort: string;
  mobilityFit: string; // car-free confidence
  resortFit: string;
  confidence: Confidence;
  /** Short, verifiable proof points for the confidence strip. */
  confidenceChips: string[];
  /** Up to three short, specific reasons for the "Why this fits" disclosure. */
  whyThisFits: string[];
  fitReasons: FitReasons;
  tradeoffs: string[];
  externalSignals: { label: string; value: string }[];
  rhythmPreview: RhythmDay[];
  signatureExperience: string;
  indulgentMoment: string;
  localPleasure: string;
  protectedDowntime: string;
  stillUnconfirmed: string[];
  heroTone: string; // gradient class hint / graceful image fallback
  heroImage: ImageRef; // 16:9+ proposal hero
  stay: StayPreview;
  flight: FlightPreview;
  moments: TripMoment[]; // three image-led rhythm moments
  dining: DiningPreview;
  status: "suggested" | "saved" | "selected" | "rejected";
}

export interface RuledOut {
  place: string;
  reason: string;
}

/* -------------------- Trip -------------------- */

export type TripStatus = "draft" | "proposing" | "version-selected" | "booked";
export type TripLifecycle = "planning" | "partially-booked" | "booked";
export type TripComponent = "stay" | "flight" | "experiences";
export type TripComponentState = "undecided" | "saved" | "tracked" | "confirmed";

export interface TrackedFlight {
  id: string;
  airline: string;
  route: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  originalFare: number;
  currentFare: number;
  lastCheckedAt: string;
  priceDropped: boolean;
}

export interface ItineraryDay {
  day: string;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  freeTime: string;
}

export interface ItineraryDraft {
  status: "draft";
  createdAt: string;
  updatedAt: string;
  days: ItineraryDay[];
  refinements: string[];
}

export interface TripVersion {
  id: string;
  label: string;
  destinationId: string;
  createdAt: string;
}

export interface TripCollaborator {
  id: string;
  name: string;
  email: string;
  status: "organizer" | "invited" | "joined";
}

export type TripAddonId = "entry" | "esim" | "insurance";

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
  homeCreatedAt: string | null;
  lifecycle: TripLifecycle;
  componentStates: Record<TripComponent, TripComponentState>;
  trackedFlight: TrackedFlight | null;
  itineraryDraft: ItineraryDraft | null;
  /** Feedback learned from choices and rejections for this trip. */
  learnings: string[];
  /** Optional services chosen during checkout. */
  selectedAddonIds: TripAddonId[];
  collaborators: TripCollaborator[];
  paymentSuccessAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReasoningStep {
  label: string;
}

/* ============================================================
   Traveler Profile Calibration
   ============================================================ */

export type PrefPriority = "always" | "usually" | "flexible" | "avoid";
export type PrefScope = "all" | "similar" | "this-trip" | "none";
export type PrefSource = "onboarding" | "added" | "confirmed";
export type PrefCategory =
  | "Flights"
  | "Stays"
  | "Ground transport"
  | "Food"
  | "Pace"
  | "Spending"
  | "Accessibility"
  | "Loyalty"
  | "Group travel";

export const PREF_CATEGORIES: PrefCategory[] = [
  "Flights",
  "Stays",
  "Ground transport",
  "Food",
  "Pace",
  "Spending",
  "Accessibility",
  "Loyalty",
  "Group travel",
];

/** A single, editable Traveler Profile preference. */
export interface ProfilePref {
  id: string;
  category: PrefCategory;
  statement: string;
  priority: PrefPriority;
  scope: PrefScope;
  source: PrefSource;
  confidence: number; // 0..1 (never shown as a raw score)
  order: number; // ordering within a priority group
}

export interface LoyaltyEntry {
  id: string;
  kind: "airline" | "hotel" | "card" | "other";
  name: string;
  note?: string;
}

/** Answer to a comparison round. */
export type ChoiceValue = "A" | "B" | "depends" | "none";

export interface OnboardingState {
  completed: boolean;
  /** Resume pointer into the calibration flow. */
  step: number;
  answers: Record<string, ChoiceValue>;
}

export interface ProfileState {
  calibrated: boolean;
  prefs: ProfilePref[];
  loyalty: LoyaltyEntry[];
  mustHaves: string[];
  avoids: string[];
}
