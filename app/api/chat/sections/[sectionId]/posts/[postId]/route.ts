import { db } from "@/src/db";
import { sectionForumPosts, sectionForumReplies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// ✅ حذف مشاركة مع ردودها
export async function DELETE(
  req: Request,
  context: { params: { postId: string } }
) {
  const { postId } = await context.params;

  // أولاً حذف الردود المرتبطة
  await db
    .delete(sectionForumReplies)
    .where(eq(sectionForumReplies.postId, postId));

  // بعدين حذف المشاركة نفسها
  await db.delete(sectionForumPosts).where(eq(sectionForumPosts.id, postId));

  return NextResponse.json({ success: true });
}

// ✅ تعديل مشاركة عبر postId في الـ params
export async function PUT(
  req: Request,
  context: { params: { postId: string } }
) {
  const { postId } = await context.params; // 👈 ناخذ postId من الـ params
  const body = await req.json();
  const { content, status, instructorReply } = body;

  const updatedPost = await db
    .update(sectionForumPosts)
    .set({
      ...(content && { content }), // تعديل النص إذا موجود
      ...(status && { status }), // تعديل الحالة إذا موجود
      ...(instructorReply && { instructorReply }), // تعديل رد المدرب إذا موجود
      updatedAt: new Date(), // تحديث وقت آخر تعديل
    })
    .where(eq(sectionForumPosts.id, postId))
    .returning();

  return NextResponse.json({ post: updatedPost[0] });
}
