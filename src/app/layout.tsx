import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PRODUCT } from "@/config/product";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui";
import { AppShell } from "@/components/shell";

/* Self-hosted variable fonts (woff2 shipped in-repo) so the build never
   depends on reaching Google Fonts at build time. */
const bricolage = localFont({
  src: "../fonts/bricolage-grotesque.woff2",
  variable: "--font-bricolage",
  display: "swap",
  weight: "200 800",
});
const hanken = localFont({
  src: "../fonts/hanken-grotesk.woff2",
  variable: "--font-hanken",
  display: "swap",
  weight: "100 900",
});
const newsreader = localFont({
  src: "../fonts/newsreader.woff2",
  variable: "--font-newsreader",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: `${PRODUCT.name} — agentic travel`,
  description:
    "Tell Roam what you know. It understands, proposes a few coherent trip directions, learns from your reactions, and looks after the trip.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${hanken.variable} ${newsreader.variable} antialiased`}>
        <ToastProvider>
          <StoreProvider>
            <AppShell>{children}</AppShell>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
