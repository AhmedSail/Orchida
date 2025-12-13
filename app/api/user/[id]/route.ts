import { db } from "@/src";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const body = await req.json();

  await db
    .update(users)
    .set({
      name: body.name,
      phone: body.phone,
      image: body.image,
    })
    .where(eq(users.id, params.id));

  return Response.json({ success: true });
}
