// حجم كل جزء: 10 ميجابايت (الحد الأدنى لـ S3 هو 5MB)
const PART_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentPart: number;
  totalParts: number;
}

interface MultipartUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onPartComplete?: (partNumber: number, totalParts: number) => void;
  signal?: AbortSignal;
}

interface CreateUploadResponse {
  uploadId: string;
  fileName: string;
  presignedUrls: { partNumber: number; url: string }[];
}

interface CompleteUploadResponse {
  url: string;
}

/**
 * رفع ملف كبير باستخدام Multipart Upload
 * يدعم ملفات حتى 5TB
 */
export async function uploadLargeFile(
  file: File,
  options: MultipartUploadOptions = {}
): Promise<string> {
  const { onProgress, onPartComplete, signal } = options;

  // حساب عدد الأجزاء
  const totalParts = Math.ceil(file.size / PART_SIZE);

  // 1. بدء الرفع والحصول على presigned URLs
  const createResponse = await fetch("/api/upload/multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      totalParts,
    }),
    signal,
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(error.error || "Failed to create multipart upload");
  }

  const { uploadId, fileName, presignedUrls }: CreateUploadResponse =
    await createResponse.json();

  // 2. رفع كل جزء
  const uploadedParts: { PartNumber: number; ETag: string }[] = [];
  let totalUploaded = 0;

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      // قص الجزء من الملف
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const chunk = file.slice(start, end);

      // البحث عن الـ presigned URL لهذا الجزء
      const presignedUrl = presignedUrls.find(
        (p) => p.partNumber === partNumber
      )?.url;

      if (!presignedUrl) {
        throw new Error(`Missing presigned URL for part ${partNumber}`);
      }

      // رفع الجزء مع تتبع التقدم
      const etag = await uploadPartWithProgress(
        presignedUrl,
        chunk,
        partNumber,
        totalParts,
        file.size,
        totalUploaded,
        onProgress,
        signal
      );

      uploadedParts.push({
        PartNumber: partNumber,
        ETag: etag,
      });

      totalUploaded += chunk.size;
      onPartComplete?.(partNumber, totalParts);
    }

    // 3. إكمال الرفع
    const completeResponse = await fetch("/api/upload/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        fileName,
        uploadId,
        parts: uploadedParts,
      }),
      signal,
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.error || "Failed to complete multipart upload");
    }

    const { url }: CompleteUploadResponse = await completeResponse.json();
    return url;
  } catch (error) {
    // إلغاء الرفع في حالة حدوث خطأ
    try {
      await fetch("/api/upload/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "abort",
          fileName,
          uploadId,
        }),
      });
    } catch {
      // تجاهل أخطاء الإلغاء
    }
    throw error;
  }
}

/**
 * رفع جزء واحد مع تتبع التقدم
 */
async function uploadPartWithProgress(
  url: string,
  chunk: Blob,
  partNumber: number,
  totalParts: number,
  totalFileSize: number,
  previouslyUploaded: number,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const currentPartLoaded = e.loaded;
        const totalLoaded = previouslyUploaded + currentPartLoaded;

        onProgress({
          loaded: totalLoaded,
          total: totalFileSize,
          percentage: Math.round((totalLoaded / totalFileSize) * 100),
          currentPart: partNumber,
          totalParts,
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // الحصول على ETag من الـ response headers
        const etag = xhr.getResponseHeader("ETag");
        if (etag) {
          resolve(etag.replace(/"/g, ""));
        } else {
          reject(new Error(`Missing ETag for part ${partNumber}`));
        }
      } else {
        reject(
          new Error(`Failed to upload part ${partNumber}: ${xhr.statusText}`)
        );
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error(`Network error uploading part ${partNumber}`));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    // إذا تم تمرير AbortSignal
    if (signal) {
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.open("PUT", url);
    xhr.send(chunk);
  });
}

/**
 * فحص إذا كان الملف يحتاج رفع مجزأ
 * الملفات أكبر من 50MB تستخدم الرفع المجزأ
 */
export function shouldUseMultipartUpload(file: File): boolean {
  return file.size > 50 * 1024 * 1024; // 50MB
}

/**
 * دالة موحدة للرفع - تختار تلقائياً بين الرفع العادي والمجزأ
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (shouldUseMultipartUpload(file)) {
    // استخدام الرفع المجزأ للملفات الكبيرة
    return uploadLargeFile(file, {
      onProgress: (progress) => onProgress?.(progress.percentage),
    });
  } else {
    // استخدام الرفع العادي للملفات الصغيرة
    const { uploadToR2 } = await import("./r2-client");
    return uploadToR2(file, onProgress);
  }
}
