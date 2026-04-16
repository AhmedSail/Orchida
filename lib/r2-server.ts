import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
  // Warn but don't crash, let calls fail if env missing
  console.warn("Missing R2 S3 credentials in environment variables.");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || "";

export async function uploadFromUrl(url: string, prefix: string = "ai-results") {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const extension = contentType.split("/")[1] || "bin";
    const fileName = `${prefix}/${crypto.randomUUID()}.${extension}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return `${R2_PUBLIC_DOMAIN}/${fileName}`;
  } catch (error) {
    console.error("Error uploading from URL to R2:", error);
    return null;
  }
}
