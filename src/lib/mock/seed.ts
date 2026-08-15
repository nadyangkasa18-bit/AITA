import type {
  DestinationProposal,
  ReasoningStep,
  RuledOut,
  TravelerProfile,
  Trip,
} from "@/lib/types";

/* ============================================================
   Prototype mock data. All prices / weather / availability are
   illustrative, not live. Replace destinations by editing this file.
   ============================================================ */

export const SEED_TRIP_ID = "girls-getaway";

export const SAMPLE_PROMPT =
  "Girls trip in the next three months somewhere that isn't so humid. We're mostly pretty laid-back, like a nice resort and we can't drive.";

export const travelerProfile: TravelerProfile = {
  id: "nadya",
  name: "Nadya",
  homeAirport: "Jakarta (CGK)",
  partyDefaults: { travelers: 4, notes: "Usually travels with the same close group" },
  loyaltyPrograms: [
    { id: "kf", kind: "airline", name: "KrisFlyer", tier: "Gold", member: "•••• 4821" },
    { id: "marriott", kind: "hotel", name: "Marriott Bonvoy", tier: "Titanium" },
  ],
  preferences: [
    {
      id: "p-daytime",
      category: "Flights",
      statement: "Prefers daytime or later departures",
      strength: "clear",
      scope: "all",
      confidence: 0.82,
      source: "profile",
      lastConfirmedAt: "2026-03-02",
    },
    {
      id: "p-easier",
      category: "Journey",
      statement: "Will pay somewhat more for an easier journey",
      strength: "clear",
      scope: "all",
      confidence: 0.78,
      source: "profile",
      lastConfirmedAt: "2026-02-14",
    },
    {
      id: "p-design",
      category: "Stays",
      statement: "Cares about hotel design and atmosphere",
      strength: "strong",
      scope: "all",
      confidence: 0.88,
      source: "profile",
      lastConfirmedAt: "2026-04-01",
    },
    {
      id: "p-relaxed",
      category: "Pace",
      statement: "Dislikes overly packed itineraries",
      strength: "strong",
      scope: "all",
      confidence: 0.85,
      source: "profile",
      lastConfirmedAt: "2026-01-20",
    },
  ],
};

export const reasoningSteps: ReasoningStep[] = [
  { label: "Understanding what the group wants" },
  { label: "Checking comfortable weather windows" },
  { label: "Looking for resort-led destinations" },
  { label: "Removing places that depend heavily on driving" },
  { label: "Comparing journey effort and indicative cost" },
];

export const quickReactions = [
  "Make it more luxurious",
  "Less travel time",
  "More nightlife",
  "Lower the total",
  "Show me somewhere warmer",
  "Surprise me more",
] as const;

const ruledOut: RuledOut[] = [
  {
    place: "Jeju",
    reason:
      "Initially looked promising, but too much of the experience would depend on driving or arranging repeated private transfers.",
  },
  {
    place: "Bali",
    reason: "A favourite, but you asked for somewhere less humid than home — this window stays sticky.",
  },
  {
    place: "Phuket",
    reason: "Strong resorts, but October sits in the wetter shoulder and the vibe leans busy rather than laid-back.",
  },
];

