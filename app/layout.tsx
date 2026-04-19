import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import PwaRegister from "@/components/PwaRegister";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "أوركيدة",
  },
  title: {
    default: "أوركيدة للخدمات الرقمية والأكاديمية",
    template: "%s | أوركيدة",
  },
  description:
    "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم. نقدم خدمات البرمجة، التصميم، التسويق، ودورات تدريبية احترافية.",
  keywords: [
    "أوركيدة",
    "اوركيدة",
    "orchida",
    "orchida-ods",
    "orchida digital services",
    "شركة تقنية",
    "خدمات رقمية",
    "حلول برمجية",
    "تطوير مواقع",
    "برمجة تطبيقات",
    "تسويق رقمي",
    "تصميم جرافيك",
    "تدريب أكاديمي",
    "دورات تدريبية",
    "تجارة إلكترونية",
    "E-commerce",
    "دروبشيبينغ",
    "Dropshipping",
    "SEO",
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
        <PwaRegister />
        <ViewTransitions>{children}</ViewTransitions>
      </body>
    </html>
  );
}
