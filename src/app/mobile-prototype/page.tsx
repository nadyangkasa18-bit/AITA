import type { Metadata } from "next";
import { MobileTripCompanionPrototype } from "@/components/mobile-trip-companion-prototype";

export const metadata: Metadata = {
  title: "OTW — Mobile Trip Co-Pilot",
  description: "Interactive OTW mobile trip prototype",
};

export default function MobilePrototypePage() {
  return (
    <main>
      <MobileTripCompanionPrototype />
    </main>
  );
}
