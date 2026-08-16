import type {
  ChoiceValue,
  ImageRef,
  LoyaltyEntry,
  PrefCategory,
  ProfilePref,
} from "@/lib/types";

/* ============================================================
   Traveler Profile Calibration — content + builders.
   Photography uses fixed Unsplash IDs; the <Photo> component
   degrades gracefully if any specific ID stops resolving.
   ============================================================ */

const img = (id: string, alt: string, position = "center"): ImageRef => ({
  url: `https://images.unsplash.com/photo-${id}`,
  alt,
  position,
});

export interface PrefSeed {
  category: PrefCategory;
  priority: "always" | "usually" | "flexible" | "avoid";
  statement: string;
}

export interface RoundOption {
  key: "A" | "B";
  title: string;
  points: string[]; // no more than three
  image?: ImageRef;
  itinerary?: { label: string; depart: string; arrive: string; duration: string; stops: string };
  more?: string;
  pref: PrefSeed;
}

export interface Round {
  id: string;
  question: string;
  kind: "image" | "flight";
  a: RoundOption;
  b: RoundOption;
  dependsPref: PrefSeed;
}

/* -------------------- Six core rounds -------------------- */
export const CORE_ROUNDS: Round[] = [
  {
    id: "r1",
    question: "Which flight would you usually choose?",
    kind: "flight",
    a: {
      key: "A",
      title: "Direct, better timing",
      points: ["Direct flight", "Better arrival time", "Higher price"],
      itinerary: { label: "Direct", depart: "10:20", arrive: "18:05", duration: "7h 45m", stops: "Nonstop" },
      pref: { category: "Flights", priority: "usually", statement: "Prefer direct flights when the price difference is reasonable." },
    },
    b: {
      key: "B",
      title: "One stop, better price",
      points: ["One manageable stop", "Longer journey", "Meaningful savings"],
      itinerary: { label: "1 stop", depart: "09:05", arrive: "21:40", duration: "12h 35m", stops: "1 stop · SIN" },
      pref: { category: "Flights", priority: "usually", statement: "Happy to take one manageable stop to save meaningfully." },
    },
    dependsPref: { category: "Flights", priority: "flexible", statement: "Flexible on stops — it depends on price and timing." },
  },
  {
    id: "r2",
    question: "Which stay sounds better?",
    kind: "image",
    a: {
      key: "A",
      title: "Central & walkable",
      points: ["Smaller room", "Walkable central location", "Steps from restaurants"],
      image: img("1502602898657-3e91760cbb34", "A lively, walkable city street near cafés and shops"),
      pref: { category: "Stays", priority: "usually", statement: "Usually prioritise a central, walkable location over room size." },
    },
    b: {
      key: "B",
      title: "Roomy & quiet",
      points: ["Larger room", "Quieter neighbourhood", "More transport needed"],
      image: img("1618773928121-c32242e63f39", "A large, calm hotel room in a quiet setting"),
      pref: { category: "Stays", priority: "usually", statement: "Prefer a larger, quieter room even if it's less central." },
    },
    dependsPref: { category: "Stays", priority: "flexible", statement: "Flexible on location versus room size." },
  },
  {
    id: "r3",
    question: "Where would you rather stay?",
    kind: "image",
    a: {
      key: "A",
      title: "Beautifully designed",
      points: ["Design-led property", "More amenities", "Higher nightly rate"],
      image: img("1566073771259-6a8506099945", "A beautifully designed hotel room with warm light"),
      pref: { category: "Stays", priority: "usually", statement: "Willing to pay more for a beautifully designed hotel." },
    },
    b: {
      key: "B",
      title: "Simple & good value",
      points: ["Simpler property", "Everything essential", "More budget for the trip"],
      image: img("1445019980597-93fa8acb246c", "A clean, simple and comfortable hotel room"),
      pref: { category: "Spending", priority: "usually", statement: "Prefer a simpler stay to keep more budget for the trip." },
    },
    dependsPref: { category: "Stays", priority: "flexible", statement: "Flexible on hotel design versus price." },
  },
  {
    id: "r4",
    question: "What should a good day feel like?",
    kind: "image",
    a: {
      key: "A",
      title: "Slow & open",
      points: ["One or two highlights", "Long meals, free time", "Space to change your mind"],
      image: img("1504674900247-0877df9cc836", "A relaxed, unhurried long lunch"),
      pref: { category: "Pace", priority: "usually", statement: "Prefer a slower itinerary with plenty of free time." },
    },
    b: {
      key: "B",
      title: "Full & active",
      points: ["Several planned stops", "Make the most of each day", "Less unstructured time"],
      image: img("1533105079780-92b9be482077", "A vibrant day out with lots to see"),
      pref: { category: "Pace", priority: "usually", statement: "Like to see a lot — a fuller, more active itinerary." },
    },
    dependsPref: { category: "Pace", priority: "flexible", statement: "Flexible on pace, day to day." },
  },
  {
    id: "r5",
    question: "How do you prefer to get around?",
    kind: "image",
    a: {
      key: "A",
      title: "Walk & transit",
      points: ["Walkable or transit-connected", "More independent", "Some navigation needed"],
      image: img("1441974231531-c6227db76b6e", "A walkable, tree-lined path through a city"),
      pref: { category: "Ground transport", priority: "usually", statement: "Happy to use public transport in easy-to-navigate cities." },
    },
    b: {
      key: "B",
      title: "Taxis & transfers",
      points: ["Taxis or private transfers", "Door-to-door convenience", "Higher transport cost"],
      image: img("1449965408869-eaa3f722e40d", "The back seat of a private car transfer"),
      pref: { category: "Ground transport", priority: "usually", statement: "Prefer taxis or private transfers, door to door." },
    },
    dependsPref: { category: "Ground transport", priority: "flexible", statement: "Flexible on how to get around." },
  },
  {
    id: "r6",
    question: "Where should the trip feel most special?",
    kind: "image",
    a: {
      key: "A",
      title: "The stay",
      points: ["The hotel or resort", "Better room and facilities", "More time on the property"],
      image: img("1582719478250-c89cae4dc85b", "A serene resort pool and terrace"),
      pref: { category: "Spending", priority: "usually", statement: "Splurge on the hotel more often than on activities." },
    },
    b: {
      key: "B",
      title: "The experiences",
      points: ["Food and experiences", "Memorable activities", "A practical place to stay"],
      image: img("1414235077428-338989a2e8c0", "An elegant, memorable dining experience"),
      pref: { category: "Spending", priority: "usually", statement: "Splurge on food and experiences over the hotel." },
    },
    dependsPref: { category: "Spending", priority: "flexible", statement: "Flexible on where to splurge." },
  },
];

