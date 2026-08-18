/**
 * Central product configuration.
 * Keep product naming here so the prototype can be renamed consistently.
 */
export const PRODUCT = {
  name: "RoaminRabbit",
  tagline: "Personalized travel, handled.",
  assistantName: "RoaminRabbit",
  ecosystem: {
    esim: "RoaminRabbit",
    entry: "VisaRoo",
    itinerary: "OtterWay",
  },
  /** Global marker so prototype data is never mistaken for live data. */
  prototypeNote: "Demo mode — prices, weather and availability are illustrative. No payment is processed.",
} as const;

export type Product = typeof PRODUCT;
