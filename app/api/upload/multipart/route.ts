import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = "force-dynamic";

// إنشاء S3 Client متوافق مع R2
function getS3Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 S3 credentials");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// بدء رفع مجزأ جديد
async function createMultipartUpload(fileName: string, contentType: string) {
  const s3Client = getS3Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: contentType,
  });

  const response = await s3Client.send(command);
  return response.UploadId;
}

// الحصول على presigned URL لجزء معين
async function getPresignedUrlForPart(
  fileName: string,
  uploadId: string,
  partNumber: number
) {
  const s3Client = getS3Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: fileName,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  // Presigned URL صالح لمدة ساعة
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return presignedUrl;
}

// إكمال الرفع المجزأ
async function completeMultipartUpload(
  fileName: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
) {
  const s3Client = getS3Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: fileName,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  });

  await s3Client.send(command);

  // إرجاع الرابط العام
  let publicDomain = process.env.R2_PUBLIC_DOMAIN || "";
  if (publicDomain && !publicDomain.startsWith("http")) {
    publicDomain = `https://${publicDomain}`;
  }
  publicDomain = publicDomain.replace(/\/$/, "");

  return `${publicDomain}/${fileName}`;
}

// إلغاء الرفع المجزأ
async function abortMultipartUpload(fileName: string, uploadId: string) {
  const s3Client = getS3Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  const command = new AbortMultipartUploadCommand({
    Bucket: bucketName,
    Key: fileName,
    UploadId: uploadId,
  });

  await s3Client.send(command);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create": {
        // بدء رفع جديد
        const { fileName: originalName, contentType, totalParts } = body;
        const fileExtension = originalName.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;

        const uploadId = await createMultipartUpload(fileName, contentType);

        // الحصول على presigned URLs لجميع الأجزاء
        const presignedUrls: { partNumber: number; url: string }[] = [];
        for (let i = 1; i <= totalParts; i++) {
          const url = await getPresignedUrlForPart(fileName, uploadId!, i);
          presignedUrls.push({ partNumber: i, url });
        }

        return NextResponse.json({
          uploadId,
          fileName,
          presignedUrls,
        });
      }

      case "complete": {
        // إكمال الرفع
        const { fileName, uploadId, parts } = body;
        const url = await completeMultipartUpload(fileName, uploadId, parts);

        return NextResponse.json({ url });
      }

      case "abort": {
        // إلغاء الرفع
        const { fileName, uploadId } = body;
        await abortMultipartUpload(fileName, uploadId);

        return NextResponse.json({ message: "Upload aborted" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Multipart Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
