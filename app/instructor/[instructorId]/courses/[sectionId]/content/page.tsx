import Clasification from "@/components/instructor/Clasification";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import {
  chapterContent,
  courseChapters,
  courseEnrollments,
  courseModules,
  courses,
  courseSections,
  users,
  sectionForumPosts,
  sectionForumReplies,
} from "@/src/db/schema";
import { and, eq, InferSelectModel, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export type AllModules = InferSelectModel<typeof courseModules>;
export type AllChapters = InferSelectModel<typeof courseChapters>;
export type AllContent = InferSelectModel<typeof chapterContent>;
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: " المحتوى",
};
const page = async ({
  params,
}: {
  params: Promise<{ instructorId: string; sectionId: string }>;
}) => {
  const { instructorId, sectionId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // ✅ جلب بيانات الشعبة مع حالة الدورة
  const section = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      sectionStatus: courseSections.status,
      notes: courseSections.notes,
      instructorId: courseSections.instructorId,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, sectionId))
    .limit(1);

  // ✅ جلب الطلاب المسجلين في هذه الشعبة
  const students = await db
    .select({
      id: courseEnrollments.id,
      studentName: courseEnrollments.studentName,
      studentEmail: courseEnrollments.studentEmail,
      studentPhone: courseEnrollments.studentPhone,
      confirmationStatus: courseEnrollments.confirmationStatus,
    })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.sectionId, sectionId));

  if (section.length === 0) {
    return <div>❌ لم يتم العثور على هذه الشعبة</div>;
  }

  const instructorSections = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      courseId: courses.id,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.instructorId, instructorId));

  const allModules = await db
    .select()
    .from(courseModules)
    .where(
      and(
        eq(courseModules.sectionId, sectionId),
        eq(courseModules.intructorId, instructorId),
      ),
    );

  const chapters = await db.select().from(courseChapters);
  const contents = await db.select().from(chapterContent);

  // ✅ جلب بيانات المستخدم كاملة لـ ChatForm
  const userData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // ✅ جلب المشاركات (Posts)
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
    })
    .from(sectionForumPosts)
    .leftJoin(users, eq(sectionForumPosts.authorId, users.id))
    .where(eq(sectionForumPosts.sectionId, sectionId));

  // ✅ جلب الردود (Replies)
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
    })
    .from(sectionForumReplies)
    .leftJoin(users, eq(sectionForumReplies.userId, users.id));

  const postsWithReplies = posts.map((post) => ({
    ...post,
    replies: replies.filter((r) => r.postId === post.id),
  }));

  return (
    <div>
      <Clasification
        user={session.user.name ?? ""}
        instructorSections={instructorSections}
        section={section[0]}
        allModules={allModules}
        userId={instructorId}
        courseId={
          instructorSections.find((s) => s.sectionId === sectionId)?.courseId ??
          ""
        }
        chapters={chapters}
        contents={contents}
        role={session.user.role}
        students={students}
        posts={postsWithReplies}
        userData={userData}
      />
    </div>
  );
};

export default page;
