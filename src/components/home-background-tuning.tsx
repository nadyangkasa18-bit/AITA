"use client";

export function HomeBackgroundTuning() {
  return (
    <style jsx global>{`
      .clean-field__grid {
        background-image:
          linear-gradient(to right, rgba(70, 80, 72, 0.088) 1px, transparent 1px) !important,
          linear-gradient(to bottom, rgba(70, 80, 72, 0.088) 1px, transparent 1px) !important;
      }

      .clean-field__focus-grid {
        background-image:
          linear-gradient(to right, rgba(42, 53, 47, 0.135) 1px, transparent 1px) !important,
          linear-gradient(to bottom, rgba(42, 53, 47, 0.135) 1px, transparent 1px) !important;
        mask-image: radial-gradient(
          circle 112px at var(--focus-x) var(--focus-y),
          rgba(0, 0, 0, 0.72) 0%,
          rgba(0, 0, 0, 0.54) 42%,
          rgba(0, 0, 0, 0.24) 72%,
          transparent 100%
        ) !important;
        -webkit-mask-image: radial-gradient(
          circle 112px at var(--focus-x) var(--focus-y),
          rgba(0, 0, 0, 0.72) 0%,
          rgba(0, 0, 0, 0.54) 42%,
          rgba(0, 0, 0, 0.24) 72%,
          transparent 100%
        ) !important;
      }

      .clean-field__focus-halo {
        background: transparent !important;
        filter: none !important;
      }
    `}</style>
  );
}
