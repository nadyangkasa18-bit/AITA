/* ============================================================
   RoaminRabbit — typed domain models
   ============================================================ */

export type PreferenceScope = "all" | "similar" | "this-trip";
export type PreferenceSource = "user" | "profile" | "inferred";
export type PreferenceStrength = "gentle" | "clear" | "strong";

export interface Preference {
  id: string;
  category: string;
  statement: string;
  strength: PreferenceStrength;
  scope: PreferenceScope;
  confidence: number;
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
  homeAirport: string;
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
  source: PreferenceSource;
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
  you: string[];
  thisTrip: string[];
  rightNow: string[];
}

export interface RhythmDay {
  day: string;
  summary: string;
}

export interface ImageRef {
  url: string;
  alt: string;
  position?: string;
  credit?: string;
}

export interface StayPreview {
  name: string;
  location: string;
  image: ImageRef;
  attributes: string[];
  price: string;
  why: string;
}

export interface FlightPreview {
  airline: string;
  route: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  fareType: string;
  price: string;
}

export interface TripMoment {
  title: string;
  note: string;
  image: ImageRef;
}

export interface DiningPreview {
  name: string;
  note: string;
  image: ImageRef;
}

export interface DestinationProposal {
  id: string;
  destination: string;
  region: string;
  recommendationType: RecommendationType;
  conceptTitle: string;
  thesis: string;
  recommendedWindow: string;
  indicativePrice: string;
  flightTime: string;
  weatherComfort: string;
  journeyEffort: string;
  mobilityFit: string;
  resortFit: string;
  confidence: Confidence;
  confidenceChips: string[];
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
  heroTone: string;
  heroImage: ImageRef;
  stay: StayPreview;
  flight: FlightPreview;
  moments: TripMoment[];
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
export type TripComponentState = "undecided" | "saved" | "tracked" | "needs-review" | "confirmed";

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

/** A multi-city trip stays one Trip; each transport leg can be decided independently. */
export interface TripFlightSegment {
  id: string;
  from: string;
  to: string;
  label: string;
  status: TripComponentState;
  selectedFlightId: string | null;
  savedFlightIds: string[];
  trackedFlightIds: string[];
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
  tripLength: number | null;
  destinationProposals: DestinationProposal[];
  ruledOut: RuledOut[];
  savedProposalIds: string[];
  selectedProposalId: string | null;
  tripVersions: TripVersion[];
  homeCreatedAt: string | null;
  lifecycle: TripLifecycle;
  componentStates: Record<TripComponent, TripComponentState>;

  /** Canonical product decisions. Optional for backward compatibility with older prototype trips. */
  selectedFlightId?: string | null;
  savedFlightIds?: string[];
  selectedStayId?: string | null;
  savedStayIds?: string[];
  flightSegments?: TripFlightSegment[];

  trackedFlight: TrackedFlight | null;
  itineraryDraft: ItineraryDraft | null;
  learnings: string[];
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

export interface ProfilePref {
  id: string;
  category: PrefCategory;
  statement: string;
  priority: PrefPriority;
  scope: PrefScope;
  source: PrefSource;
  confidence: number;
  order: number;
}

export interface LoyaltyEntry {
  id: string;
  kind: "airline" | "hotel" | "card" | "other";
  name: string;
  note?: string;
}

export type ChoiceValue = "A" | "B" | "depends" | "none";

export interface OnboardingState {
  completed: boolean;
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
