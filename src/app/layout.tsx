import type { Metadata, Viewport } from "next";
import "./globals.css";
import SyncProvider from "@/components/SyncProvider";

export const metadata: Metadata = {
  title: "Kita-Sprache",
  description:
    "A visual, audio-first German phrase app helping young children speak up in Kita and kindergarten.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fff9f0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <SyncProvider />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