/* -------------------- Adaptive round 7 -------------------- */
export function round7(answers: Record<string, ChoiceValue>): Round {
  const r1 = answers.r1;
  if (r1 === "A") {
    return {
      id: "r7",
      question: "And here — which would you choose?",
      kind: "flight",
      a: {
        key: "A",
        title: "Direct, unfamiliar airline",
        points: ["Nonstop", "An airline you don't know", "Great timing"],
        itinerary: { label: "Direct", depart: "11:00", arrive: "18:30", duration: "7h 30m", stops: "Nonstop" },
        pref: { category: "Flights", priority: "usually", statement: "Directness matters more than which airline you fly." },
      },
      b: {
        key: "B",
        title: "Preferred airline, one stop",
        points: ["A short stop", "An airline you like", "Familiar comfort"],
        itinerary: { label: "1 stop", depart: "10:10", arrive: "20:15", duration: "10h 05m", stops: "1 stop" },
        pref: { category: "Loyalty", priority: "usually", statement: "Lean toward airlines you know, even with a short stop." },
      },
      dependsPref: { category: "Flights", priority: "flexible", statement: "Airline and directness both matter — it depends." },
    };
  }
  if (r1 === "B") {
    return {
      id: "r7",
      question: "And here — which would you choose?",
      kind: "flight",
      a: {
        key: "A",
        title: "Lowest fare, awkward times",
        points: ["Cheapest option", "Very early or late", "You'll manage"],
        itinerary: { label: "Cheapest", depart: "05:30", arrive: "23:10", duration: "13h 40m", stops: "1 stop" },
        pref: { category: "Spending", priority: "usually", statement: "Take the lowest fare even with an awkward schedule." },
      },
      b: {
        key: "B",
        title: "A bit more, much better times",
        points: ["Slightly higher fare", "Civilised departure", "Better arrival"],
        itinerary: { label: "Better times", depart: "10:40", arrive: "19:20", duration: "10h 40m", stops: "1 stop" },
        pref: { category: "Flights", priority: "usually", statement: "Pay a bit more for much better departure and arrival times." },
      },
      dependsPref: { category: "Flights", priority: "flexible", statement: "Price versus timing — it depends on the trip." },
    };
  }
  return {
    id: "r7",
    question: "One more on flights — which fits you?",
    kind: "flight",
    a: {
      key: "A",
      title: "Ideal schedule, new airline",
      points: ["Perfect timing", "An airline you don't know", "No status perks"],
      itinerary: { label: "Best times", depart: "10:00", arrive: "18:00", duration: "8h 00m", stops: "Nonstop" },
      pref: { category: "Flights", priority: "usually", statement: "Prioritise a good schedule over airline loyalty." },
    },
    b: {
      key: "B",
      title: "Loyalty airline, worse times",
      points: ["Status and perks", "An airline you like", "Less convenient"],
      itinerary: { label: "Your airline", depart: "07:30", arrive: "20:40", duration: "11h 10m", stops: "1 stop" },
      pref: { category: "Loyalty", priority: "usually", statement: "Prioritise airline loyalty benefits over a perfect schedule." },
    },
    dependsPref: { category: "Flights", priority: "flexible", statement: "Airline, schedule and price matter about equally." },
  };
}

