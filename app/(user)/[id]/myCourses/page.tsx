import MyCourses from "@/components/users/MyCourses";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { courseEnrollments, courses, courseSections } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| الدورات",
};
const Page = async ({ params }: { params: { id: string } }) => {
  const param = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent(`/${param.id}/myCourses`)}`,
    );
  }
  // جلب بيانات الدورة والشعبة مع التسجيل
  const myCourses = await db
    .select({
      enrollmentId: courseEnrollments.id,
      courseName: courses.title,
      sectionNumber: courseSections.sectionNumber,
      enrolledAt: courseEnrollments.createdAt,
      status: courseEnrollments.confirmationStatus,
      price: courses.price,
      currency: courses.currency,
      paymentStatus: courseEnrollments.paymentStatus,
    })
    .from(courseEnrollments)
    .innerJoin(
      courseSections,
      eq(courseEnrollments.sectionId, courseSections.id),
    )
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseEnrollments.studentId, param.id));

  return (
    <div>
      <MyCourses myCourses={myCourses} userId={session.user.id} />
    </div>
  );
};

export default Page;
