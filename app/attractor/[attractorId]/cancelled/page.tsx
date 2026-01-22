import Cancelled from "@/components/attractor/cancelled";
import { db } from "@/src/db";
import { serviceRequests, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المستقطب | الخدمات الملغية",
};
const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  const servicesRequests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "cancelled"));
  return (
    <div>
      <Cancelled data={servicesRequests} userId={session.user.id} />
    </div>
  );
};

export default page;
