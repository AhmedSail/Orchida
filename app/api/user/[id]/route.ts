import { db } from "@/src";
import { users, instructors } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const body = await req.json();

  try {
    // ✅ تحديث جدول المستخدمين
    await db
      .update(users)
      .set({
        name: body.name,
        phone: body.phone,
        image: body.image,
      })
      .where(eq(users.id, params.id));

    // ✅ تحديث جدول المدربين إذا كان المستخدم مدرباً
    await db
      .update(instructors)
      .set({
        name: body.name,
        phone: body.phone,
      })
      .where(eq(instructors.id, params.id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "فشل في تحديث البيانات" }, { status: 500 });
  }
}
