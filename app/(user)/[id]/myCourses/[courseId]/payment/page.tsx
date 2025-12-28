import Payment from "@/components/users/Payment";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { courseEnrollments, courses, courseSections } from "@/src/db/schema";
import { eq } from "drizzle-orm";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| الدفع",
};
const page = async ({ params }: { params: { courseId: string } }) => {
  const param = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  const myCourses = await db
    .select({
      enrollmentId: courseEnrollments.id,
      courseName: courses.title,
      sectionNumber: courseSections.sectionNumber,
      enrolledAt: courseEnrollments.createdAt,
      status: courseEnrollments.confirmationStatus,
      price: courses.price,
      paymentStatus: courseEnrollments.paymentStatus,
    })
    .from(courseEnrollments)
    .innerJoin(
      courseSections,
      eq(courseEnrollments.sectionId, courseSections.id)
    )
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseEnrollments.id, param.courseId));
  return (
    <div>
      <Payment
        myCourses={myCourses[0]}
        name={session.user.name}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
