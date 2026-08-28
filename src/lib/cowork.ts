import type { BriefLevel, ProfileState, Trip } from "@/lib/types";

export type WorkspaceStage = "brief" | "reasoning" | "flights" | "hotel" | "review";
export type FolderView = "plan" | "map" | "brain";
export type DecisionStatus = "Not started" | "Reviewing" | "Tracked" | "Selected" | "Booked" | "Complete";
export type FixedEvent = { id: string; title: string; place: string; when: string; note?: string; source: "user" | "calendar-sample" | "ai-import" };
export type TripBrainEntry = { id: string; statement: string; category: string; scope: "this-trip" | "similar" | "all"; source: "trip" | "import" | "decision" };
export type CoworkState = {
  stage: WorkspaceStage; folderView: FolderView; contextPrompt: string; fixedEvents: FixedEvent[]; savedPlaces: string[];
  destinationStops: string[]; selectedFlightId: string | null; flightStatus: DecisionStatus; selectedStayId: string | null; stayStatus: DecisionStatus;
  brain: TripBrainEntry[]; flexibleDay: number; imported: boolean; calendarPreviewed: boolean; groupBookingForEveryone: boolean;
  invitedSample: boolean; questionIndex: number; dismissedQuestions: number[]; reasoningComplete: boolean; correctedAssumption: string | null;
};
export const COWORK_STORAGE_KEY = "roaminrabbit.cowork.v1";
export const PENDING_IMPORT_KEY = "roaminrabbit.ai-import.pending.v1";

export type FlightDecisionOption = { id: string; purpose: "Best fit for this trip" | "Cheapest reasonable" | "Fastest reasonable"; airline: string; route: string; depart: string; arrive: string; duration: string; stops: string; baggage: string; flexibility: string; price: number; tradeoff: string; why: string };
export type StayDecisionOption = { id: string; purpose: "Best fit for this trip" | "Better room" | "Lower price"; name: string; area: string; room: string; cancellation: string; price: number; eventTimes: string[]; anchors: string[]; tradeoff: string; why: string; map: { x: number; y: number } };
export type ImportGroup = { key: "facts" | "must" | "priorities" | "flexible" | "avoid" | "places" | "events"; label: string; items: string[] };

export const IMPORT_SAMPLE = `We are going to Los Angeles for a UCLA graduation. Two adults, May 14–18. Graduation is Friday at 10am at UCLA and we already booked dinner in Century City at 7:30pm. I would rather pay a little more for a direct daytime flight. Keep the first afternoon light. We like design hotels but location matters more than room size. Save Gjelina and The Getty as ideas. Avoid red-eyes and long cross-city drives.`;
export const IMPORT_GROUPS: ImportGroup[] = [
  { key: "facts", label: "Trip facts", items: ["Los Angeles · May 14–18", "2 travelers"] },
  { key: "must", label: "Must protect", items: ["UCLA graduation · Friday 10:00", "Dinner in Century City · Friday 19:30"] },
  { key: "priorities", label: "Priorities", items: ["Direct daytime flight", "Hotel location over room size"] },
  { key: "flexible", label: "Flexible preferences", items: ["Design-forward hotel", "Keep the first afternoon light"] },
  { key: "avoid", label: "Avoid", items: ["Red-eye flights", "Long cross-city drives"] },
  { key: "places", label: "Saved places", items: ["Gjelina", "The Getty"] },
  { key: "events", label: "Fixed events", items: ["Graduation at UCLA · Fri 10:00", "Dinner in Century City · Fri 19:30"] },
];
export const SAMPLE_CALENDAR_EVENTS: FixedEvent[] = [
  { id: "cal-ucla", title: "Graduation", place: "UCLA", when: "Fri · 10:00", source: "calendar-sample" },
  { id: "cal-dinner", title: "Dinner reservation", place: "Century City", when: "Fri · 19:30", source: "calendar-sample" },
];
export const GUIDED_QUESTIONS = ["Would you pay more for a direct flight?", "Is the hotel neighborhood more important than room size?", "Should we keep the first day light?"];

