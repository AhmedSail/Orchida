import { db } from "@/src/db";
import { interactiveLinks } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user from DB to verify role
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.user.id),
  });

  if (!user || !["admin", "coordinator"].includes(user.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .delete(interactiveLinks)
      .where(eq(interactiveLinks.id, (await context.params).id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting interactive link:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user from DB to verify role
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.user.id),
  });

  if (!user || !["admin", "coordinator"].includes(user.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await db
      .update(interactiveLinks)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(interactiveLinks.id, (await context.params).id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating interactive link:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
