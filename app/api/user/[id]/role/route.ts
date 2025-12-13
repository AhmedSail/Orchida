import { db } from "@/src";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { role } = await req.json();

  await db.update(users).set({ role }).where(eq(users.id, id));

  return Response.json({ message: "تم تعديل الصلاحية" });
}
