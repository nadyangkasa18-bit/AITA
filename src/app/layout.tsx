import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoaminRabbit — Mobile Trip Co-pilot",
  description: "Interactive RoaminRabbit investor story prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
