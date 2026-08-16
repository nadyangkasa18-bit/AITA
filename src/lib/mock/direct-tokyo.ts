import type { DestinationProposal } from "@/lib/types";

export const DIRECT_TOKYO_PROPOSAL: DestinationProposal = {
  id: "tokyo-direct",
  destination: "Tokyo",
  region: "Japan",
  recommendationType: "top",
  conceptTitle: "Three nights in Tokyo, already narrowed to what matters",
  thesis: "You already know the destination and length, so Roam skips inspiration and coordinates the flight and hotel decision directly.",
  recommendedWindow: "3 nights · dates from your prompt",
  indicativePrice: "≈ Rp 24–31m per person",
  flightTime: "≈ 7h direct from Jakarta",
  weatherComfort: "Seasonal context checked during booking",
  journeyEffort: "Direct flight, then one airport transfer",
  mobilityFit: "Easy by rail and taxi — no car needed",
  resortFit: "Central design hotel near a major station",
  confidence: "strong",
  confidenceChips: ["Destination already decided", "3-night stay", "Flight + hotel requested", "Direct-booking path"],
  whyThisFits: [
    "There is no destination decision left to make.",
    "Three nights makes location and flight timing more important than building a long itinerary.",
    "Roam can coordinate the hotel and flight together instead of sending you through inspiration first.",
  ],
  fitReasons: {
    you: ["Prefers a comfortable journey", "Cares about hotel design and atmosphere"],
    thisTrip: ["Tokyo is fixed", "Three nights", "Needs both flight and hotel"],
    rightNow: ["Prototype availability and fares are illustrative", "Central Tokyo keeps a short trip efficient"],
  },
  tradeoffs: ["Main trade-off: a central hotel costs more, but saves meaningful time on a three-night trip"],
  externalSignals: [
    { label: "Flight", value: "Direct options available (prototype)" },
    { label: "Stay", value: "Central Tokyo, station-first" },
    { label: "Trip length", value: "3 nights" },
  ],
  rhythmPreview: [
    { day: "Day 1", summary: "Arrive, easy transfer, neighborhood dinner" },
    { day: "Day 2", summary: "One full Tokyo day with room to wander" },
    { day: "Day 3", summary: "Second anchor day, late dinner, no hotel move" },
    { day: "Day 4", summary: "Slow breakfast, direct transfer to the airport" },
  ],
  signatureExperience: "A compact Tokyo stay that spends time on the city, not logistics",
  indulgentMoment: "A great dinner within walking distance of the hotel",
  localPleasure: "Coffee and convenience-store breakfast before the city wakes up",
  protectedDowntime: "One unplanned evening",
  stillUnconfirmed: ["Exact dates", "Room type and cancellation preference"],
  heroTone: "hero-hakone",
  heroImage: {
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    alt: "Tokyo city lights and streets at dusk",
    position: "center 50%",
  },
  stay: {
    name: "Shibuya Stream Hotel",
    location: "Shibuya · connected to the station",
    image: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      alt: "Modern hotel room with warm light",
      position: "center",
    },
    attributes: ["Station-connected", "Design-led rooms", "Easy airport access"],
    price: "≈ Rp 11.8m pp for 3 nights",
    why: "For a three-night trip, the location earns its premium by removing repeated transit decisions.",
  },
  flight: {
    airline: "Garuda Indonesia",
    route: "CGK → HND",
    depart: "08:20",
    arrive: "17:30",
    duration: "≈ 7h 10m",
    stops: "Direct",
    fareType: "Economy Flex · checked bag",
    price: "≈ Rp 12.4m pp return",
  },
  moments: [
    {
      title: "Arrival night",
      note: "Check in, walk to dinner, no cross-city transfer.",
      image: {
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390",
        alt: "Tokyo streets illuminated at night",
        position: "center",
      },
    },
    {
      title: "One big city day",
      note: "Choose one neighborhood cluster instead of racing across Tokyo.",
      image: {
        url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc",
        alt: "Tokyo urban street scene",
        position: "center",
      },
    },
    {
      title: "Late dinner",
      note: "Stay out without worrying about the journey back.",
      image: {
        url: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
        alt: "Japanese dining counter with warm lighting",
        position: "center",
      },
    },
  ],
  dining: {
    name: "Neighborhood-first dining",
    note: "Roam keeps the hotel central so dinner choices stay flexible.",
    image: {
      url: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
      alt: "Japanese restaurant counter",
      position: "center",
    },
  },
  status: "selected",
};

export function isDirectTokyoBookingPrompt(prompt: string) {
  const text = prompt.toLowerCase();
  const knowsTokyo = text.includes("tokyo");
  const knowsLength = /3\s*(night|nights)/.test(text) || text.includes("three nights");
  const wantsFlight = text.includes("flight");
  const wantsHotel = text.includes("hotel") || text.includes("stay");
  return knowsTokyo && knowsLength && wantsFlight && wantsHotel;
}
