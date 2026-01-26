import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "أوركيدة للخدمات الرقمية والأكاديمية",
    template: "%s | أوركيدة",
  },
  description:
    "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم. نقدم خدمات البرمجة، التصميم، التسويق، ودورات تدريبية احترافية.",
  keywords: [
    "أوركيدة",
    "خدمات رقمية",
    "تدريب أكاديمي",
    "برمجة",
    "تصميم",
    "تسويق",
    "فلسطين",
    "غزة",
  ],
  authors: [{ name: "Orchida" }],
  creator: "Orchida",
  publisher: "Orchida",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "أوركيدة للخدمات الرقمية والأكاديمية",
    description:
      "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم.",
    url: baseUrl,
    siteName: "أوركيدة",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "شعار أوركيدة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أوركيدة للخدمات الرقمية والأكاديمية",
    description:
      "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
