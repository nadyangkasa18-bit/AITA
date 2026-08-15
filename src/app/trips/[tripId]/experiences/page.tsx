import { TripPlaceholder } from "@/components/trip-placeholder";

export default function ExperiencesPage() {
  return (
    <TripPlaceholder
      title="Experiences"
      body="A short, considered few — one signature moment, one indulgence, one local pleasure — with plenty left deliberately open. The opposite of a packed itinerary, by design."
      bullets={[
        "Curated lightly, not booked wall to wall",
        "Built around the signature moment of your chosen direction",
        "Room left to do nothing, on purpose",
      ]}
    />
  );
}
