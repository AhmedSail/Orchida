// utils/cloudinary.ts
import imageCompression from "browser-image-compression";

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhjiperae";

const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

// ✅ رفع صورة أو فيديو → يرجع الرابط فقط (string)
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("إعدادات Cloudinary مفقودة.");
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
  let fileToUpload: File | Blob = file;

  // لو صورة → نضغطها قبل الرفع
  if (file.type.startsWith("image/")) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    fileToUpload = await imageCompression(file, options);
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("فشل الرفع:", errorData);
    throw new Error(`فشل الرفع بحالة ${response.status}`);
  }

  const data = await response.json();
  return data.secure_url; // ✅ يرجع الرابط فقط
}

// ✅ رفع عدة ملفات (صور أو فيديوهات) → يرجع روابط فقط
export async function uploadMultipleToCloudinary(
  files: File[]
): Promise<string[]> {
  if (files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
}

// ✅ دالة الحذف
export async function deleteFromCloudinary(fileUrl: string): Promise<void> {
  try {
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `فشل حذف الملف ${fileUrl}:`,
        errorData.error || "خطأ غير معروف"
      );
    }
  } catch (error) {
    console.error(`فشل الاتصال بـ API الحذف للملف ${fileUrl}:`, error);
  }
}
