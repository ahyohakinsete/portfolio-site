import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderProvider } from "../components/HeaderContext";
import SiteHeader from "../components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const maisonNeue = localFont({
  src: [
    { path: "../public/fonts/MaisonNeue-Light.woff2", weight: "300", style: "normal" },
  ],
  variable: "--font-maison",
  display: "block",
});

export const metadata: Metadata = {
  title: "Ayo Akinsete",
  description: "Ayo Akinsete Photography",
};

export const viewport = {
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
    <html lang="en" style={{ backgroundColor: "#fff" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${maisonNeue.variable} antialiased`}
        style={{ backgroundColor: "#fff" }}
      >
        <HeaderProvider>
          <SiteHeader />
          {children}
        </HeaderProvider>
      </body>
    </html>
  );
}