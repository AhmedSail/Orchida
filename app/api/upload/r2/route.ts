import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Next.js 15 Route Segment Config
export const maxDuration = 300; // 5 minutes timeout
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // فحص حجم الملف (2 جيجابايت كحد أقصى)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 2GB limit" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const contentType = file.type || "application/octet-stream";

    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !bucketName || !apiToken) {
      console.error("Missing R2 credentials:", {
        hasAccountId: !!accountId,
        hasBucketName: !!bucketName,
        hasApiToken: !!apiToken,
      });
      return NextResponse.json(
        { error: "Server configuration error: Missing R2 credentials" },
        { status: 500 }
      );
    }

    // استخدام Cloudflare API مع endpoint صحيح
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${fileName}`;

    console.log("Uploading to:", uploadUrl);

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": contentType,
      },
      body: buffer,
    });

    let publicDomain = process.env.R2_PUBLIC_DOMAIN || "";
    if (publicDomain && !publicDomain.startsWith("http")) {
      publicDomain = `https://${publicDomain}`;
    }
    // Remove trailing slash if present
    publicDomain = publicDomain.replace(/\/$/, "");

    const url = `${publicDomain}/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Url is required" }, { status: 400 });
    }

    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${fileName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudflare R2 Delete Error:", errorText);
      return NextResponse.json(
        { error: "Delete failed via API" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("R2 Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
