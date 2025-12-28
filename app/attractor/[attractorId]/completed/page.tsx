import Completed from "@/components/attractor/completed";
import { db } from "@/src/db";
import { serviceRequests, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المستقطب | الخدمات المكتملة",
};
const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  // ✅ جلب بيانات المستخدم من DB
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  // ✅ تحقق من الرول
  if (role !== "attractor") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  const servicesRequests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "completed"));
  return (
    <div>
      <Completed data={servicesRequests} userId={session.user.id} />
    </div>
  );
};

export default page;
