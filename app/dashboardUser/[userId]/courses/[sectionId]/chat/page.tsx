// app/instructor/[instructorId]/courses/[sectionId]/chat/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { courseSections, courses, users } from "@/src/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import React from "react";
import ChatForm from "@/components/ChatForm";
import { sectionForumPosts, sectionForumReplies } from "@/src/db/schema";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة الطالب",
  description: "المنتدى الطلابي",
};
const Page = async ({
  params,
}: {
  params: { instructorId: string; sectionId: string };
}) => {
  const { sectionId } = await params;

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

  // ✅ جلب بيانات الشعبة المفتوحة
  const section = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      status: courseSections.status,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, sectionId))
    .limit(1);

  if (section.length === 0) {
    return <div>❌ لم يتم العثور على هذه الشعبة</div>;
  }

  // ✅ جلب بيانات المستخدم من جدول users
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

  const user = userData[0];

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
    })
    .from(sectionForumPosts)
    .leftJoin(users, eq(sectionForumPosts.authorId, users.id))
    .where(
      user.role === "instructor"
        ? eq(sectionForumPosts.sectionId, sectionId) // المدرب يشوف الكل
        : and(
            eq(sectionForumPosts.sectionId, sectionId),
            inArray(sectionForumPosts.status, ["approved", "pendingForSelf"]), // الطالب يشوف بس approved
          ),
    );

  // ✅ جلب الردود
  const replies = await db
    .select({
      id: sectionForumReplies.id,
      postId: sectionForumReplies.postId,
      userId: sectionForumReplies.userId,
      content: sectionForumReplies.content,
      authorName: users.name,
      roleUser: users.role,
      userImage: users.image,
    })
    .from(sectionForumReplies)
    .leftJoin(users, eq(sectionForumReplies.userId, users.id));

  const postsWithReplies = posts.map((post) => ({
    ...post,
    replies: replies.filter((r) => r.postId === post.id),
  }));

  return (
    <div>
      <ChatForm
        section={section}
        userData={userData}
        posts={postsWithReplies}
      />
    </div>
  );
};

export default Page;
