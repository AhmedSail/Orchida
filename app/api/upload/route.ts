// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from "@/lib/r2-server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // إنشاء مفتاح فريد في مجلد news
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `news/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    });

    await r2Client.send(command);

    let url = `${R2_PUBLIC_DOMAIN}/${key}`;
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    return NextResponse.json({
      url,
      public_id: key,
    });
  } catch (error: any) {
    console.error("News upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
