import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast"
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
  title: {
    template: "%s | ContactSync",
    default: "ContactSync",
  },
  metadataBase: new URL("https://contactsync.kochie.io"),
  description: "Sync your contacts across platforms",
  alternates: {
    canonical: "/",
  },
};

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FathomAnalytics } from "./fathom";
config.autoAddCss = false;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FathomAnalytics />
        <Toaster position="bottom-right"/>
          {children}
      </body>
    </html>
  );
}
