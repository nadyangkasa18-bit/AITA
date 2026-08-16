"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, Card, PrototypeBadge, useToast } from "@/components/ui";
import { PRODUCT } from "@/config/product";

function Row({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-[52ch]">
        <h3 className="font-display text-lg tracking-[-0.02em]">{title}</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </Card>
  );
}

export default function SettingsPage() {
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const tripCount = Object.keys(store.trips).length;

  function reset() {
    store.reset();
    setConfirming(false);
    toast("Prototype reset — starting fresh.");
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            {PRODUCT.name} · prototype
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Settings</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          This is a design prototype. Your trips live only in this browser — there&apos;s no account,
          no server, and nothing is ever booked or charged.
        </p>
      </header>

      <div className="grid gap-4">
        <Row
          title="Where your data lives"
          body={`Everything you do is saved to this browser's local storage under a single key. Clearing your browser data, or resetting below, wipes it. ${tripCount} trip${tripCount === 1 ? "" : "s"} stored right now.`}
        />

        <Row
          title="Product name"
          body={`“${PRODUCT.name}” is a working name. It's set in one config file, so renaming the whole product is a one-line change.`}
        />

        <Row
          title="Reset calibration demo"
          body="Clear your Traveler Profile and calibration answers, then run the eight-round calibration again from the top."
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              store.resetCalibration();
              toast("Calibration reset — starting fresh.");
              router.push("/calibrate");
            }}
          >
            Reset calibration
          </Button>
        </Row>

        <Row
          title="Reset the prototype"
          body="Clear all trips, saved directions and refinements, and return to the seeded starting point. This can't be undone."
        >
          {confirming ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={reset}>
                Yes, reset
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              Reset prototype
            </Button>
          )}
        </Row>
      </div>

      <p className="mt-8 text-[13px] text-faint">{PRODUCT.prototypeNote}</p>
    </div>
  );
}
