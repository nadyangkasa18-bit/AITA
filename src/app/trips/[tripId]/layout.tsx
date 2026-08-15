import { TripNavigation } from "@/components/shell";

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TripNavigation />
      <div className="mx-auto max-w-[1200px] px-5 py-8 md:py-10">{children}</div>
    </div>
  );
}
