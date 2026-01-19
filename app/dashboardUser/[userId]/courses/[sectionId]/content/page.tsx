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
  users, // 👈 لازم نستدعي جدول اللقاءات
} from "@/src/db/schema";
import { and, eq, InferSelectModel, or, isNull, lte } from "drizzle-orm";
import { User } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export type AllModules = InferSelectModel<typeof courseModules>;
export type AllChapters = InferSelectModel<typeof courseChapters>;
export type AllContent = InferSelectModel<typeof chapterContent>;
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة الطالب",
  description: "المحتوى ",
};
const Page = async ({
  params,
}: {
  params: { instructorId: string; sectionId: string };
}) => {
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
  if (role !== "user") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }

  // ✅ جلب بيانات الشعبة مع الكورس
  const section = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      courseId: courses.id,
      notes: courseSections.notes,
      instructorId: courseSections.instructorId,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, param.sectionId))
    .limit(1);

  if (section.length === 0) {
    return <div>❌ لم يتم العثور على هذه الشعبة</div>;
  }

  // ✅ جلب الموديولات الخاصة بالشعبة (اللقاءات)
  const allModules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.sectionId, param.sectionId));

  // ✅ جلب الفصول والمحتوى
  const chapters = await db.select().from(courseChapters);
  const contents = await db.select().from(chapterContent);

  // ✅ جلب حالة الدفع والتأكيد من جدول courseEnrollments
  const enrollment = await db
    .select({
      paymentStatus: courseEnrollments.paymentStatus,
      confirmationStatus: courseEnrollments.confirmationStatus,
      IBAN: courseEnrollments.IBAN,
    })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.sectionId, param.sectionId),
        eq(courseEnrollments.studentId, session.user.id),
      ),
    )
    .limit(1);

  const paymentStatus = enrollment[0]?.paymentStatus;
  const confirmationStatus = enrollment[0]?.confirmationStatus;
  const IBAN = enrollment[0]?.IBAN;

  // ✅ جلب اللقاءات الخاصة بالشعبة وحساب المؤرشفة
  const sectionMeetings = await db
    .select({
      id: meetings.id,
      archived: meetings.archived,
    })
    .from(meetings)
    .where(eq(meetings.sectionId, param.sectionId));

  const archivedCount = sectionMeetings.filter(
    (m) => m.archived === true,
  ).length;

  // ✅ الشرط: إذا الدفع = pending والتأكيد = pending وعدد اللقاءات المؤرشفة = 3 → إخفاء المحتوى
  if (
    paymentStatus === "pending" &&
    confirmationStatus === "pending" &&
    archivedCount >= 3
  ) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ الوصول مرفوض</h2>
        <p className="text-gray-700">
          لقد تم أرشفة 3 لقاءات في هذه الشعبة، وحالتك غير مدفوعة ولم يتم تأكيد
          تسجيلك. يرجى تسديد الرسوم حتى تتمكن من مشاهدة المحتوى.
        </p>
      </div>
    );
  }
  if (confirmationStatus === "rejected" || confirmationStatus === "pending") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ الوصول مرفوض</h2>
        <p className="text-gray-700">
          تم حظر وصولك الى هذه الدورة قم بمراجعة الادارة
        </p>
      </div>
    );
  }

  // ✅ عرض المحتوى إذا الشرط غير محقق
  return (
    <div>
      <Clasification
        user={session.user.name}
        section={section[0]}
        allModules={allModules}
        userId={session.user.id}
        courseId={section[0]?.courseId ?? ""}
        chapters={chapters}
        contents={contents}
        IBAN={IBAN}
        role={session.user.role}
      />
    </div>
  );
};

export default Page;
