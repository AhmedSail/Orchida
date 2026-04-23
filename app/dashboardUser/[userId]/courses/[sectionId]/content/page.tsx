import Clasification from "@/components/user/dashboard/Clasification";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import {
  chapterContent,
  courseChapters,
  courseModules,
  courses,
  courseSections,
  courseEnrollments,
  meetings,
  users,
  sectionForumPosts,
  sectionForumReplies,
  curriculumLessons,
  curriculumFields,
  lessonProgress,
  sectionLessonAvailability,
} from "@/src/db/schema";
import { and, eq, InferSelectModel, or, asc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import CoursePlayer from "@/src/modules/lms-v2/ui/components/student/CoursePlayer";

export type AllModules = InferSelectModel<typeof courseModules>;
export type AllChapters = InferSelectModel<typeof courseChapters>;
export type AllContent = InferSelectModel<typeof chapterContent>;
import { Metadata } from "next";
import { Lock } from "lucide-react";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة الطالب",
  description: "المحتوى ",
};

export const dynamic = "force-dynamic";

const Page = async ({
  params,
}: {
  params: Promise<{ userId: string; sectionId: string }>;
}) => {
  const { userId, sectionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // ✅ جلب بيانات الشعبة والكورس مع حالة V2
  const sectionData = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      courseId: courses.id,
      isV2: courseSections.isV2,
      courseType: courseSections.courseType,
      notes: courseSections.notes,
      instructorId: courseSections.instructorId,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, sectionId))
    .limit(1);

  if (sectionData.length === 0) {
    return (
      <div className="p-10 text-center font-bold">
        ❌ لم يتم العثور على هذه الشعبة
      </div>
    );
  }

  const currentSection = sectionData[0];

  // ✅ منطق تحديد نوع الشعبة بناءً على الرقم:
  // 0: أونلاين فردي (تسجيلات فقط)
  // 1-1000: وجاهي (قاعة + تسجيلات)
  // 1001-2000: أونلاين مع متابعة (زوم + تسجيلات)

  if (currentSection.sectionNumber === 0) {
    currentSection.isV2 = true;
    currentSection.courseType = "online";
  } else if (
    currentSection.sectionNumber >= 1 &&
    currentSection.sectionNumber <= 1000
  ) {
    currentSection.courseType = "in_center";
  } else if (
    currentSection.sectionNumber >= 1001 &&
    currentSection.sectionNumber <= 2000
  ) {
    currentSection.courseType = "online";
  }

  // ==========================================
  // منطق الإصدار الثاني (LMS V2)
  // ==========================================
  if (currentSection.isV2) {
    const lessons = await db.query.curriculumLessons.findMany({
      where: or(
        // الدروس العامة (الثابتة للدورة - sectionId فارغ)
        and(
          eq(curriculumLessons.courseId, currentSection.courseId!),
          sql`${curriculumLessons.sectionId} IS NULL`,
        ),
        // الدروس الخاصة بهذه الشعبة فقط
        eq(curriculumLessons.sectionId, sectionId),
      ),
      orderBy: [asc(curriculumLessons.order)],
      with: {
        fields: {
          orderBy: [asc(curriculumFields.order)],
        },
      },
    });

    const progress = await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.studentId, session.user.id));

    const availability = await db
      .select()
      .from(sectionLessonAvailability)
      .where(eq(sectionLessonAvailability.sectionId, sectionId));

    // ✅ جلب اللقاءات (Zoom) إذا لم تكن الشعبة 0 (أي أونلاين مع متابعة أو وجاهي)
    const sectionMeetings =
      currentSection.sectionNumber !== 0
        ? await db
            .select()
            .from(meetings)
            .where(eq(meetings.sectionId, sectionId))
            .orderBy(asc(meetings.date))
        : [];

    // ✅ جلب بيانات التسجيل الخاصة بهذا الطالب لمعرفة نوع حضوره (أونلاين/وجاهي) وحالة الحظر
    const enrollment = await db
      .select({
        attendanceType: courseEnrollments.attendanceType,
        isBlocked: courseEnrollments.isBlocked,
      })
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.sectionId, sectionId),
          eq(courseEnrollments.studentId, session.user.id),
        ),
      )
      .limit(1);

    if (enrollment.length === 0) {
      redirect(`/courses/${currentSection.courseId}`);
    }

    const isBlocked = enrollment[0]?.isBlocked || false;
    const studentAttendanceType =
      enrollment[0]?.attendanceType || currentSection.courseType || "online";

    if (isBlocked) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-[40px] border border-zinc-100 shadow-sm mx-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">
            تم إغلاق محتوى الشعبة
          </h2>
          <p className="text-zinc-500 font-bold max-w-md leading-relaxed">
            نعتذر منك، لقد تم تقييد الوصول لمحتويات هذه الشعبة مؤقتاً. يرجى
            مراجعة الإدارة لتفعيل الحساب ومتابعة الدروس.
          </p>
        </div>
      );
    }

    return (
      <CoursePlayer
        course={{ title: currentSection.courseTitle }}
        lessons={lessons}
        initialProgress={progress}
        courseType={studentAttendanceType}
        sectionAvailability={availability}
        sectionNumber={currentSection.sectionNumber}
        meetings={sectionMeetings}
        userId={session.user.id}
        studentInfo={{
          name: session.user.name || "طالب أوركيدة",
          id: `ID: ${session.user.id.slice(0, 8)}`,
        }}
      />
    );
  }

  // ==========================================
  // منطق الإصدار القديم (Original Logic)
  // ==========================================

  // ✅ جلب الموديولات الخاصة بالشعبة (اللقاءات)
  const allModules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.sectionId, sectionId));

  // ✅ جلب الفصول والمحتوى
  const chapters = await db.select().from(courseChapters);
  const contents = await db.select().from(chapterContent);

  // ✅ جلب حالة الدفع والتأكيد
  const enrollment = await db
    .select({
      paymentStatus: courseEnrollments.paymentStatus,
      confirmationStatus: courseEnrollments.confirmationStatus,
      IBAN: courseEnrollments.IBAN,
      swiftCode: courseEnrollments.swiftCode,
      bankName: courseEnrollments.bankName,
    })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.sectionId, sectionId),
        eq(courseEnrollments.studentId, session.user.id),
      ),
    )
    .limit(1);

  const paymentStatus = enrollment[0]?.paymentStatus;
  const confirmationStatus = enrollment[0]?.confirmationStatus;
  const IBAN = enrollment[0]?.IBAN;
  const swiftCode = enrollment[0]?.swiftCode;
  const bankName = enrollment[0]?.bankName;

  const sectionMeetings = await db
    .select({
      id: meetings.id,
      archived: meetings.archived,
    })
    .from(meetings)
    .where(eq(meetings.sectionId, sectionId));

  const archivedCount = sectionMeetings.filter(
    (m) => m.archived === true,
  ).length;

  if (
    paymentStatus === "pending" &&
    confirmationStatus === "pending" &&
    archivedCount >= 3
  ) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ الوصول مرفوض</h2>
        <p className="text-gray-700">يرجى تسديد الرسوم لمشاهدة المحتوى.</p>
      </div>
    );
  }

  if (confirmationStatus === "rejected") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ الوصول مرفوض</h2>
        <p className="text-gray-700">تم حظر وصولك لهذه الدورة.</p>
      </div>
    );
  }

  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const posts = await db
    .select({
      id: sectionForumPosts.id,
      authorId: sectionForumPosts.authorId,
      content: sectionForumPosts.content,
      status: sectionForumPosts.status,
      instructorReply: sectionForumPosts.instructorReply,
      authorName: users.name,
      userImage: users.image,
      roleUser: users.role,
      imageUrl: sectionForumPosts.imageUrl,
      videoUrl: sectionForumPosts.videoUrl,
      createdAt: sectionForumPosts.createdAt,
    })
    .from(sectionForumPosts)
    .leftJoin(users, eq(sectionForumPosts.authorId, users.id))
    .where(
      and(
        eq(sectionForumPosts.sectionId, sectionId),
        or(
          eq(sectionForumPosts.status, "approved"),
          eq(sectionForumPosts.authorId, session.user.id),
        ),
      ),
    )
    .orderBy(sectionForumPosts.createdAt);

  const replies = await db
    .select({
      id: sectionForumReplies.id,
      postId: sectionForumReplies.postId,
      userId: sectionForumReplies.userId,
      content: sectionForumReplies.content,
      authorName: users.name,
      roleUser: users.role,
      userImage: users.image,
      imageUrl: sectionForumReplies.imageUrl,
      videoUrl: sectionForumReplies.videoUrl,
      parentReplyId: sectionForumReplies.parentReplyId,
      createdAt: sectionForumReplies.createdAt,
    })
    .from(sectionForumReplies)
    .leftJoin(users, eq(sectionForumReplies.userId, users.id))
    .orderBy(sectionForumReplies.createdAt);

  const postsWithReplies = [...posts].reverse().map((post) => ({
    ...post,
    replies: replies.filter((r) => r.postId === post.id),
  }));

  return (
    <div>
      <Clasification
        user={session.user.name ?? ""}
        section={currentSection as any}
        allModules={allModules}
        userId={session.user.id}
        courseId={currentSection.courseId ?? ""}
        chapters={chapters}
        contents={contents}
        IBAN={IBAN}
        swiftCode={swiftCode}
        bankName={bankName}
        role={session.user.role}
        posts={postsWithReplies}
        userData={userData}
      />
    </div>
  );
};

export default Page;
