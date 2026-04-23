import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/db";
import { courses, curriculumLessons, curriculumFields, lessonProgress, courseEnrollments, sectionLessonAvailability, courseSections, courseApplications } from "@/src/db/schema";
import { eq, and, asc, or } from "drizzle-orm";
import CoursePlayer from "@/src/modules/lms-v2/ui/components/student/CoursePlayer";

export default async function StudentCoursePlayerPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const callbackUrl = encodeURIComponent(`/academy/course/${id}`);
    redirect(`/sign-in?callbackUrl=${callbackUrl}`);
  }

  // 1. جلب بيانات الدورة
  const courseData = await db.query.courses.findFirst({
    where: eq(courses.id, id)
  });

  if (!courseData) {
    notFound();
  }

  // 2. التحقق من التسجيل وجلب "الشعبة" (Section)
  let studentEnrollment: any = null;
  let isPreview = false;

  const enrollmentResult = await db
    .select({
      id: courseEnrollments.id,
      sectionId: courseEnrollments.sectionId,
      courseType: courseSections.courseType,
      isV2: courseSections.isV2,
      sectionNumber: courseSections.sectionNumber,
    })
    .from(courseEnrollments)
    .innerJoin(courseSections, eq(courseEnrollments.sectionId, courseSections.id))
    .where(and(
      eq(courseEnrollments.studentId, session.user.id),
      eq(courseSections.courseId, id)
    ))
    .limit(1);

  if (enrollmentResult.length > 0) {
    studentEnrollment = enrollmentResult[0];
  } else {
    // 🔍 إذا لم يكن مسجلاً رسمياً، نتحقق هل هو "مقدم طلب" (Application)؟
    const application = await db.query.courseApplications.findFirst({
      where: (apps, { and, eq }) => and(
        eq(apps.userId, session.user.id),
        eq(apps.courseId, id)
      )
    });

    if (application) {
      // الطالب مقدم طلب، نسمح له بالمعاينة (Preview)
      // نبحث عن أي شعبة V2 لهذا الكورس لنعرض منها المنهج
      const previewSection = await db.query.courseSections.findFirst({
        where: (sections, { and, eq }) => and(
          eq(sections.courseId, id),
          eq(sections.isV2, true)
        )
      });

      if (previewSection) {
        studentEnrollment = {
          sectionId: previewSection.id,
          courseType: previewSection.courseType,
          isV2: true,
          sectionNumber: previewSection.sectionNumber,
        };
        isPreview = true;
      }
    }
  }

  if (!studentEnrollment) {
    redirect(`/courses/${id}`);
  }

  // إذا كانت الشعبة غير مفعلة للنظام الجديد، نرسل الطالب للصفحة القديمة أو نرفض الوصول
  if (!studentEnrollment.isV2) {
     redirect(`/dashboardUser/${session.user.id}/courses/${studentEnrollment.sectionId}/content`);
  }

  // 3. جلب المنهج الدراسي
  let lessons = await db.query.curriculumLessons.findMany({
    where: or(
        eq(curriculumLessons.courseId, id),
        eq(curriculumLessons.sectionId, studentEnrollment.sectionId)
    ),
    orderBy: [asc(curriculumLessons.order)],
    with: {
      fields: {
        orderBy: [asc(curriculumFields.order)]
      }
    }
  });

  // في وضع المعاينة، نرسل كل الدروس ليراها الطالب ولكنها ستكون "مغلقة" تلقائياً في المشغل باستثناء الأول
  // (المنطق موجود داخل مكون CoursePlayer)

  // 4. جلب التقدم
  const progress = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.studentId, session.user.id));

  // 5. جلب إتاحة الدروس
  const availability = await db
    .select()
    .from(sectionLessonAvailability)
    .where(eq(sectionLessonAvailability.sectionId, studentEnrollment.sectionId));

  return (
    <CoursePlayer 
      course={courseData}
      lessons={lessons}
      initialProgress={progress}
      courseType={studentEnrollment.courseType || 'online'}
      sectionAvailability={availability}
      sectionNumber={studentEnrollment.sectionNumber}
      isPreview={isPreview}
      studentInfo={{
        name: session.user.name || "طالب أوركيدة",
        id: `ID: ${session.user.id.slice(0, 8)}`,
      }}
    />
  );
}
