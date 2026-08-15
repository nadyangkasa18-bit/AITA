import { TripPlaceholder } from "@/components/trip-placeholder";

export default function TravelersPage() {
  return (
    <TripPlaceholder
      title="Travelers"
      body="Who's coming, and what each person needs — invites, shared decisions, and per-traveler details like seats or dietary notes. Collaboration is a later feature; for now the group is a fixed party of four."
      bullets={[
        "Invite the group and let them react to directions",
        "Per-traveler details without cluttering the main flow",
        "Shared saving and voting on where to go",
      ]}
      back="workspace"
    />
  );
}
