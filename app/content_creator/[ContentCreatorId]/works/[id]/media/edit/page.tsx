import { db } from "@/src/db";
import { users, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import EditWorkPage from "@/components/EditWorkPage";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
export default async function Page({ params }: { params: { id: string } }) {
  const param = await params;
  // ✅ جلب البيانات من السيرفر مباشرة
  const workRecord = await db
    .select()
    .from(works)
    .where(eq(works.id, param.id))
    .limit(1);
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
  if (role !== "content_creator") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  if (!workRecord.length) {
    return <div>العمل غير موجود</div>;
  }

  return (
    <EditWorkPage work={workRecord[0]} userId={session.user.id} role={role} />
  );
}