export function promptField(prompt: string, label: string) { const prefix = `${label}:`; return prompt.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? ""; }
export function tripDestination(trip: Trip) { const raw = promptField(trip.originalPrompt, "Destination"); if (raw && raw !== "Help me choose") return raw; return trip.destinationProposals.find((p) => p.id === trip.selectedProposalId)?.destination ?? (raw || "Destination open"); }
export function tripDates(trip: Trip) { return promptField(trip.originalPrompt, "Dates") || "Dates flexible"; }
export function defaultCoworkState(trip: Trip): CoworkState {
  const destination = tripDestination(trip);
  return {
    stage: "brief", folderView: "plan", contextPrompt: promptField(trip.originalPrompt, "Context"), fixedEvents: [], savedPlaces: [], destinationStops: destination === "Destination open" ? [] : [destination],
    selectedFlightId: trip.trackedFlight?.id ?? null, flightStatus: trip.componentStates.flight === "confirmed" ? "Booked" : trip.componentStates.flight === "tracked" ? "Tracked" : trip.componentStates.flight === "saved" ? "Selected" : "Not started",
    selectedStayId: null, stayStatus: trip.componentStates.stay === "confirmed" ? "Booked" : trip.componentStates.stay === "tracked" ? "Tracked" : trip.componentStates.stay === "saved" ? "Selected" : "Not started",
    brain: trip.learnings.map((statement, index) => ({ id: `learning-${index}`, statement, category: "Trip learning", scope: "this-trip" as const, source: "decision" as const })), flexibleDay: 2,
    imported: false, calendarPreviewed: false, groupBookingForEveryone: true, invitedSample: false, questionIndex: 0, dismissedQuestions: [], reasoningComplete: false, correctedAssumption: null,
  };
}
export function extractBriefItems(text: string): { statement: string; level: BriefLevel }[] {
  return text.split(/[.\n;]+/).map((part) => part.trim()).filter((part) => part.length > 3).slice(0, 10).map((statement) => {
    const lower = statement.toLowerCase();
    if (/must|already booked|graduation|wedding|conference|reservation|need to|fixed/.test(lower)) return { statement, level: "must" as const };
    if (/avoid|no red|don.t want|hate|without/.test(lower)) return { statement, level: "avoid" as const };
    if (/prefer|rather|important|priority|direct|location/.test(lower)) return { statement, level: "prioritize" as const };
    return { statement, level: "flexible" as const };
  });
}
export function importLevel(group: ImportGroup["key"]): BriefLevel | null { if (group === "must" || group === "events") return "must"; if (group === "priorities") return "prioritize"; if (["flexible","places","facts"].includes(group)) return "flexible"; if (group === "avoid") return "avoid"; return null; }
const isLA = (destination: string) => /los angeles|la\b|california/i.test(destination);

