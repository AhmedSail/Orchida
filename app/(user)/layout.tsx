import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "../globals.css";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/src/db";
import { companies, serviceRequests, users } from "@/src/db/schema";
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
  const result = await db
    .select({
      facebookUrl: companies.facebookUrl,
      instagramUrl: companies.instagramUrl,
      twitterUrl: companies.twitterUrl,
      whatsappUrl: companies.whatsappUrl,
      linkedinUrl: companies.linkedinUrl,
      tiktokUrl: companies.tiktokUrl,
    })
    .from(companies)
    .where(eq(companies.id, "orchid-company"))
    .limit(1);
  let user: any;
  if (session?.user?.id) {
    user = await db.select().from(users).where(eq(users.id, session.user.id));
  }
  return (
    <div>
      <Header
        requests={requests}
        role={session?.user?.role ?? null}
        user={user?.[0]}
      />

      {children}
      <Footer result={result[0]} />
    </div>
  );
}
