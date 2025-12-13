import ControlUsers from "@/components/users/ControlUsers";
import { db } from "@/src";
import { session, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
const page = async () => {
  // ✅ جلب جميع المستخدمين
  const allUsers = await db.select().from(users);

  // ✅ جلب جميع الجلسات
  const sessionsList = await db.select().from(session);
  const sessionUser = await auth.api.getSession({ headers: await headers() });

  if (!sessionUser?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  // ✅ جلب بيانات المستخدم من DB
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  // ✅ تحقق من الرول
  if (role !== "admin") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      <ControlUsers allUsers={allUsers} sessions={sessionsList} />
    </div>
  );
};

export default page;
