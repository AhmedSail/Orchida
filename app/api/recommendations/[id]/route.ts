import { NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  instructorRecommendations,
  recommendationToSections,
} from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const param = await params;
  try {
    const recommendation = await db.query.instructorRecommendations.findFirst({
      where: eq(instructorRecommendations.id, param.id),
      with: {
        sectionAssignments: true,
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const param = await params;

  if (
    !session?.user ||
    (session.user.role !== "instructor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check ownership
    const existing = await db.query.instructorRecommendations.findFirst({
      where: eq(instructorRecommendations.id, param.id),
    });

    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (
      existing.instructorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Update main record
    await db
      .update(instructorRecommendations)
      .set({
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        updatedAt: new Date(),
      })
      .where(eq(instructorRecommendations.id, param.id));

    // 2. Update section assignments
    if (body.sectionIds && Array.isArray(body.sectionIds)) {
      // Delete old
      await db
        .delete(recommendationToSections)
        .where(eq(recommendationToSections.recommendationId, param.id));

      // Insert new
      if (body.sectionIds.length > 0) {
        const assignments = body.sectionIds.map((sId: string) => ({
          recommendationId: param.id,
          sectionId: sId,
        }));
        await db.insert(recommendationToSections).values(assignments);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Recommendation Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const param = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user is instructor of this recommendation or admin
    const recommendation = await db.query.instructorRecommendations.findFirst({
      where: eq(instructorRecommendations.id, param.id),
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 },
      );
    }

    if (
      recommendation.instructorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .delete(instructorRecommendations)
      .where(eq(instructorRecommendations.id, param.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Recommendation Error:", error);
    return NextResponse.json(
      { error: "Failed to delete recommendation" },
      { status: 500 },
    );
  }
}