/* -------------------- Adaptive round 8 -------------------- */
export function round8(answers: Record<string, ChoiceValue>): Round {
  const splurge = answers.r6;
  const pace = answers.r4;

  if (splurge === "B") {
    return {
      id: "r8",
      question: "If you splurged once, on what?",
      kind: "image",
      a: {
        key: "A",
        title: "A signature dinner",
        points: ["A standout meal", "Booked well ahead", "A proper occasion"],
        image: img("1517248135467-4c7edcad34c4", "An intimate, candlelit fine-dining room"),
        pref: { category: "Spending", priority: "usually", statement: "When splurging, choose a signature dinner." },
      },
      b: {
        key: "B",
        title: "A private experience",
        points: ["A guided day", "Just your group", "Somewhere memorable"],
        image: img("1469474968028-56623f02e42e", "A sweeping landscape on a private guided day"),
        pref: { category: "Spending", priority: "usually", statement: "When splurging, choose a standout experience over a dinner." },
      },
      dependsPref: { category: "Spending", priority: "flexible", statement: "Flexible on which splurge feels most special." },
    };
  }
  if (pace === "A") {
    return {
      id: "r8",
      question: "With a free day, what wins?",
      kind: "image",
      a: {
        key: "A",
        title: "A resort day",
        points: ["Stay put", "Pool, spa, slow lunch", "Nothing scheduled"],
        image: img("1582719478250-c89cae4dc85b", "A calm resort pool for a slow day"),
        pref: { category: "Pace", priority: "usually", statement: "Given a free day, choose a relaxed resort day." },
      },
      b: {
        key: "B",
        title: "An extra day out",
        points: ["See one more place", "A gentle excursion", "Back by evening"],
        image: img("1519046904884-53103b34b206", "An inviting coastline for a day trip"),
        pref: { category: "Pace", priority: "usually", statement: "Given a free day, add a little more sightseeing." },
      },
      dependsPref: { category: "Pace", priority: "flexible", statement: "A free day could go either way — it depends." },
    };
  }
  return {
    id: "r8",
    question: "Which sounds more like your trip?",
    kind: "image",
    a: {
      key: "A",
      title: "The icons",
      points: ["The must-see sights", "The landmarks", "The postcard moments"],
      image: img("1501785888041-af3ef285b470", "An iconic, dramatic landscape view"),
      pref: { category: "Pace", priority: "usually", statement: "Prefer hitting the iconic attractions." },
    },
    b: {
      key: "B",
      title: "The local side",
      points: ["Neighbourhood food", "Where locals go", "Small discoveries"],
      image: img("1504674900247-0877df9cc836", "A local neighbourhood table of food"),
      pref: { category: "Food", priority: "usually", statement: "Prefer local food and neighbourhood discoveries over big attractions." },
    },
    dependsPref: { category: "Food", priority: "flexible", statement: "Icons or local side — it depends on the place." },
  };
}

export function roundsFor(answers: Record<string, ChoiceValue>): Round[] {
  return [...CORE_ROUNDS, round7(answers), round8(answers)];
}

export const TOTAL_ROUNDS = 8;

/* -------------------- Explicit capture presets -------------------- */
export const MUST_HAVE_PRESETS = [
  "Direct flights",
  "Checked baggage",
  "Accessible accommodation",
  "Private bathroom",
  "Central location",
  "Air conditioning",
  "Flexible cancellation",
  "Traveling together",
  "Specific dietary requirements",
];

export const AVOID_PRESETS = [
  "Overnight flights",
  "Long layovers",
  "Shared bathrooms",
  "Hostels",
  "Renting a car",
  "Public transportation",
  "Very early departures",
  "Packed itineraries",
];

export const LOYALTY_OPTIONS: { name: string; kind: LoyaltyEntry["kind"] }[] = [
  { name: "Singapore Airlines KrisFlyer", kind: "airline" },
  { name: "ANA Mileage Club", kind: "airline" },
  { name: "Qantas Frequent Flyer", kind: "airline" },
  { name: "GarudaMiles", kind: "airline" },
  { name: "Cathay Marco Polo", kind: "airline" },
  { name: "Marriott Bonvoy", kind: "hotel" },
  { name: "Hilton Honors", kind: "hotel" },
  { name: "Accor ALL", kind: "hotel" },
  { name: "IHG One Rewards", kind: "hotel" },
  { name: "World of Hyatt", kind: "hotel" },
  { name: "Amex Platinum travel", kind: "card" },
  { name: "Chase Sapphire", kind: "card" },
];

