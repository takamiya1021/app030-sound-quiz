import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "音当てクイズ | Oto Quiz Trainer",
  description:
    "ランダムに再生される音を聞き、自分の耳だけでジャンルを当てるトレーニングアプリ。",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900/60 via-slate-900/20 to-indigo-900/40">
          {children}
        </div>
      </body>
    </html>
  );
}