const proposals: DestinationProposal[] = [
  {
    id: "hakone",
    destination: "Hakone",
    region: "Japan",
    recommendationType: "top",
    conceptTitle: "A quiet onsen-resort week as the leaves turn",
    recommendedWindow: "Late October · 4 nights",
    indicativePrice: "≈ $1,850–2,300 per person",
    weatherComfort: "Crisp autumn air, low humidity, mid-to-high teens °C",
    journeyEffort: "Flight to Tokyo, then one scenic rail + shuttle leg",
    mobilityFit: "Fully car-free — rail, resort shuttle and one private transfer",
    resortFit: "Exactly your kind of place: design-led ryokan with private onsen",
    confidence: "strong",
    heroTone: "hero-hakone",
    fitReasons: {
      you: [
        "You care about hotel design and atmosphere — this is a design-led onsen ryokan",
        "You dislike packed itineraries — the whole point here is slowness",
        "Daytime arrival lands you before the last shuttle",
      ],
      thisTrip: [
        "Comfortably less humid than home",
        "A genuinely good resort, not just a nice hotel",
        "Works with nobody driving",
      ],
      rightNow: [
        "Late-October foliage is near peak in the prototype window",
        "Shoulder-season resort rates before the winter climb",
        "Weekday arrival avoids the Tokyo-day-tripper crowd",
      ],
    },
    tradeoffs: ["Main trade-off: a flight plus a train transfer to reach the valley"],
    externalSignals: [
      { label: "Weather window", value: "14–19°C · low humidity" },
      { label: "Foliage", value: "Near peak (prototype)" },
      { label: "Resort rates", value: "Shoulder season" },
    ],
    rhythmPreview: [
      { day: "Day 1", summary: "Arrive, settle in, first private onsen at dusk" },
      { day: "Day 2", summary: "Open-air museum, lakeside lunch, nothing rushed" },
      { day: "Day 3", summary: "Slow morning, optional ropeway, kaiseki dinner" },
      { day: "Day 4", summary: "One last soak, easy transfer back for the flight" },
    ],
    signatureExperience: "A private open-air onsen booked for just your four",
    indulgentMoment: "A multi-course kaiseki dinner served in-room",
    localPleasure: "Black eggs at Owakudani and a lakeside coffee",
    protectedDowntime: "Two unplanned afternoons, on purpose",
    stillUnconfirmed: [
      "Exact ryokan (two design-led options held)",
      "Whether you want the Tokyo night on the way in or out",
    ],
    status: "suggested",
  },
  {
    id: "perth",
    destination: "Perth & Rottnest",
    region: "Australia",
    recommendationType: "easier",
    conceptTitle: "The low-effort version — dry, sunny, and simple to move through",
    recommendedWindow: "Mid-October · 4 nights",
    indicativePrice: "≈ $1,450–1,900 per person",
    weatherComfort: "Warm, dry spring days, very low humidity",
    journeyEffort: "One direct-ish flight, short transfers, no rail puzzle",
    mobilityFit: "Easy without driving — ferries, walkable city, rideshare",
    resortFit: "Good coastal hotels, though less of a true resort escape",
    confidence: "good-with-tradeoff",
    heroTone: "hero-perth",
    fitReasons: {
      you: [
        "You'll pay a little more for an easier journey — this is the easiest of the three",
        "Relaxed pace suits island days and long lunches",
      ],
      thisTrip: [
        "Driest climate of the three in the window",
        "Genuinely car-free with ferries and rideshare",
        "Four travelers, laid-back rhythm",
      ],
      rightNow: [
        "October is dry-season spring in the prototype data",
        "Quokka-season Rottnest is calm midweek",
      ],
    },
    tradeoffs: ["Main trade-off: it feels more like a great city break than a resort escape"],
    externalSignals: [
      { label: "Weather window", value: "22–26°C · dry" },
      { label: "Journey", value: "Fewest moving parts" },
      { label: "Crowds", value: "Low midweek" },
    ],
    rhythmPreview: [
      { day: "Day 1", summary: "Arrive, sunset on the Swan River" },
      { day: "Day 2", summary: "Ferry to Rottnest, bikes optional, beach time" },
      { day: "Day 3", summary: "Fremantle markets, wine lunch, spa afternoon" },
      { day: "Day 4", summary: "Slow café morning, easy transfer to fly" },
    ],
    signatureExperience: "A day on Rottnest with the group, no cars anywhere in sight",
    indulgentMoment: "A long Margaret River-style wine lunch",
    localPleasure: "Coffee culture that rivals anywhere",
    protectedDowntime: "A whole afternoon with nothing booked",
    stillUnconfirmed: ["Coastal hotel vs city-design hotel", "Whether to add a spa day"],
    status: "suggested",
  },
  {
    id: "queenstown",
    destination: "Queenstown",
    region: "New Zealand",
    recommendationType: "wildcard",
    conceptTitle: "The dramatic one — alpine lodge luxury, if you want the journey",
    recommendedWindow: "Mid-November · 5 nights",
    indicativePrice: "≈ $2,600–3,400 per person",
    weatherComfort: "Cool, crisp late-spring, very low humidity",
    journeyEffort: "Longer haul with a connection, but private transfers throughout",
    mobilityFit: "Car-free by design — lodge transfers and private drivers",
    resortFit: "Serious lodge luxury and scenery that does the work for you",
    confidence: "needs-input",
    heroTone: "hero-queenstown",
    fitReasons: {
      you: [
        "You value design and atmosphere — alpine lodges here are exceptional",
        "Slow mornings with a view fit your pace",
      ],
      thisTrip: [
        "About as far from humid as it gets",
        "Private transfers make driving unnecessary",
      ],
      rightNow: [
        "November is quiet between ski and peak summer (prototype)",
        "Lodge availability is open in the window",
      ],
    },
    tradeoffs: [
      "Main trade-off: the longest, most expensive journey of the three",
      "Needs your input on budget before I'd commit to it",
    ],
    externalSignals: [
      { label: "Weather window", value: "9–17°C · dry" },
      { label: "Journey", value: "Longest of the three" },
      { label: "Lodges", value: "Open availability" },
    ],
    rhythmPreview: [
      { day: "Day 1", summary: "Arrive by private transfer, lodge settle-in" },
      { day: "Day 2", summary: "Lake cruise, long lunch, spa" },
      { day: "Day 3", summary: "Gentle wine country day, nothing strenuous" },
      { day: "Day 4", summary: "Optional gondola, or simply the view" },
      { day: "Day 5", summary: "Slow start, transfer for the flight home" },
    ],
    signatureExperience: "A lakeside lodge suite with the group and a fire",
    indulgentMoment: "A private wine-country lunch",
    localPleasure: "The best flat white of your life, apparently",
    protectedDowntime: "Two mornings with only the mountains on the agenda",
    stillUnconfirmed: ["Budget headroom", "Whether five nights is one too many"],
    status: "suggested",
  },
];

