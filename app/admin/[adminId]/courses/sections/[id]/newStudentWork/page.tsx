import StudentWorkForm from "@/components/StudentWork";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import {
  users,
  courseSections,
  courses,
  courseEnrollments,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "اضافة عمل جديد",
};

const Page = async ({ params }: { params: { id: string } }) => {
  const param = await params;
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
  // جلب بيانات الشعبة والكورس
  const section = await db
    .select({
      id: courseSections.id,
      courseId: courseSections.courseId,
      sectionNumber: courseSections.sectionNumber,
      courseTitle: courses.title,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courses.id, courseSections.courseId))
    .where(eq(courseSections.id, param.id))
    .limit(1);

  if (section.length === 0) {
    return <div>❌ لم يتم العثور على هذه الشعبة</div>;
  }

  const courseId = section[0].courseId;

  // جلب الطلاب المسجلين في الشعبة
  const students = await db
    .select({
      id: courseEnrollments.studentId,
      name: courseEnrollments.studentName,
    })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.sectionId, param.id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📌 رفع أعمال الطلاب</h1>
      <StudentWorkForm
        courseId={courseId}
        sectionId={param.id}
        students={students}
        userRole={session.user.role}
        courseTitle={section[0].courseTitle} // 👈 تمرير اسم الكورس
        sectionNumber={section[0].sectionNumber}
        userId={session.user.id}
      />
    </div>
  );
};

export default Page;
