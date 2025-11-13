import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { validateSoundsOnServer } from "@/lib/validateSounds.server";
import ClientLayout from "@/app/components/ClientLayout";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

validateSoundsOnServer();

export const metadata: Metadata = {
  title: "音当てクイズ | Oto Quiz Trainer",
  description:
    "ランダムに再生される音を聞き、自分の耳だけでジャンルを当てるトレーニングアプリ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "音当てクイズ",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-transparent text-slate-50`}
      >
        <ClientLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-900/60 via-slate-900/20 to-indigo-900/40">
            {children}
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
