import { db } from "@/src/db";
import { sectionForumReplies } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// ✅ إضافة رد
export async function POST(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const param = await context.params;
  const postId = param.postId;
  const body = await req.json();
  const { userId, content, imageUrl, videoUrl, parentReplyId } = body;

  console.log("Creating Reply:", { userId, content, parentReplyId, videoUrl }); // 👈 Log for debugging

  const [newReply] = await db
    .insert(sectionForumReplies)
    .values({
      id: randomUUID(),
      postId,
      userId,
      content,
      imageUrl,
      videoUrl, // ✅ دعم الفيديو
      parentReplyId, // ✅ للرد على رد (instructor only)
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json({ reply: newReply });
}

// ✅ حذف رد
export async function DELETE(req: Request) {
  const body = await req.json();
  const { replyId } = body;

  await db
    .delete(sectionForumReplies)
    .where(eq(sectionForumReplies.id, replyId));

  return NextResponse.json({ success: true });
}
