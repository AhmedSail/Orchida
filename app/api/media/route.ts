import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/src/db";
import { mediaFiles, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const workId = formData.get("workId") as string;
    const isMainRaw = formData.get("isMain") as string | null;
    const isMain = isMainRaw === "true";

    if (!file || !workId) {
      return NextResponse.json(
        { error: "Missing file or workId" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "works" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    // حفظ في DB
    const inserted = await db
      .insert(mediaFiles)
      .values({
        workId,
        url: uploadResult.secure_url,
        type: uploadResult.resource_type === "video" ? "video" : "image",
        publicId: uploadResult.public_id,
        filename: uploadResult.original_filename,
        mimeType: file.type,
        size: file.size,
      })
      .returning();

    const saved = inserted[0];

    // لو رئيسي: حدث work.mainMediaId
    if (isMain && saved?.id) {
      await db
        .update(works)
        .set({ mainMediaId: saved.id, updatedAt: new Date() })
        .where(eq(works.id, workId));
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, workId } = await req.json();

    // جلب الملف
    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));
    if (!file)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // حذف من Cloudinary
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: file.type, // "image" | "video"
    });

    // إذا المحذوف هو الرئيسي، صفّر mainMediaId
    if (workId) {
      const [work] = await db.select().from(works).where(eq(works.id, workId));
      if (work?.mainMediaId === id) {
        await db
          .update(works)
          .set({ mainMediaId: null, updatedAt: new Date() })
          .where(eq(works.id, workId));
      }
    }

    // حذف من DB
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
