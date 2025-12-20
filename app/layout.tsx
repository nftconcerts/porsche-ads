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
    apple: "/favicon/apple-touch-icon.png",
    // ... existing code ...
  },
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
