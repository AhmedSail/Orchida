// app/instructor/[instructorId]/courses/[sectionId]/chat/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { courseSections, courses, users, instructors } from "@/src/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import React from "react";
import ChatForm from "@/components/ChatForm";
import { sectionForumPosts, sectionForumReplies } from "@/src/db/schema";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: " المنتدى الطلابي",
};

export const dynamic = "force-dynamic";

const Page = async ({
  params,
}: {
  params: Promise<{ instructorId: string; sectionId: string }>;
}) => {
  const { sectionId } = await params;

  // ✅ جلب الـ Session (المستخدم الحالي)
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

  let finalUserData = userData;
  if (user && user.role === "instructor") {
    const instructorRecord = await db
      .select({ name: instructors.name })
      .from(instructors)
      .where(eq(instructors.id, user.id))
      .limit(1);

    if (instructorRecord.length > 0) {
      finalUserData = [
        {
          ...user,
          name: instructorRecord[0].name,
        },
      ];
    }
  }

  const posts = await db
    .select({
      id: sectionForumPosts.id,
      authorId: sectionForumPosts.authorId,
      content: sectionForumPosts.content,
      imageUrl: sectionForumPosts.imageUrl,
      videoUrl: sectionForumPosts.videoUrl, // ✅ جلب الفيديو
      status: sectionForumPosts.status,
      instructorReply: sectionForumPosts.instructorReply,
      authorName: users.name,
      userImage: users.image,
      roleUser: users.role,
      createdAt: sectionForumPosts.createdAt,
    })
    .from(sectionForumPosts)
    .leftJoin(users, eq(sectionForumPosts.authorId, users.id))
    .where(
      user.role === "instructor" ||
        user.role === "admin" ||
        user.id === process.env.NEXT_PUBLIC_SITE_ENGINEER_ID
        ? eq(sectionForumPosts.sectionId, sectionId) // المدرب والآدمين والمهندس يشوفوا الكل
        : and(
            eq(sectionForumPosts.sectionId, sectionId),
            or(
              eq(sectionForumPosts.status, "approved"),
              and(
                eq(sectionForumPosts.status, "pending"),
                eq(sectionForumPosts.authorId, user.id),
              ),
            ),
          ),
    )
    .orderBy(sectionForumPosts.createdAt);

  const postsReversed = posts.reverse();

  // ✅ جلب الردود
  const replies = await db
    .select({
      id: sectionForumReplies.id,
      postId: sectionForumReplies.postId,
      userId: sectionForumReplies.userId,
      content: sectionForumReplies.content,
      imageUrl: sectionForumReplies.imageUrl,
      videoUrl: sectionForumReplies.videoUrl, // ✅ جلب الفيديو
      parentReplyId: sectionForumReplies.parentReplyId, // ✅ للرد على رد
      authorName: users.name,
      roleUser: users.role,
      userImage: users.image,
      createdAt: sectionForumReplies.createdAt,
    })
    .from(sectionForumReplies)
    .leftJoin(users, eq(sectionForumReplies.userId, users.id))
    .orderBy(sectionForumReplies.createdAt);

  console.log("Fetched Replies:", JSON.stringify(replies, null, 2)); // 👈 Debug logs active

  const postsWithReplies = postsReversed.map((post) => ({
    ...post,
    replies: replies.filter((r) => r.postId === post.id),
  }));

  return (
    <div>
      <ChatForm
        section={section}
        userData={finalUserData}
        posts={postsWithReplies}
      />
    </div>
  );
};

export default Page;
