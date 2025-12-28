import NewInstructorForm from "@/components/admin/instructor/NewInstructorForm";
import { instructors, users } from "@/src/db/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: "اضافة المدرب",
};
export type Instructor = InferSelectModel<typeof instructors>;
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
  if (role !== "instructor") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      <NewInstructorForm userId={session.user.id} />
    </div>
  );
};

export default page;
