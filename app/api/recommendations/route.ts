import { NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  instructorRecommendations,
  recommendationToSections,
} from "@/src/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// GET recommendations
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId");
  const sectionId = searchParams.get("sectionId");

  try {
    let query = db
      .select({
        id: instructorRecommendations.id,
        instructorId: instructorRecommendations.instructorId,
        title: instructorRecommendations.title,
        description: instructorRecommendations.description,
        imageUrl: instructorRecommendations.imageUrl,
        linkUrl: instructorRecommendations.linkUrl,
        createdAt: instructorRecommendations.createdAt,
      })
      .from(instructorRecommendations);

    const conditions = [];
    if (instructorId) {
      conditions.push(eq(instructorRecommendations.instructorId, instructorId));
    }

    if (sectionId) {
      // Filter by section via join
      const recommendations = await db
        .select({
          rec: instructorRecommendations,
        })
        .from(instructorRecommendations)
        .innerJoin(
          recommendationToSections,
          eq(
            instructorRecommendations.id,
            recommendationToSections.recommendationId,
          ),
        )
        .where(eq(recommendationToSections.sectionId, sectionId))
        .orderBy(desc(instructorRecommendations.createdAt));

      return NextResponse.json(recommendations.map((r) => r.rec));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      const results = await query
        .where(and(...conditions))
        .orderBy(desc(instructorRecommendations.createdAt));
      return NextResponse.json(results);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("GET Recommendations Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}

// POST new recommendation
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session?.user ||
    (session.user.role !== "instructor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const recId = uuidv4();

    // 1. Insert recommendation
    const newRecommendation = await db
      .insert(instructorRecommendations)
      .values({
        id: recId,
        instructorId: session.user.id,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
      })
      .returning();

    // 2. Insert section assignments if provided
    if (
      body.sectionIds &&
      Array.isArray(body.sectionIds) &&
      body.sectionIds.length > 0
    ) {
      const assignments = body.sectionIds.map((sId: string) => ({
        recommendationId: recId,
        sectionId: sId,
      }));
      await db.insert(recommendationToSections).values(assignments);
    }

    return NextResponse.json(newRecommendation[0]);
  } catch (error) {
    console.error("POST Recommendation Error:", error);
    return NextResponse.json(
      { error: "Failed to add recommendation" },
      { status: 500 },
    );
  }
}
