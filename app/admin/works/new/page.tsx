import { db } from "@/src/db";
import { digitalServices } from "@/src/db/schema";
import NewWork from "@/components/admin/works/newWork";
import { Service } from "@/components/admin/service/servicesPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
const page = async () => {
  const allServices: Service[] = await db.select().from(digitalServices);
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
      <NewWork allServices={allServices} />
    </div>
  );
};

export default page;
