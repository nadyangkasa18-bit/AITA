"use client";

import { useCallback, useState } from "react";
import {
  AddPlaceScreen,
  ContextScreen,
  CopilotScreen,
  IdeasScreen,
  ItineraryAfterScreen,
  ItineraryScreen,
  TripHome,
  UpdatingScreen,
} from "./prototype/rr-planning";
import {
  ExpensesScreen,
  FinalScreen,
  ReceiptScreen,
  SplitChatScreen,
  UpdatedExpenseScreen,
} from "./prototype/rr-expenses";
import { PhoneFrame, type Screen } from "./prototype/rr-shared";

const screenOrder: Screen[] = [
  "home",
  "ideas",
  "add-place",
  "itinerary",
  "context",
  "copilot",
  "updating",
  "after",
  "expenses",
  "receipt",
  "split-chat",
  "updated-expense",
  "final",
];

const backMap: Partial<Record<Screen, Screen>> = {
  ideas: "home",
  "add-place": "ideas",
  itinerary: "ideas",
  context: "itinerary",
  copilot: "context",
  after: "copilot",
  expenses: "after",
  receipt: "expenses",
  "split-chat": "receipt",
  "updated-expense": "split-chat",
  final: "updated-expense",
};

export function MobileTripCompanionPrototype() {
  const [screen, setScreen] = useState<Screen>("home");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [addedPlace, setAddedPlace] = useState(false);

  const navigate = useCallback((next: Screen) => {
    const changeScreen = () => {
      setDirection(screenOrder.indexOf(next) >= screenOrder.indexOf(screen) ? "forward" : "back");
      setScreen(next);
    };
    const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => void };
    if (transitionDocument.startViewTransition) transitionDocument.startViewTransition(changeScreen);
    else changeScreen();
  }, [screen]);

  const goBack = () => navigate(backMap[screen] ?? "home");
  const finishUpdate = useCallback(() => navigate("after"), [navigate]);
  const restart = () => {
    setAddedPlace(false);
    navigate("home");
  };

  let content;
  if (screen === "home") content = <TripHome onOpen={() => navigate("ideas")} onNavigate={navigate} />;
  else if (screen === "ideas") content = <IdeasScreen added={addedPlace} onBack={goBack} onAdd={() => navigate("add-place")} onNext={() => navigate("itinerary")} onNavigate={navigate} />;
  else if (screen === "add-place") content = <AddPlaceScreen onBack={goBack} onAdded={() => { setAddedPlace(true); navigate("ideas"); }} />;
  else if (screen === "itinerary") content = <ItineraryScreen onBack={goBack} onAsk={() => navigate("context")} onNavigate={navigate} />;
  else if (screen === "context") content = <ContextScreen onBack={goBack} onContinue={() => navigate("copilot")} />;
  else if (screen === "copilot") content = <CopilotScreen onBack={goBack} onUpdate={() => navigate("updating")} onNavigate={navigate} />;
  else if (screen === "updating") content = <UpdatingScreen onDone={finishUpdate} />;
  else if (screen === "after") content = <ItineraryAfterScreen onBack={goBack} onNavigate={navigate} />;
  else if (screen === "expenses") content = <ExpensesScreen onBack={goBack} onReceipt={() => navigate("receipt")} onNavigate={navigate} />;
  else if (screen === "receipt") content = <ReceiptScreen onBack={goBack} onHelp={() => navigate("split-chat")} />;
  else if (screen === "split-chat") content = <SplitChatScreen onBack={goBack} onUpdate={() => navigate("updated-expense")} />;
  else if (screen === "updated-expense") content = <UpdatedExpenseScreen onBack={goBack} onFinish={() => navigate("final")} />;
  else content = <FinalScreen onRestart={restart} />;

  return (
    <PhoneFrame>
      <div key={screen} className={`rr-screen rr-${direction}`}>{content}</div>
      <style jsx global>{`
        :root {
          --rr-paper: #f4f2ec;
          --rr-paper-2: #eae7de;
          --rr-ink: #0e0e0d;
          --rr-muted: #5e5b52;
          --rr-accent: #6257ff;
          --rr-spring: cubic-bezier(.32,.72,0,1);
        }

        html, body { overscroll-behavior: none; }
        body { background: #dfddd7; }
        button, input { font: inherit; }
        button { -webkit-tap-highlight-color: transparent; }

        .font-display {
          font-family: var(--font-bricolage), "Arial Narrow", "Helvetica Neue", sans-serif;
        }

        .rr-stage {
          font-family: var(--font-hanken), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .rr-device {
          width: min(416px, 100vw);
          height: min(900px, 100dvh);
        }

        .rr-phone {
          border: 7px solid #151515;
          border-radius: 52px;
          box-shadow: 0 38px 92px -34px rgba(14, 14, 13, .6), inset 0 0 0 1px rgba(255,255,255,.22);
        }

        .rr-phone::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 90;
          pointer-events: none;
          border-radius: 44px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.18);
        }

        .rr-side {
          position: absolute;
          z-index: 0;
          display: block;
          width: 4px;
          border-radius: 3px;
          background: #282827;
        }

        .rr-action { left: -3px; top: 132px; height: 30px; }
        .rr-volume-up { left: -3px; top: 184px; height: 62px; }
        .rr-volume-down { left: -3px; top: 258px; height: 62px; }
        .rr-power { right: -3px; top: 204px; height: 92px; }

        .rr-screen {
          width: 100%;
          height: 100%;
          color: var(--rr-ink);
          background: var(--rr-paper);
          will-change: opacity, transform, filter;
        }

        .rr-forward { animation: rr-screen-forward 440ms var(--rr-spring) both; }
        .rr-back { animation: rr-screen-back 400ms var(--rr-spring) both; }

        ::view-transition-old(root) { animation: rr-old 250ms ease both; }
        ::view-transition-new(root) { animation: rr-new 440ms var(--rr-spring) both; }

        .rr-scroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .rr-scroll::-webkit-scrollbar { display: none; }

        .rr-tap { transition: transform 260ms var(--rr-spring), box-shadow 260ms ease, background-color 260ms ease; }
        .rr-tap:active { transform: scale(.975); }
        .rr-message { animation: rr-message 420ms var(--rr-spring) both; }
        .rr-list-in { opacity: 0; animation: rr-list 430ms var(--rr-spring) both; }
        .rr-typing { animation: rr-typing 1s ease-in-out infinite; }
        .rr-shimmer { position: relative; overflow: hidden; }
        .rr-shimmer::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent); animation: rr-shimmer 1.15s infinite; }
        .rr-orbit { animation: rr-orbit 1.55s ease-in-out infinite; }
        .rr-progress { animation: rr-progress 1.55s var(--rr-spring) both; }

        @keyframes rr-screen-forward { from { opacity: 0; transform: translateX(18px) scale(.992); filter: blur(3px); } to { opacity: 1; transform: none; filter: none; } }
        @keyframes rr-screen-back { from { opacity: 0; transform: translateX(-14px) scale(.995); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
        @keyframes rr-old { to { opacity: 0; transform: translateX(-9px) scale(.996); } }
        @keyframes rr-new { from { opacity: 0; transform: translateX(13px) scale(.995); } }
        @keyframes rr-message { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
        @keyframes rr-list { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
        @keyframes rr-typing { 0%, 65%, 100% { transform: translateY(0); opacity: .38; } 32% { transform: translateY(-4px); opacity: 1; } }
        @keyframes rr-shimmer { to { transform: translateX(100%); } }
        @keyframes rr-orbit { 0%,100% { transform: scale(.92); opacity: .3; } 50% { transform: scale(1.12); opacity: .8; } }
        @keyframes rr-progress { from { width: 8%; } to { width: 100%; } }

        @media (prefers-reduced-motion: reduce) {
          .rr-forward, .rr-back, .rr-message, .rr-list-in, .rr-typing, .rr-shimmer::after, .rr-orbit, .rr-progress { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
        }

        @media (max-width: 479px) {
          .rr-stage { background: var(--rr-paper); }
          .rr-device { width: 100vw; height: 100dvh; }
          .rr-phone { border: 0; border-radius: 0; box-shadow: none; }
          .rr-phone::after, .rr-side { display: none; }
        }
      `}</style>
    </PhoneFrame>
  );
}
