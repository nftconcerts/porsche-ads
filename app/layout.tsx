import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Footer from "@/components/footer";
import ClientProvider from "@/components/ClientProvider";
import Lockscreen from "@/components/lockscreen";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@next/third-parties/google";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const workSans = Work_Sans({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-p-ads",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "p-ads.com",
  description: "Create your own classic p-car advertisment.",
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

export const themeColor = "#0E0E12";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={workSans.variable}>
      <body
        className={`font-arial antialiased flex flex-col min-h-screen bg-[#0E0E12] justify-end`}
      >
        {/* <Lockscreen /> */}
        <ClientProvider>{children}</ClientProvider>
        <GoogleAnalytics gaId="G-WN6EYJ3Z1K" />
        <Analytics />
        <Footer />
        <Toaster />
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 flex items-center justify-center pointer-events-none select-none"
        >
          <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] font-bold text-white/20 tracking-tighter">
            p-ads.com
          </h1>
        </div>
      </body>
    </html>
  );
}