export function makeSeedTrip(prompt: string): Trip {
  const now = new Date().toISOString();
  return {
    id: SEED_TRIP_ID,
    name: "Girls' getaway",
    status: "proposing",
    originalPrompt: prompt?.trim() || SAMPLE_PROMPT,
    travelers: 4,
    protect: null,
    tripLength: null,
    savedProposalIds: [],
    selectedProposalId: null,
    tripVersions: [],
    createdAt: now,
    updatedAt: now,
    ruledOut,
    // deep clone so edits never mutate the source arrays
    destinationProposals: proposals.map((p) => ({ ...p, fitReasons: { ...p.fitReasons } })),
    brief: {
      items: [
        { id: "b1", statement: "Travel within the next three months", level: "must", source: "user", editable: true },
        { id: "b2", statement: "The trip must work without anyone driving", level: "must", source: "user", editable: true },
        { id: "b3", statement: "Four travelers from Jakarta", level: "must", source: "profile", editable: true },
        { id: "b4", statement: "Less humid or more comfortable weather", level: "prioritize", source: "user", editable: true },
        { id: "b5", statement: "A genuinely good resort", level: "prioritize", source: "user", editable: true },
        { id: "b6", statement: "A relaxed trip rhythm", level: "prioritize", source: "profile", editable: true },
        { id: "b7", statement: "Easy door-to-door movement", level: "prioritize", source: "inferred", editable: true },
        { id: "b8", statement: "Exact destination", level: "flexible", source: "inferred", editable: true },
        { id: "b9", statement: "Exact date window", level: "flexible", source: "inferred", editable: true },
        { id: "b10", statement: "Airline and number of stops, within reason", level: "flexible", source: "profile", editable: true },
        { id: "b11", statement: "Exact trip length", level: "flexible", source: "inferred", editable: true },
      ],
      assumptions: [
        { id: "a1", label: "Travelers", value: "Four", editable: true },
        { id: "a2", label: "Departing from", value: "Jakarta (CGK)", editable: true },
        { id: "a3", label: "Trip length", value: "Around four nights", editable: true },
        { id: "a4", label: "Budget", value: "Not yet set", editable: true },
      ],
    },
  };
}
