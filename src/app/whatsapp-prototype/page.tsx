import type { Metadata } from "next";
import { WhatsAppInvestorPrototype } from "@/components/whatsapp-investor-prototype";

export const metadata: Metadata = {
  title: "OTW — WhatsApp Co-Pilot",
  description: "Interactive OTW WhatsApp prototype",
};

export default function WhatsAppPrototypePage() {
  return (
    <main className="min-h-dvh bg-[#ece9e2]">
      <WhatsAppInvestorPrototype />
    </main>
  );
}
