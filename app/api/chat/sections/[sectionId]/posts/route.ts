import { db } from "@/src/db";
import { sectionForumPosts, users } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// ✅ إضافة مشاركة جديدة
export async function POST(
  req: Request,
  context: { params: Promise<{ sectionId: string }> },
) {
  const param = await context.params;
  const body = await req.json();
  const { authorId, content, role, imageUrl, videoUrl } = body;
  const sectionId = param.sectionId;
  const status = role === "instructor" ? "approved" : "pending";

  const [newPost] = await db
    .insert(sectionForumPosts)
    .values({
      id: randomUUID(),
      sectionId,
      authorId,
      content,
      imageUrl, // ✅ تخزين رابط الصورة
      videoUrl, // ✅ تخزين رابط الفيديو
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

  // تحديث الكاش للصفحة (اختياري، لكن مفيد)
  // revalidatePath(`/instructor/.../chat`);
  // بما أن المسار ديناميكي، قد يكون من الصعب توجيهه بدقة هنا بدون معرفة كل المعلمات،
  // ولكن force-dynamic في الصفحة يجب أن يحل المشكلة.

  return NextResponse.json({ post: newPost });
}
