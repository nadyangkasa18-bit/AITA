"use client";

import type { ReactNode } from "react";

export function StickyAction({
  children,
  meta,
  note,
}: {
  children: ReactNode;
  meta?: ReactNode;
  note?: ReactNode;
}) {
  return (
    <>
      <div className="h-28" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hair bg-[rgba(244,242,236,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[78px] max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
          <div className="min-w-0">
            {meta && <div className="text-[13px] font-semibold text-ink">{meta}</div>}
            {note && <div className="mt-0.5 text-[12px] text-muted">{note}</div>}
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{children}</div>
        </div>
      </div>
    </>
  );
}
