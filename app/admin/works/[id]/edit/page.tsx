import { Service } from "@/components/admin/service/servicesPage";
import EditWork from "@/components/admin/works/editWork";
import { db } from "@/src";
import { digitalServices, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/src/db/schema";
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const foundWork = await db.select().from(works).where(eq(works.id, id));
  const allServices: Service[] = await db.select().from(digitalServices);
  if (foundWork.length === 0) {
    return <div>العمل غير موجود</div>;
  }
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
  if (role !== "admin") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      <EditWork allServices={allServices} foundWork={foundWork[0]} />
    </div>
  );
};

export default page;