const MUST_CATEGORY: Record<string, PrefCategory> = {
  "Direct flights": "Flights",
  "Checked baggage": "Flights",
  "Accessible accommodation": "Accessibility",
  "Private bathroom": "Accessibility",
  "Central location": "Stays",
  "Air conditioning": "Accessibility",
  "Flexible cancellation": "Stays",
  "Traveling together": "Group travel",
  "Specific dietary requirements": "Food",
};
const AVOID_CATEGORY: Record<string, PrefCategory> = {
  "Overnight flights": "Flights",
  "Long layovers": "Flights",
  "Shared bathrooms": "Accessibility",
  Hostels: "Stays",
  "Renting a car": "Ground transport",
  "Public transportation": "Ground transport",
  "Very early departures": "Flights",
  "Packed itineraries": "Pace",
};

function confidenceFor(answer: ChoiceValue): number {
  if (answer === "A" || answer === "B") return 0.7;
  if (answer === "depends") return 0.4;
  return 0;
}

let counter = 0;
function pid(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}-${(counter * 2654435761) % 100000}`;
}

/**
 * Build the initial Traveler Profile from calibration input.
 * Comparisons only ever produce "usually"/"flexible" preferences —
 * absolute must-haves and avoids come exclusively from explicit capture.
 */
export function buildPrefsFromCalibration(
  answers: Record<string, ChoiceValue>,
  mustHaves: string[],
  avoids: string[]
): ProfilePref[] {
  const prefs: ProfilePref[] = [];
  let order = 0;

  const rounds = roundsFor(answers);
  for (const round of rounds) {
    const ans = answers[round.id];
    if (!ans || ans === "none") continue;
    const seed =
      ans === "A" ? round.a.pref : ans === "B" ? round.b.pref : round.dependsPref;
    prefs.push({
      id: pid("cal"),
      category: seed.category,
      statement: seed.statement,
      priority: seed.priority,
      scope: "all",
      source: "onboarding",
      confidence: confidenceFor(ans),
      order: order++,
    });
  }

  for (const m of mustHaves) {
    prefs.push({
      id: pid("must"),
      category: MUST_CATEGORY[m] ?? "Stays",
      statement: `Always: ${m.toLowerCase()}.`,
      priority: "always",
      scope: "all",
      source: "onboarding",
      confidence: 1,
      order: order++,
    });
  }

  for (const a of avoids) {
    prefs.push({
      id: pid("avoid"),
      category: AVOID_CATEGORY[a] ?? "Stays",
      statement: `Avoid ${a.toLowerCase()}.`,
      priority: "avoid",
      scope: "all",
      source: "onboarding",
      confidence: 1,
      order: order++,
    });
  }

  return prefs;
}

/* -------------------- Personalization line for proposals -------------------- */
export function personalizationLine(prefs: ProfilePref[]): string | null {
  if (!prefs.length) return null;
  const clause = (s: string) => s.replace(/^Always:\s*/i, "").replace(/\.$/, "").trim();

  const positive =
    prefs.find((p) => p.priority === "always") ??
    prefs.find((p) => p.priority === "usually");
  const avoid = prefs.find((p) => p.priority === "avoid");

  const bits: string[] = [];
  if (positive) bits.push(clause(positive.statement));
  if (avoid) bits.push(clause(avoid.statement));
  if (!bits.length) return null;
  return `Tuned to your profile — ${bits.join(". ")}.`;
}

/* -------------------- Contextual learning (flight demo) -------------------- */
export const CONTRA_FLIGHTS = {
  direct: {
    id: "sq-direct",
    airline: "Singapore Airlines",
    label: "Direct — matches your profile",
    route: "CGK → HND",
    depart: "10:20",
    arrive: "18:05",
    duration: "7h 45m",
    stops: "Nonstop",
    price: "Rp 12.800.000 pp",
    aligns: true,
  },
  oneStopAna: {
    id: "nh-onestop",
    airline: "ANA",
    label: "One stop — against your usual preference",
    route: "CGK → NRT",
    depart: "08:40",
    arrive: "19:30",
    duration: "10h 50m",
    stops: "1 stop · SIN",
    price: "Rp 10.400.000 pp",
    aligns: false,
  },
};

export const LEARN_REASONS = [
  "Better price",
  "Better departure time",
  "Better arrival time",
  "Using ANA miles or status",
  "Better cabin or aircraft",
  "Traveling with someone",
  "Just for this trip",
];
