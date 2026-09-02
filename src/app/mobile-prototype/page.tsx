import { MobileTripCompanionPrototype } from "@/components/mobile-trip-companion-prototype";

export default function MobilePrototypePage() {
  return (
    <main id="mobile-prototype-iphone16" className="mobile-prototype-header-bookings">
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

        /* Itinerary header: bookings live on the left, Context on the right. */
        #mobile-prototype-iphone16
          .flex.h-full.flex-col:has(section.mt-5 > div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2) {
          position: relative;
          padding-left: 16px;
          padding-right: 16px;
        }

        #mobile-prototype-iphone16
          .flex.h-full.flex-col:has(section.mt-5 > div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button:first-child:disabled {
          display: none;
        }

        #mobile-prototype-iphone16
          .flex.h-full.flex-col:has(section.mt-5 > div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > div {
          display: none;
        }

        #mobile-prototype-iphone16
          .flex.h-full.flex-col:has(section.mt-5 > div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button:last-child {
          position: absolute;
          right: 16px;
          top: 50%;
          z-index: 82;
          margin: 0;
          transform: translateY(-50%);
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3)) {
          position: absolute;
          top: 66px;
          left: 18px;
          right: auto;
          z-index: 75;
          width: 100px;
          margin: 0;
          pointer-events: auto;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:first-child {
          display: none;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2) {
          display: flex;
          width: 100px;
          gap: 4px;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button {
          position: relative;
          display: grid;
          width: 30px;
          height: 30px;
          min-width: 30px;
          flex: 0 0 30px;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: transparent;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button
          > div:first-child {
          display: block;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button
          > div:first-child
          > span:first-child {
          display: grid;
          width: 30px;
          height: 30px;
          place-items: center;
          border-radius: 999px;
          background: transparent;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button
          > div:first-child
          > span:first-child
          svg {
          width: 18px;
          height: 18px;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button
          > div:first-child
          > span:nth-child(2) {
          position: absolute;
          top: -1px;
          right: -1px;
          width: 12px;
          height: 12px;
          border: 2px solid #f8f6f0;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button
          > div:first-child
          > span:nth-child(2)
          svg {
          width: 8px;
          height: 8px;
        }

        #mobile-prototype-iphone16
          section.mt-5:has(> div:nth-child(2) > button:nth-child(3))
          > div:nth-child(2)
          > button
          > p {
          display: none;
        }

        @media (max-width: 370px) {
          #mobile-prototype-iphone16
            section.mt-5:has(> div:nth-child(2) > button:nth-child(3)) {
            left: 14px;
          }

          #mobile-prototype-iphone16
            .flex.h-full.flex-col:has(section.mt-5 > div:nth-child(2) > button:nth-child(3))
            > div:nth-child(2)
            > button:last-child {
            right: 12px;
          }
        }
      `}</style>
    </main>
  );
}
