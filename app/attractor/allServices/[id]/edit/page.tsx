import EditServiceRequestForm from "@/components/attractor/EditserviceRequestForm";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { digitalServices, serviceRequests, users } from "@/src/db/schema";
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
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
  let requests: any[] = [];
  requests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id));
  const services = await db.select().from(digitalServices);
  return (
    <div>
      <EditServiceRequestForm service={requests[0]} services={services} />
    </div>
  );
};

export default page;