export function flightOptions(destination: string): FlightDecisionOption[] {
  if (isLA(destination)) return [
    { id:"sq-lax-best", purpose:"Best fit for this trip", airline:"Singapore Airlines", route:"CGK → LAX", depart:"08:25", arrive:"18:05", duration:"19h 40m", stops:"1 stop", baggage:"2 checked bags", flexibility:"Changeable fare", price:18_900_000, tradeoff:"Rp 2.1m more than the lowest reasonable option.", why:"You land early enough to settle in before the UCLA graduation day, with checked baggage and a changeable fare." },
    { id:"eva-lax-value", purpose:"Cheapest reasonable", airline:"EVA Air", route:"CGK → LAX", depart:"14:20", arrive:"20:40", duration:"21h 20m", stops:"1 stop", baggage:"2 checked bags", flexibility:"Change fee applies", price:16_800_000, tradeoff:"Later arrival and less flexible if plans move.", why:"It protects the core dates and baggage needs while saving Rp 2.1m per traveler." },
    { id:"cx-lax-fast", purpose:"Fastest reasonable", airline:"Cathay Pacific", route:"CGK → LAX", depart:"05:15", arrive:"14:10", duration:"17h 55m", stops:"1 stop", baggage:"2 checked bags", flexibility:"Changeable fare", price:20_600_000, tradeoff:"Very early departure and the highest fare of the three.", why:"It gets you to Los Angeles with the most recovery time before fixed events." },
  ];
  if (/tokyo|japan/i.test(destination)) return [
    { id:"jal-best", purpose:"Best fit for this trip", airline:"Japan Airlines", route:"CGK → HND", depart:"06:45", arrive:"16:10", duration:"7h 25m", stops:"Nonstop", baggage:"1 checked bag", flexibility:"Changeable fare", price:10_800_000, tradeoff:"Slightly more than the lowest fare.", why:"The nonstop journey protects the useful arrival day and keeps baggage simple." },
    { id:"ana-value", purpose:"Cheapest reasonable", airline:"ANA", route:"CGK → HND", depart:"07:10", arrive:"17:25", duration:"10h 15m", stops:"1 stop", baggage:"1 checked bag", flexibility:"Changeable fare", price:8_900_000, tradeoff:"Adds a connection and nearly three hours.", why:"It saves meaningful money without turning the journey into an overnight layover." },
    { id:"garuda-fast", purpose:"Fastest reasonable", airline:"Garuda Indonesia", route:"CGK → HND", depart:"23:35", arrive:"08:50 +1", duration:"7h 15m", stops:"Nonstop", baggage:"1 checked bag", flexibility:"Limited changes", price:10_200_000, tradeoff:"It is a red-eye, so the arrival day is harder.", why:"It is the quickest elapsed journey, but only worth it if overnight flying is acceptable." },
  ];
  const city = destination.split(",")[0] || "your destination";
  return [
    { id:"generic-best", purpose:"Best fit for this trip", airline:"Best-fit carrier", route:`CGK → ${city}`, depart:"09:10", arrive:"16:40", duration:"7h 30m", stops:"Nonstop", baggage:"1 checked bag", flexibility:"Changeable fare", price:8_900_000, tradeoff:"Not the absolute lowest fare.", why:"It keeps the journey simple and protects the useful part of arrival day." },
    { id:"generic-value", purpose:"Cheapest reasonable", airline:"Best-value carrier", route:`CGK → ${city}`, depart:"07:20", arrive:"17:50", duration:"10h 30m", stops:"1 stop", baggage:"1 checked bag", flexibility:"Change fee applies", price:7_200_000, tradeoff:"Longer journey with one connection.", why:"It saves money without introducing an overnight layover." },
    { id:"generic-fast", purpose:"Fastest reasonable", airline:"Fastest carrier", route:`CGK → ${city}`, depart:"11:30", arrive:"18:10", duration:"6h 40m", stops:"Nonstop", baggage:"1 checked bag", flexibility:"Changeable fare", price:9_600_000, tradeoff:"Higher fare for a shorter travel day.", why:"It buys back time when the trip itself is short." },
  ];
}

