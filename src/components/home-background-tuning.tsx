"use client";

export function HomeBackgroundTuning() {
  return (
    <style jsx global>{`
      .clean-field__focus-grid {
        background-image:
          linear-gradient(to right, rgba(42, 53, 47, 0.20) 1px, transparent 1px) !important,
          linear-gradient(to bottom, rgba(42, 53, 47, 0.20) 1px, transparent 1px) !important;
        mask-image: radial-gradient(
          circle 165px at var(--focus-x) var(--focus-y),
          #000 0%,
          rgba(0, 0, 0, 0.78) 38%,
          rgba(0, 0, 0, 0.38) 70%,
          transparent 100%
        ) !important;
        -webkit-mask-image: radial-gradient(
          circle 165px at var(--focus-x) var(--focus-y),
          #000 0%,
          rgba(0, 0, 0, 0.78) 38%,
          rgba(0, 0, 0, 0.38) 70%,
          transparent 100%
        ) !important;
      }

      .clean-field__focus-halo {
        background: radial-gradient(
          circle,
          rgba(52, 72, 62, 0.035) 0%,
          rgba(72, 73, 162, 0.014) 44%,
          transparent 76%
        ) !important;
        filter: blur(12px) !important;
      }
    `}</style>
  );
}
