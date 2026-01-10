import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { EdgeStoreProvider } from "@/lib/edgestore";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${tajawal.variable} antialiased`}>
        <ViewTransitions>
          <EdgeStoreProvider>{children}</EdgeStoreProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
