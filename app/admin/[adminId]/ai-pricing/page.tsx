import { db } from "@/src/db";
import { aiServicePricing, users } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import AiPricingTable from "@/components/admin/aiPricing/AiPricingTable";

export const metadata = {
  title: "تسعير خدمات AI | لوحة الإدارة",
  description: "إدارة رصيد (credits) لكل موديل وجودة ونوع فيديو/صورة",
};

export default async function AiPricingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch current pricing records
  const pricingData = await db
    .select()
    .from(aiServicePricing)
    .orderBy(desc(aiServicePricing.updatedAt));

  // Fetch user role for additional checks (optional)
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userRecord[0] || userRecord[0].role !== "admin") {
    // Only admins should access this
    redirect("/dashboard");
  }

  return (
    <div className="p-6">
      <AiPricingTable 
        initialPricing={pricingData} 
      />
    </div>
  );
}
