import { db } from "@/src/db";
import { interactiveLinks } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  try {
    if (courseId) {
      const links = await db
        .select()
        .from(interactiveLinks)
        .where(eq(interactiveLinks.courseId, courseId))
        .orderBy(interactiveLinks.createdAt);
      return NextResponse.json(links);
    }

    const allLinks = await db
      .select()
      .from(interactiveLinks)
      .orderBy(interactiveLinks.createdAt);
    return NextResponse.json(allLinks);
  } catch (error) {
    console.error("Error fetching interactive links:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
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
    const { courseId, title, description, instructorUrl, studentUrl } = body;

    if (
      !courseId ||
      !title ||
      !description ||
      (!instructorUrl && !studentUrl)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const dataToInsert = [];

    if (instructorUrl) {
      dataToInsert.push({
        courseId,
        title,
        description,
        url: instructorUrl,
        target: "instructor" as const,
        isActive: true,
      });
    }

    if (studentUrl) {
      dataToInsert.push({
        courseId,
        title,
        description,
        url: studentUrl,
        target: "student" as const,
        isActive: true,
      });
    }

    const inserted = await db
      .insert(interactiveLinks)
      .values(dataToInsert)
      .returning();

    return NextResponse.json(inserted);
  } catch (error) {
    console.error("Error creating interactive links:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
