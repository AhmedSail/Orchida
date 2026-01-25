import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from "@/lib/r2-server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { eq, desc } from "drizzle-orm";
import { db } from "@/src";
import { instructorMediaLibrary } from "@/src/db/schema";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Fetch from database instead of R2 list
    const files = await db
      .select()
      .from(instructorMediaLibrary)
      .where(eq(instructorMediaLibrary.instructorId, userId))
      .orderBy(desc(instructorMediaLibrary.createdAt));

    return NextResponse.json({
      files: files.map((f) => ({
        key: f.fileKey,
        url: f.url,
        name: f.name,
        type: f.type,
        size: f.size,
        lastModified: f.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Library list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json().catch(() => null);

    // Check if this is a completion of a presigned upload
    if (body && body.isPresigned) {
      const { key, url, name, type, size } = body;

      await db.insert(instructorMediaLibrary).values({
        instructorId: userId,
        fileKey: key,
        url: url,
        name: name,
        type: type,
        size: size,
      });

      return NextResponse.json({
        url,
        key,
        name,
        type,
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `instructors/${userId}/${fileName}`;

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

    // Save to Database
    let type = "file";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";

    await db.insert(instructorMediaLibrary).values({
      instructorId: userId,
      fileKey: key,
      url: url,
      name: file.name, // Original name
      type: type,
      size: file.size,
    });

    return NextResponse.json({
      url,
      key,
      name: file.name,
      type: type,
    });
  } catch (error: any) {
    console.error("Library upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key } = await req.json();

    // Security check
    const expectedPrefix = `instructors/${session.user.id}/`;
    if (!key || !key.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Unauthorized deletion" },
        { status: 403 },
      );
    }

    // Delete from R2
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);

    // Delete from DB
    await db
      .delete(instructorMediaLibrary)
      .where(eq(instructorMediaLibrary.fileKey, key));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
