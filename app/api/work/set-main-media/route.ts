import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { mediaFiles, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { workId, mediaId } = await req.json();
    if (!workId || !mediaId) {
      return NextResponse.json(
        { error: "Missing workId or mediaId" },
        { status: 400 }
      );
    }

    // تأكد أن mediaId فعلاً ينتمي إلى هذا العمل
    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, mediaId));
    if (!file || file.workId !== workId) {
      return NextResponse.json(
        { error: "Media doesn't belong to the work" },
        { status: 400 }
      );
    }

    await db
      .update(works)
      .set({ mainMediaId: mediaId, updatedAt: new Date() })
      .where(eq(works.id, workId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error setting main media:", error);
    return NextResponse.json(
      { error: "Failed to set main media" },
      { status: 500 }
    );
  }
}
