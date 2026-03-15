import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const syne = localFont({
  src: [
    {
      path: "../fonts/Syne-Variable.ttf",
      style: "normal",
    },
  ],
  variable: "--font-syne",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "essence.me — Your AI Twin",
  description:
    "Create an AI version of yourself that speaks in your voice, personality, and knowledge. Share it with anyone.",
  openGraph: {
    title: "essence.me — Your AI Twin",
    description:
      "Create an AI version of yourself that speaks in your voice, personality, and knowledge.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${plexMono.variable} antialiased`}
      >
        {/* Atmospheric layers */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          {/* Base gradient — warm amber fog from top */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0e04] via-[#080a12] to-[#04080f]" />
          {/* Teal accent glow — bottom right */}
          <div className="absolute bottom-0 right-0 w-[60vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,rgba(0,180,190,0.06),transparent_70%)]" />
          {/* Amber accent glow — top left */}
          <div className="absolute top-0 left-0 w-[70vw] h-[40vh] bg-[radial-gradient(ellipse_at_center,rgba(255,140,30,0.05),transparent_70%)]" />
          {/* Scanline overlay */}
          <div className="absolute inset-0 scanlines opacity-[0.03]" />
          {/* Noise grain */}
          <div className="absolute inset-0 noise opacity-[0.015]" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
