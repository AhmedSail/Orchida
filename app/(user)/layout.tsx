import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "../globals.css";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/src/db";
import { serviceRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوركيدة",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  let requests: any[] = [];
  if (session?.user?.id) {
    requests = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.clientId, session.user.id));
  }

  return (
    <html lang="en">
      <body className={`${tajawal.variable} antialiased`}>
        <Header requests={requests} role={session?.user?.role ?? null} />

        {children}
        <Footer />
      </body>
    </html>
  );
}
