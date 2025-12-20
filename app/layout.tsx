import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Footer from "@/components/footer";
import ClientProvider from "@/components/ClientProvider";
import Lockscreen from "@/components/lockscreen";
import { Toaster } from "@/components/ui/toaster";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const workSans = Work_Sans({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-porsche",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "p-ads.com",
  description: "Create your own classic Porsche advertisement",
  themeColor: "#0E0E12",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/favicon/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/favicon/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={workSans.variable}>
      <body className={`font-arial antialiased`}>
        {/* <Lockscreen /> */}
        <ClientProvider>{children}</ClientProvider>
        <Analytics />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