export function stayOptions(destination: string, events: FixedEvent[]): StayDecisionOption[] {
  if (isLA(destination)) {
    const hasUcla = events.some((event) => /ucla|graduation/i.test(`${event.title} ${event.place}`));
    return [
      { id:"luskin", purpose:"Best fit for this trip", name:"Luskin Conference Center", area:"Westwood", room:"King room · breakfast included", cancellation:"Free cancellation until 48h before arrival", price:14_800_000, eventTimes:["UCLA graduation · 6 min walk","Century City dinner · 12 min drive"], anchors:["UCLA","Century City"], map:{x:31,y:43}, tradeoff:"Less nightlife immediately around the hotel.", why:hasUcla ? "Westwood removes the biggest logistics risk: getting to the graduation on time, while Century City stays close." : "Westwood keeps the west side compact and avoids repeated cross-city drives." },
      { id:"maybourne", purpose:"Better room", name:"The Maybourne Beverly Hills", area:"Beverly Hills", room:"Superior king · larger room", cancellation:"Free cancellation until 72h before arrival", price:22_400_000, eventTimes:["UCLA graduation · ~18 min drive","Century City dinner · ~8 min drive"], anchors:["Century City","Beverly Hills"], map:{x:43,y:49}, tradeoff:"A better room, but more driving to UCLA and a much higher total.", why:"This is the comfort upgrade if the room matters more than minimizing travel time." },
      { id:"dtla", purpose:"Lower price", name:"Downtown LA Proper", area:"Downtown", room:"Premier king", cancellation:"Non-refundable sample rate", price:12_600_000, eventTimes:["UCLA graduation · ~45–65 min drive","Century City dinner · ~35–55 min drive"], anchors:["Downtown"], map:{x:72,y:48}, tradeoff:"Lower room price, but inefficient for both fixed events.", why:"It only wins on price; the location creates avoidable travel work for this particular trip." },
    ];
  }
  if (/tokyo|japan/i.test(destination)) return [
    { id:"muji", purpose:"Best fit for this trip", name:"MUJI Hotel Ginza", area:"Ginza", room:"Type C · 1 queen", cancellation:"Free cancellation until 3 days before", price:11_600_000, eventTimes:["Central rail access · 4 min walk"], anchors:["Ginza","Tokyo Station"], tradeoff:"Smaller room than the comfort alternative.", why:"The location removes the most day-to-day transit work while keeping the hotel itself distinctive.", map:{x:52,y:48} },
    { id:"trunk", purpose:"Better room", name:"Trunk Hotel Yoyogi Park", area:"Shibuya", room:"Standard + balcony", cancellation:"Free cancellation until 5 days before", price:13_800_000, eventTimes:["Shibuya · 8 min","Ginza · 20 min"], anchors:["Yoyogi","Shibuya"], tradeoff:"More atmosphere and room, less central for east-side plans.", why:"This is the design-and-comfort upgrade if you are happy to trade some centrality.", map:{x:34,y:50} },
    { id:"kaika", purpose:"Lower price", name:"KAIKA Tokyo", area:"Asakusa", room:"Twin room", cancellation:"Free cancellation until 48h before", price:9_700_000, eventTimes:["Ginza · 25 min","Shibuya · 35 min"], anchors:["Asakusa"], tradeoff:"Better value but more transit for central plans.", why:"It gives up some location efficiency for a meaningful saving.", map:{x:68,y:38} },
  ];
  const city = destination.split(",")[0] || "Central";
  return [
    { id:"stay-best", purpose:"Best fit for this trip", name:`${city} Central Hotel`, area:"Central district", room:"King room · flexible rate", cancellation:"Free cancellation until 48h before", price:9_800_000, eventTimes:["Main trip anchors · 10–15 min"], anchors:["Central district"], tradeoff:"Not the cheapest room.", why:"It minimizes daily transit while keeping a flexible cancellation window.", map:{x:50,y:48} },
    { id:"stay-room", purpose:"Better room", name:`${city} Design Hotel`, area:"Design district", room:"Large king · lounge access", cancellation:"Free cancellation until 72h before", price:11_400_000, eventTimes:["Main trip anchors · 20–25 min"], anchors:["Design district"], tradeoff:"More room and atmosphere, less convenient base.", why:"This is the comfort upgrade if hotel experience outweighs location.", map:{x:35,y:54} },
    { id:"stay-value", purpose:"Lower price", name:`${city} Local Stay`, area:"Connected neighborhood", room:"Standard queen", cancellation:"Partial refund only", price:7_100_000, eventTimes:["Main trip anchors · 25–35 min"], anchors:["Connected neighborhood"], tradeoff:"Lower total with weaker cancellation and longer trips.", why:"It is the value option if the extra travel time is acceptable.", map:{x:70,y:42} },
  ];
}
export function nearbyDatePrices(base: number) { return [{label:"−2d",price:Math.round(base*1.05)},{label:"−1d",price:Math.round(base*.94)},{label:"Your dates",price:base},{label:"+1d",price:Math.round(base*.91)},{label:"+2d",price:Math.round(base*1.02)}]; }
export function profileBrain(profile: ProfileState) { return profile.prefs.slice(0,8).map((pref) => ({ id:pref.id, statement:pref.statement, category:pref.category, scope:pref.scope === "none" ? "this-trip" as const : pref.scope, source:"profile" as const })); }
