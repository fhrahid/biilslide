import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./visibility.css";

export const metadata: Metadata = {
  title: "BIIL — Industrial Intelligence Layer",
  description: "An AIoT and computer vision enabled industrial intelligence platform proposal for smart RMG manufacturing in Bangladesh.",
  applicationName: "BIIL Project Presentation",
};

export const viewport: Viewport = {
  themeColor: "#070b10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
