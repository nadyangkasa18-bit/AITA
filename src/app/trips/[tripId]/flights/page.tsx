import { TripPlaceholder } from "@/components/trip-placeholder";

export default function FlightsPage() {
  return (
    <TripPlaceholder
      title="Flights"
      body="A small, opinionated set of routings — not a fare grid — held to your daytime-departure preference and the fewest sensible stops for the whole group. Prices shown anywhere in the prototype are illustrative."
      bullets={[
        "Daytime and later departures preferred, per your profile",
        "One clear recommendation over a wall of near-identical fares",
        "Illustrative pricing only — no live fares or bookings",
      ]}
    />
  );
}
