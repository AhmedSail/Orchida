import { db } from "@/src";
import { digitalServices } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const service = await db
    .select()
    .from(digitalServices)
    .where(eq(digitalServices.id, id));

  return Response.json(service[0] || null);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const body = await req.json();

  const { id } = await context.params;

  await db
    .update(digitalServices)
    .set({
      name: body.name,
      description: body.description,
      icon: body.icon,
      isActive: body.isActive,
      updatedAt: new Date(),
    })
    .where(eq(digitalServices.id, id));

  return Response.json({ message: "تم تعديل الخدمة" });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await db.delete(digitalServices).where(eq(digitalServices.id, id));

  return Response.json({ message: "تم حذف الخدمة" });
}
