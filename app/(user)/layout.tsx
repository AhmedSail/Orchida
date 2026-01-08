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
  // Fetch session and company info in parallel
  const [session, companyResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    db
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
      .limit(1),
  ]);

  let requests: any[] = [];
  let user: any = null;

  if (session?.user?.id) {
    // Fetch requests and user data in parallel
    const [requestsData, userData] = await Promise.all([
      db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.clientId, session.user.id)),
      db.select().from(users).where(eq(users.id, session.user.id)),
    ]);
    requests = requestsData;
    user = userData[0];
  }

  const result = companyResult[0];
  return (
    <div>
      <Header
        requests={requests}
        role={session?.user?.role ?? null}
        user={user}
      />

      {children}
      <Footer result={result} />
    </div>
  );
}
