import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { mediaFiles, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // ✅ جلب كل الوسائط المرتبطة بالعمل
    const files = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.workId, id));

    // ✅ جلب العمل لمعرفة الـ mainMediaId
    const [work] = await db.select().from(works).where(eq(works.id, id));

    return NextResponse.json(
      {
        files,
        mainMediaId: work?.mainMediaId ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching work media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
