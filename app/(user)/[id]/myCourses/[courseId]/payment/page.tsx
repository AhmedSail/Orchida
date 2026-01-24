import Payment from "@/components/users/Payment";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import {
  companies,
  courseEnrollments,
  courses,
  courseSections,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| الدفع",
};
const page = async ({
  params,
}: {
  params: Promise<{ id: string; courseId: string }>;
}) => {
  const param = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent(`/${param.id}/myCourses/${param.courseId}/payment`)}`,
    );
  }
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
    .where(eq(courseEnrollments.id, param.courseId));
  const company = await db
    .select()
    .from(companies)
    .where(eq(companies.id, "orchid-company"));
  return (
    <div>
      <Payment
        myCourses={myCourses[0]}
        name={session.user.name}
        userId={session.user.id}
        company={company[0]}
      />
    </div>
  );
};

export default page;
