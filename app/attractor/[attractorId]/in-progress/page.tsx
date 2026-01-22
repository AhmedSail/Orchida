import InProgress from "@/components/attractor/InProgress";
import PendingServices from "@/components/attractor/pending-services";
import { db } from "@/src/db";
import { serviceRequests, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المستقطب | خدمات قيد التنفيذ ",
};
const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  const servicesRequests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "in_progress"));
  return (
    <div>
      <InProgress data={servicesRequests} userId={session.user.id} />
    </div>
  );
};

export default page;
