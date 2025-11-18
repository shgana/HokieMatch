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
  title: "HokieMatch | VT Degree Planner",
  description: "Mocked HokieMatch experience for planning VT pathways, requirements, and course picks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[radial-gradient(circle_at_top_left,_#fdf2f6,_#f6f7fb)] text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
