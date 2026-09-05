import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Circuit Bazaar | Nepal's Verified IT Hardware Marketplace",
  description:
    "Nepal's specification-first hardware marketplace. Source genuine PC components, networking gear, IoT modules, and laptops from verified local vendors with official warranties.",
  keywords: [
    "Circuit Bazaar",
    "Nepal hardware",
    "IT components Nepal",
    "verified PC vendors",
    "Kathmandu tech",
    "GPU Nepal",
    "networking gear Nepal",
  ],
  authors: [{ name: "Circuit Bazaar" }],
  openGraph: {
    title: "Circuit Bazaar | Nepal's Verified IT Hardware Marketplace",
    description:
      "Discover genuine PC components, server hardware, networking gear, and custom rigs backed by verified Nepal vendor warranties.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900 min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
