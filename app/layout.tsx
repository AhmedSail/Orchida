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

export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة",
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
