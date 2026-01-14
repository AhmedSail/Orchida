import ContactPage from "@/components/ContactPage";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا | أوركيدة للخدمات الرقمية والأكاديمية",
  description: "تواصل معنا لأي استفسارات أو طلبات خدمات. نحن هنا لمساعدتك.",
  alternates: {
    canonical: "https://www.orchida-ods.com/contact",
  },
};

const page = async () => {
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

  return (
    <div>
      <ContactPage result={result[0]} />
    </div>
  );
};

export default page;
