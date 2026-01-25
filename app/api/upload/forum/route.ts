import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from "@/lib/r2-server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // التحقق من نوع الملف (صورة أو فيديو)
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only images and videos are allowed" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `forum/${userId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    });

    await r2Client.send(command);

    const cleanDomain = R2_PUBLIC_DOMAIN.replace(/\/$/, "");
    let url = `${cleanDomain}/${key}`;
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    return NextResponse.json({
      url,
      key,
      type: isImage ? "image" : "video",
    });
  } catch (error: any) {
    console.error("Forum media upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
