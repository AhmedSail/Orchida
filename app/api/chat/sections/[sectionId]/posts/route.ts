import { db } from "@/src/db";
import { sectionForumPosts, users } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// ✅ إضافة مشاركة جديدة
export async function POST(
  req: Request,
  context: { params: { sectionId: string } }
) {
  const param = await context.params;
  const body = await req.json();
  const { authorId, content, role } = body;
  const sectionId = param.sectionId;
  const status = role === "instructor" ? "approved" : "pendingForSelf";

  const newPost = await db
    .insert(sectionForumPosts)
    .values({
      id: randomUUID(),
      sectionId,
      authorId,
      content,
      status,
      instructorReply: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const author = await db
    .select({
      name: users.name,
      image: users.image,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, authorId))
    .limit(1);

  return NextResponse.json({ post: newPost[0] });
}
