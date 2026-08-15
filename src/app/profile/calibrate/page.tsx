import { PlaceholderPage } from "@/components/ui";

export default function CalibratePage() {
  return (
    <PlaceholderPage
      eyebrow="The recommended next feature"
      title="Calibrate your Traveler Profile"
      body="A light, opt-in way to sharpen how I understand you: quick “this or that” comparisons that teach me what you'd actually choose, with every learned preference clearly scoped and reversible. Nothing gets written to your permanent profile without you seeing it first."
      bullets={[
        "This-or-that pairs — resort A vs resort B, red-eye vs a day flight — that reveal real trade-offs",
        "Each choice becomes a scoped preference: this trip, similar trips, or always",
        "See exactly what changed, and undo any of it — inferences never silently become permanent",
        "Trip-specific overrides sit on top of long-term preferences without overwriting them",
      ]}
      backHref="/profile"
      backLabel="Back to Traveler Profile"
    />
  );
}
