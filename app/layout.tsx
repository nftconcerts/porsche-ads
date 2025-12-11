import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Footer from "@/components/footer";
import ClientProvider from "@/components/ClientProvider";
import Lockscreen from "@/components/lockscreen";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "p-ads.com",
  description: "Create your own classic Porsche advertisement",
  themeColor: "#0E0E12",
  icons: {
    // ... existing code ...
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <body className={`font-arial antialiased`}>
        <Lockscreen />
        <ClientProvider>{children}</ClientProvider>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
