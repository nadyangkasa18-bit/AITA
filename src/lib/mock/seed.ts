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

   Photography: fixed images.unsplash.com/photo-... URLs so the
   prototype stays visually consistent. If any specific photo ID no
   longer resolves, swap it here — the <Photo> component degrades to a
   calm editorial fallback, so the layout never looks broken.
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

/* Calm transition: at most three short status messages. */
export const reasoningSteps: ReasoningStep[] = [
  { label: "Finding places that match your weather window" },
  { label: "Checking resort access without a car" },
  { label: "Balancing comfort with your budget" },
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
      "Looked promising, but too much of it would depend on driving or repeated private transfers.",
  },
  {
    place: "Bali",
    reason: "A favourite, but you asked for somewhere less humid than home — this window stays sticky.",
  },
  {
    place: "Phuket",
    reason: "Strong resorts, but October sits in the wetter shoulder and it leans busy, not laid-back.",
  },
];

const proposals: DestinationProposal[] = [
  {
    id: "hakone",
    destination: "Hakone",
    region: "Japan",
    recommendationType: "top",
    conceptTitle: "A quiet onsen-resort week as the leaves turn",
    thesis: "A design-led onsen ryokan, crisp low-humidity air, and nothing you have to drive to.",
    recommendedWindow: "Late October · 4 nights",
    indicativePrice: "≈ $1,850–2,300 per person",
    flightTime: "≈ 7h to Tokyo, then rail",
    weatherComfort: "Crisp autumn air, low humidity, mid-to-high teens °C",
    journeyEffort: "Flight to Tokyo, then one scenic rail + shuttle leg",
    mobilityFit: "Fully car-free — rail, resort shuttle and one private transfer",
    resortFit: "Exactly your kind of place: design-led ryokan with private onsen",
    confidence: "strong",
    confidenceChips: [
      "Lower humidity",
      "Resort access without driving",
      "Relaxed pacing",
      "Flights within your range",
    ],
    whyThisFits: [
      "It's a design-led onsen ryokan — the kind of stay you notice.",
      "The whole point here is slowness, which suits how you travel.",
      "Fully reachable by rail and shuttle, so nobody has to drive.",
    ],
    heroTone: "hero-hakone",
    heroImage: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      alt: "Mist drifting over forested autumn mountains near Hakone, Japan",
      position: "center 55%",
    },
    stay: {
      name: "A design-led onsen ryokan",
      location: "Hakone valley, near Gōra",
      image: {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        alt: "Serene, minimal ryokan-style room with warm light",
        position: "center",
      },
      attributes: ["Private open-air onsen", "In-room kaiseki dining", "Four-guest suite"],
      price: "≈ $940 pp for 4 nights",
      why: "Chosen for its atmosphere and quiet — the design and the soak are the trip.",
    },
    flight: {
      airline: "Singapore Airlines / ANA",
      route: "CGK → HND",
      depart: "10:20 daytime",
      arrive: "19:05 (+1 rail)",
      duration: "≈ 7h flight + 2h rail",
      stops: "1 stop",
      fareType: "Economy, checked bag",
      price: "≈ $620 pp",
    },
    moments: [
      {
        title: "A slow morning",
        note: "Coffee, the valley waking up, nowhere to be.",
        image: {
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
          alt: "Sunlight through tall forest trees on a calm morning",
          position: "center",
        },
      },
      {
        title: "The anchor day",
        note: "Open-air museum, ropeway, lakeside lunch.",
        image: {
          url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
          alt: "Foggy mountain valley with layered ridgelines",
          position: "center",
        },
      },
      {
        title: "An evening indulgence",
        note: "Multi-course kaiseki, served in-room.",
        image: {
          url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
          alt: "Warm, intimate restaurant interior at night",
          position: "center",
        },
      },
    ],
    dining: {
      name: "In-room kaiseki",
      note: "A quiet, multi-course dinner for just your four.",
      image: {
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        alt: "Elegant multi-course plated dish",
        position: "center",
      },
    },
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
        "Late-October foliage is near peak in the demo window",
        "Shoulder-season resort rates before the winter climb",
        "Weekday arrival avoids the Tokyo-day-tripper crowd",
      ],
    },
    tradeoffs: ["Main trade-off: a flight plus a train transfer to reach the valley"],
    externalSignals: [
      { label: "Weather window", value: "14–19°C · low humidity" },
      { label: "Foliage", value: "Near peak (demo)" },
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
    conceptTitle: "The low-effort version — dry, sunny, simple to move through",
    thesis: "The easiest journey of the three: dry spring warmth, ferries not cars, few moving parts.",
    recommendedWindow: "Mid-October · 4 nights",
    indicativePrice: "≈ $1,450–1,900 per person",
    flightTime: "≈ 5h, near-direct",
    weatherComfort: "Warm, dry spring days, very low humidity",
    journeyEffort: "One direct-ish flight, short transfers, no rail puzzle",
    mobilityFit: "Easy without driving — ferries, walkable city, rideshare",
    resortFit: "Good coastal hotels, though less of a true resort escape",
    confidence: "good-with-tradeoff",
    confidenceChips: [
      "Driest of the three",
      "No car needed",
      "Fewest connections",
      "Comfortably in budget",
    ],
    whyThisFits: [
      "It's the smoothest trip to actually get to and move around.",
      "Island days and long lunches match a laid-back group.",
      "Genuinely car-free on ferries and rideshare.",
    ],
    heroTone: "hero-perth",
    heroImage: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      alt: "Clear turquoise water meeting pale sand on a bright coast",
      position: "center 60%",
    },
    stay: {
      name: "A coastal design hotel",
      location: "Cottesloe / Swan River",
      image: {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        alt: "Resort pool terrace under warm, dry sunshine",
        position: "center",
      },
      attributes: ["Steps from the water", "Rooftop pool", "Walk-everywhere location"],
      price: "≈ $720 pp for 4 nights",
      why: "Bright and easy — you trade a little resort-ness for the simplest days.",
    },
    flight: {
      airline: "Garuda / Qantas",
      route: "CGK → PER",
      depart: "09:40 daytime",
      arrive: "16:10",
      duration: "≈ 5h",
      stops: "Direct",
      fareType: "Economy, checked bag",
      price: "≈ $430 pp",
    },
    moments: [
      {
        title: "A slow morning",
        note: "Coffee that rivals anywhere, then the river.",
        image: {
          url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
          alt: "A relaxed brunch spread on a bright table",
          position: "center",
        },
      },
      {
        title: "The anchor day",
        note: "Ferry to Rottnest, bikes optional, all beach.",
        image: {
          url: "https://images.unsplash.com/photo-1519046904884-53103b34b206",
          alt: "Aerial view of a turquoise bay and pale beach",
          position: "center",
        },
      },
      {
        title: "An evening indulgence",
        note: "A long wine-country-style lunch that runs late.",
        image: {
          url: "https://images.unsplash.com/photo-1533105079780-92b9be482077",
          alt: "Golden coastline at the end of the day",
          position: "center",
        },
      },
    ],
    dining: {
      name: "A long coastal lunch",
      note: "Fremantle market produce, wine, no rush.",
      image: {
        url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
        alt: "A generous shared table of food",
        position: "center",
      },
    },
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
        "October is dry-season spring in the demo data",
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
    thesis: "The most distinctive: serious lodge luxury and scenery, at the cost of a longer, pricier trip.",
    recommendedWindow: "Mid-November · 5 nights",
    indicativePrice: "≈ $2,600–3,400 per person",
    flightTime: "≈ 11h with a connection",
    weatherComfort: "Cool, crisp late-spring, very low humidity",
    journeyEffort: "Longer haul with a connection, but private transfers throughout",
    mobilityFit: "Car-free by design — lodge transfers and private drivers",
    resortFit: "Serious lodge luxury and scenery that does the work for you",
    confidence: "needs-input",
    confidenceChips: [
      "Furthest from humid",
      "No car needed",
      "Exceptional lodges",
      "Above your usual budget",
    ],
    whyThisFits: [
      "Alpine lodges here are genuinely exceptional for atmosphere.",
      "Slow mornings with a view fit your pace exactly.",
      "Private transfers make driving unnecessary throughout.",
    ],
    heroTone: "hero-queenstown",
    heroImage: {
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      alt: "A still alpine lake beneath dramatic mountains",
      position: "center 55%",
    },
    stay: {
      name: "A lakeside alpine lodge",
      location: "Lake Wakatipu",
      image: {
        url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
        alt: "Warm luxury lodge suite with a mountain view",
        position: "center",
      },
      attributes: ["Suite with a fire", "Lake-and-mountain view", "Full lodge service"],
      price: "≈ $1,680 pp for 5 nights",
      why: "The most special stay of the three — the view does the work for you.",
    },
    flight: {
      airline: "Singapore Airlines / Air NZ",
      route: "CGK → ZQN",
      depart: "08:15 daytime",
      arrive: "22:40",
      duration: "≈ 11h + connection",
      stops: "1 stop",
      fareType: "Economy, checked bag",
      price: "≈ $980 pp",
    },
    moments: [
      {
        title: "A slow morning",
        note: "The lake, the mountains, and a very good flat white.",
        image: {
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
          alt: "Sweeping mountain valley in soft light",
          position: "center",
        },
      },
      {
        title: "The anchor day",
        note: "A gentle lake cruise and a long, unhurried lunch.",
        image: {
          url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
          alt: "A wide green valley with a winding river",
          position: "center",
        },
      },
      {
        title: "An evening indulgence",
        note: "Wine country, then the fire back at the lodge.",
        image: {
          url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
          alt: "Rolling green hills at golden hour",
          position: "center",
        },
      },
    ],
    dining: {
      name: "A private wine-country lunch",
      note: "Central Otago cellar doors, at your own pace.",
      image: {
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
        alt: "Glasses of wine on a sunlit table",
        position: "center",
      },
    },
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
        "November is quiet between ski and peak summer (demo)",
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
    homeCreatedAt: null,
    lifecycle: "planning",
    componentStates: { stay: "undecided", flight: "undecided", experiences: "undecided" },
    trackedFlight: null,
    itineraryDraft: null,
    learnings: [],
    selectedAddonIds: [],
    collaborators: [
      { id: "traveler-organizer", name: "Nadya", email: "nadya@example.com", status: "organizer" },
    ],
    paymentSuccessAt: null,
    createdAt: now,
    updatedAt: now,
    ruledOut,
    // deep clone so edits never mutate the source arrays
    destinationProposals: proposals.map((p) => ({ ...p, fitReasons: { ...p.fitReasons } })),
    brief: {
      items: [
        { id: "b1", statement: "Travel within the next three months", level: "must", source: "user", editable: true },
        { id: "b2", statement: "Works without anyone driving", level: "must", source: "user", editable: true },
        { id: "b3", statement: "Four travelers from Jakarta", level: "must", source: "profile", editable: true },
        { id: "b4", statement: "Low humidity, comfortable weather", level: "prioritize", source: "user", editable: true },
        { id: "b5", statement: "A genuinely good resort", level: "prioritize", source: "user", editable: true },
        { id: "b6", statement: "A relaxed trip rhythm", level: "prioritize", source: "profile", editable: true },
        { id: "b7", statement: "Easy door-to-door movement", level: "prioritize", source: "inferred", editable: true },
        { id: "b8", statement: "Exact destination", level: "flexible", source: "inferred", editable: true },
        { id: "b9", statement: "Exact date window", level: "flexible", source: "inferred", editable: true },
        { id: "b10", statement: "Airline and number of stops", level: "flexible", source: "profile", editable: true },
        { id: "b11", statement: "Renting a car", level: "avoid", source: "user", editable: true },
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
