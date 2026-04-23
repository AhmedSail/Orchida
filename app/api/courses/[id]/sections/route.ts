import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseSections } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const sections = await db.query.courseSections.findMany({
      where: and(
        eq(courseSections.courseId, id),
        eq(courseSections.status, "open") // Only show open sections for registration
      ),
      with: {
        instructor: {
          columns: {
            name: true,
          }
        }
      },
      orderBy: (sections, { desc }) => [desc(sections.createdAt)],
    });

    return NextResponse.json(sections);
  } catch (error: any) {
    console.error("Error fetching course sections:", error);
    return NextResponse.json(
      { message: "فشل جلب شعب الدورة", error: error.message },
      { status: 500 }
    );
  }
}
