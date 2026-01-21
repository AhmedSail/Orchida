import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://orchida-ods.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "اوركيدة",
    template: "%s | اوركيدة",
  },
  description: "خدمات أوركيدة الرقمية والأكاديمية",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "اوركيدة",
    description: "خدمات أوركيدة الرقمية والأكاديمية",
    url: baseUrl,
    siteName: "اوركيدة",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "اوركيدة",
    description: "خدمات أوركيدة الرقمية والأكاديمية",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} antialiased`}
        suppressHydrationWarning
      >
        <ViewTransitions>{children}</ViewTransitions>
      </body>
    </html>
  );
}
