import { MobileTripCompanionPrototype } from "@/components/mobile-trip-companion-prototype";

export default function MobilePrototypePage() {
  return (
    <main id="mobile-prototype-iphone16">
      <MobileTripCompanionPrototype />
      <style>{`
        #mobile-prototype-iphone16 .max-w-\\[458px\\] {
          max-width: 393px !important;
        }

        #mobile-prototype-iphone16 .max-w-\\[458px\\] > div {
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          aspect-ratio: 393 / 852;
        }
      `}</style>
    </main>
  );
}
