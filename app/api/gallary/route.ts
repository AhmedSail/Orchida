import { db } from "@/src/db";
import { mediaFiles } from "@/src/db/schema";
import { NextResponse } from "next/server";

// ➕ إضافة وسائط مرتبطة بعمل
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [newMedia] = await db
      .insert(mediaFiles)
      .values({
        workId: body.workId,
        url: body.url,
        type: body.type,
        publicId: body.publicId,
        filename: body.filename,
        mimeType: body.mimeType,
        size: body.size,
      })
      .returning();

    return NextResponse.json(newMedia);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}

// // 📄 عرض الوسائط المرتبطة بعمل معين
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const workId = searchParams.get("workId");

//   if (!workId) {
//     return NextResponse.json({ error: "workId is required" }, { status: 400 });
//   }

//   try {
//     const files = await db
//       .select()
//       .from(mediaFiles)
//       .where(mediaFiles.workId.eq(workId));
//     return NextResponse.json(files);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch media" },
//       { status: 500 }
//     );
//   }
// }
