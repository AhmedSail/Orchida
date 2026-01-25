import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from "@/lib/r2-server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file info" }, { status: 400 });
    }

    const userId = session.user.id;
    const uniqueId = uuidv4().substring(0, 8);
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `instructors/${userId}/${uniqueId}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Generate Presigned URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    const cleanDomain = R2_PUBLIC_DOMAIN.replace(/\/$/, "");
    let publicUrl = `${cleanDomain}/${key}`;
    if (!publicUrl.startsWith("http")) {
      publicUrl = `https://${publicUrl}`;
    }

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
    });
  } catch (error: any) {
    console.error("Presigned URL error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
