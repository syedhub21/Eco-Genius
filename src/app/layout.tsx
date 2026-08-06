import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eco-Genius | Intelligent Energy Optimization",
  description:
    "AI-powered sustainability analysis. Calculate your carbon footprint, get a 30-day action plan, and explore renewable energy investments tailored to your location.",
  keywords: [
    "Eco-Genius",
    "carbon footprint",
    "energy efficiency",
    "solar",
    "wind",
    "renewable energy",
    "sustainability",
    "AI energy analysis",
  ],
  authors: [{ name: "Eco-Genius" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Eco-Genius | Intelligent Energy",
    description: "Optimize your energy future with AI-powered sustainability analysis.",
    siteName: "Eco-Genius",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
