"use server";

import { db } from "@/src/db";
import {
  curriculumLessons,
  curriculumFields,
  instructorCourseAccess,
  courses,
  sectionLessonAvailability,
  lessonProgress,
  instructors,
  users,
  courseEnrollments,
  courseSections,
} from "@/src/db/schema";
import { eq, and, asc, desc, sql, count, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * مساعد للتأكد من صلاحية المدرب للوصول لدورة أو شعبة معينة
 */
async function checkInstructorAccess(
  id: string,
  type: "section" | "course" = "section",
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { hasAccess: false, error: "Unauthorized" };
  }

  if (session.user.role === "admin") {
    return { hasAccess: true, session };
  }

  let courseId = id;
  if (type === "section") {
    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, id),
    });
    if (!section) return { hasAccess: false, error: "Section not found" };
    courseId = section.courseId!;
  }

  const access = await db.query.instructorCourseAccess.findFirst({
    where: and(
      eq(instructorCourseAccess.instructorId, session.user.id),
      eq(instructorCourseAccess.courseId, courseId),
    ),
  });

  if (!access) return { hasAccess: false, error: "Forbidden" };
  return { hasAccess: true, session };
}

/**
 * 1. جلب الدورات المسندة للمدرب الحالي
 */
export async function getInstructorCoursesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      !session ||
      (session.user.role !== "instructor" && session.user.role !== "admin")
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // جلب الدورات مع الإحصائيات (عدد الطلاب وعدد الدروس)
    const baseQuery = db
      .select({
        course: courses,
        studentCount: sql<number>`(
          SELECT count(DISTINCT ce.id) 
          FROM "courseEnrollments" ce 
          JOIN "courseSections" cs ON ce."sectionId" = cs.id 
          WHERE cs."courseId" = ${courses.id}
        )`.mapWith(Number),
        lessonsCount: sql<number>`(
          SELECT count(*) 
          FROM "curriculumLessons" cl 
          WHERE cl."courseId" = ${courses.id} OR (cl."sectionId" IN (SELECT id FROM "courseSections" WHERE "courseId" = ${courses.id}))
        )`.mapWith(Number),
      })
      .from(courses);

    let result;
    if (session.user.role === "admin") {
      // الأدمن يرى كل الكورسات بدون قيد
      result = await baseQuery.groupBy(courses.id);
    } else {
      result = await baseQuery
        .innerJoin(
          instructorCourseAccess,
          eq(instructorCourseAccess.courseId, courses.id),
        )
        .innerJoin(courseSections, eq(courseSections.courseId, courses.id))
        .where(
          and(
            eq(instructorCourseAccess.instructorId, session.user.id),
            eq(courseSections.isV2, true),
          ),
        )
        .groupBy(courses.id);
    }

    const data = result.map((r) => ({
      ...r.course,
      studentCount: r.studentCount,
      lessonsCount: r.lessonsCount,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error in getInstructorCoursesAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 2. جلب المنهج الدراسي (الدروس والحقول) لدورة معينة
 */
export async function getCourseCurriculumAction(
  id: string,
  type: "section" | "course" = "course",
) {
  try {
    const { hasAccess, error } = await checkInstructorAccess(id, type);
    if (!hasAccess) return { success: false, error };

    let whereClause;
    if (type === "course") {
      // جلب المنهج العام (الثابت) فقط
      whereClause = and(
        eq(curriculumLessons.courseId, id),
        sql`${curriculumLessons.sectionId} IS NULL`,
      );
    } else {
      // جلب المنهج المدمج (العام + الخاص بهذه الشعبة)
      const section = await db.query.courseSections.findFirst({
        where: eq(courseSections.id, id),
      });
      if (!section) return { success: false, error: "Section not found" };

      whereClause = or(
        and(
          eq(curriculumLessons.courseId, section.courseId!),
          sql`${curriculumLessons.sectionId} IS NULL`,
        ),
        eq(curriculumLessons.sectionId, id),
      );
    }

    const lessons = await db.query.curriculumLessons.findMany({
      where: whereClause,
      orderBy: [asc(curriculumLessons.order)],
      with: {
        fields: {
          orderBy: [asc(curriculumFields.order)],
        },
        progress: true,
      },
    });

    const data = lessons.map((l) => ({
      ...l,
      completionsCount: l.progress.length,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error in getCourseCurriculumAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 3. إضافة درس جديد
 */
export async function createLessonAction(data: {
  courseId: string;
  sectionId?: string;
  mainTitle: string;
  subTitle?: string;
  order?: number;
}) {
  try {
    const { hasAccess, error } = await checkInstructorAccess(
      data.courseId,
      "course",
    );

    if (!hasAccess) {
      return { success: false, error };
    }

    let finalOrder = data.order;
    if (finalOrder === undefined) {
      const lastLesson = await db
        .select({ maxOrder: sql<number>`max(${curriculumLessons.order})` })
        .from(curriculumLessons)
        .where(eq(curriculumLessons.courseId, data.courseId));

      finalOrder = (lastLesson[0]?.maxOrder || 0) + 1;
    }

    const newLesson = await db
      .insert(curriculumLessons)
      .values({
        courseId: data.courseId,
        sectionId: data.sectionId || null,
        mainTitle: data.mainTitle,
        subTitle: data.subTitle,
        order: finalOrder,
      })
      .returning();

    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, data.sectionId!),
    });

    if (section?.courseId) {
      revalidatePath(`/instructor/v2/course/${section.courseId}`);
      revalidatePath(`/admin/lms-v2`);
    }

    return { success: true, data: newLesson[0] };
  } catch (error) {
    console.error("Error in createLessonAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 4. إضافة حقل محتوى للدرس
 */
export async function addLessonFieldAction(data: {
  lessonId: string;
  fieldType: string; // text, video, image, file, link
  content: string;
  order?: number;
}) {
  try {
    let finalOrder = data.order;
    if (finalOrder === undefined) {
      const lastField = await db
        .select({ maxOrder: sql<number>`max(${curriculumFields.order})` })
        .from(curriculumFields)
        .where(eq(curriculumFields.lessonId, data.lessonId));

      finalOrder = (lastField[0]?.maxOrder || 0) + 1;
    }

    const newField = await db
      .insert(curriculumFields)
      .values({
        lessonId: data.lessonId,
        fieldType: data.fieldType,
        content: data.content,
        order: finalOrder,
      })
      .returning();

    return { success: true, data: newField[0] };
  } catch (error) {
    console.error("Error in addLessonFieldAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 6. جلب تقدم الطالب في الدورة
 */
export async function getStudentProgressAction(
  studentId: string,
  sectionId: string,
) {
  try {
    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, sectionId),
    });

    if (!section) return { success: false, error: "Section not found" };

    const progress = await db
      .select()
      .from(lessonProgress)
      .innerJoin(
        curriculumLessons,
        eq(lessonProgress.lessonId, curriculumLessons.id),
      )
      .where(
        and(
          eq(lessonProgress.studentId, studentId),
          or(
            eq(curriculumLessons.courseId, section.courseId!),
            eq(curriculumLessons.sectionId, sectionId),
          ),
        ),
      );

    return { success: true, data: progress.map((p) => p.lessonProgress) };
  } catch (error) {
    console.error("Error in getStudentProgressAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 7. إكمال درس (فتح التالي)
 */
export async function completeLessonAction(lessonId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, error: "Unauthorized" };

    const result = await db
      .insert(lessonProgress)
      .values({
        studentId: session.user.id,
        lessonId: lessonId,
        status: "completed",
      })
      .onConflictDoNothing()
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error in completeLessonAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 8. جلب كل المدرسين (للأدمن)
 */
export async function getAllInstructorsAction() {
  try {
    const allInstructors = await db.select().from(instructors);
    return { success: true, data: allInstructors };
  } catch (error) {
    console.error("Error in getAllInstructorsAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 9. تفعيل/تعطيل النظام الجديد لدورة (للأدمن)
 */
export async function toggleCourseV2Action(courseId: string, isV2: boolean) {
  try {
    await db.update(courses).set({ isV2 }).where(eq(courses.id, courseId));
    // تحديث كل الشعب المرتبطة بهذا الكورس لتطابق حالة الكورس
    await db.update(courseSections).set({ isV2 }).where(eq(courseSections.courseId, courseId));
    
    revalidatePath("/admin/lms-v2");
    revalidatePath(`/admin/courses`);
    return { success: true };
  } catch (error) {
    console.error("Error in toggleCourseV2Action:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 10. إسناد دورة لمدرس (للأدمن)
 */
export async function assignInstructorToCourseAction(
  instructorId: string,
  courseId: string,
) {
  try {
    await db
      .insert(instructorCourseAccess)
      .values({
        instructorId,
        courseId,
      })
      .onConflictDoNothing();

    revalidatePath("/admin/lms-v2");
    return { success: true };
  } catch (error) {
    console.error("Error in assignInstructorToCourseAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 11. جلب كل الدورات مع حالة V2 (للأدمن)
 */
export async function getAllCoursesWithV2StatusAction() {
  try {
    const result = await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getAllCoursesWithV2StatusAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 12. حذف درس (للأدمن أو المدرب)
 */
export async function deleteLessonAction(lessonId: string) {
  try {
    await db
      .delete(curriculumLessons)
      .where(eq(curriculumLessons.id, lessonId));
    revalidatePath("/instructor/v2");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteLessonAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 13. حذف حقل محتوى (للأدمن أو المدرب)
 */
export async function deleteLessonFieldAction(fieldId: string) {
  try {
    await db.delete(curriculumFields).where(eq(curriculumFields.id, fieldId));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteLessonFieldAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 14. تحديث ترتيب الدروس
 */
export async function updateLessonsOrderAction(
  lessonOrders: { id: string; order: number }[],
) {
  try {
    for (const item of lessonOrders) {
      await db
        .update(curriculumLessons)
        .set({ order: item.order })
        .where(eq(curriculumLessons.id, item.id));
    }
    return { success: true };
  } catch (error) {
    console.error("Error in updateLessonsOrderAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 15. تحديث ترتيب الحقول داخل الدرس
 */
export async function updateFieldsOrderAction(
  fieldOrders: { id: string; order: number }[],
) {
  try {
    for (const item of fieldOrders) {
      await db
        .update(curriculumFields)
        .set({ order: item.order })
        .where(eq(curriculumFields.id, item.id));
    }
    return { success: true };
  } catch (error) {
    console.error("Error in updateFieldsOrderAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 16. الحصول على معرف فيديو من Bunny Stream للرفع
 */
export async function getBunnyVideoGuidAction(title: string) {
  try {
    const libraryId = process.env.BUNNY_LIBRARY_ID || "";
    const apiKey = process.env.BUNNY_API_KEY || "";

    if (!libraryId || !apiKey) {
      return { success: false, error: "Bunny.net configuration is missing" };
    }

    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      },
    );

    const data = await response.json();
    if (data.guid) {
      return { success: true, guid: data.guid, libraryId };
    }

    return { success: false, error: "Failed to create video on Bunny" };
  } catch (error) {
    console.error("Error in getBunnyVideoGuidAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 17. جلب قائمة الطلاب الذين أكملوا درساً معيناً
 */
export async function getLessonCompletionStudentsAction(lessonId: string) {
  try {
    const students = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessonProgress)
      .innerJoin(users, eq(lessonProgress.studentId, users.id))
      .where(eq(lessonProgress.lessonId, lessonId))
      .orderBy(desc(lessonProgress.completedAt));

    return { success: true, data: students };
  } catch (error) {
    console.error("Error in getLessonCompletionStudentsAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 18. تفعيل أو تعطيل درس لمجموعة (Section) معينة
 */
export async function toggleLessonAvailabilityAction(data: {
  sectionId: string;
  lessonId: string;
  isEnabled: boolean;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, error: "Unauthorized" };

    await db
      .insert(sectionLessonAvailability)
      .values({
        sectionId: data.sectionId,
        lessonId: data.lessonId,
        isEnabled: data.isEnabled,
        enabledAt: data.isEnabled ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [
          sectionLessonAvailability.sectionId,
          sectionLessonAvailability.lessonId,
        ],
        set: {
          isEnabled: data.isEnabled,
          enabledAt: data.isEnabled ? new Date() : null,
          updatedAt: new Date(),
        },
      });

    revalidatePath(
      `/dashboardUser/[userId]/courses/${data.sectionId}/content`,
      "page",
    );
    return { success: true };
  } catch (error) {
    console.error("Error in toggleLessonAvailabilityAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * 19. جلب إحصائيات النظام المطور الشاملة (للأدمن)
 */
export async function getAdminV2StatsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const [v2SectionsCount] = await db
      .select({ count: count() })
      .from(courseSections)
      .where(eq(courseSections.isV2, true));

    const [totalStudents] = await db
      .select({ count: count() })
      .from(courseEnrollments)
      .innerJoin(
        courseSections,
        eq(courseEnrollments.sectionId, courseSections.id),
      )
      .where(eq(courseSections.isV2, true));

    const [totalLessons] = await db
      .select({ count: count() })
      .from(curriculumLessons)
      .innerJoin(
        courseSections,
        eq(curriculumLessons.sectionId, courseSections.id),
      )
      .where(eq(courseSections.isV2, true));

    return {
      success: true,
      data: {
        totalCourses: v2SectionsCount.count,
        totalStudents: totalStudents.count,
        totalLessons: totalLessons.count,
      },
    };
  } catch (error) {
    console.error("Error in getAdminV2StatsAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
