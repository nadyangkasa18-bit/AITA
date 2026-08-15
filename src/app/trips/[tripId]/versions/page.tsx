import { TripPlaceholder } from "@/components/trip-placeholder";

export default function VersionsPage() {
  return (
    <TripPlaceholder
      title="Trip versions"
      body="Each direction you build becomes a saved version you can compare side by side — the Hakone version next to the Perth version — without losing either. Full comparison is part of the Booking Workspace feature."
      bullets={[
        "Keep more than one built version alive at once",
        "Compare totals, journey effort and trade-offs directly",
        "Switch the active version without starting over",
      ]}
    />
  );
}
