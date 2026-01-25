// utils/cloudinary.ts
// ✅ تم تحويل هذا الملف ليستخدم Cloudflare R2 بدلاً من Cloudinary بناءً على طلب المستخدم
import { uploadToR2, deleteFromR2 } from "@/lib/r2-client";

// ✅ رفع صورة أو فيديو → يرجع الرابط فقط (string)
export async function uploadToCloudinary(file: File): Promise<string> {
  console.log("استخدام محاكي R2 بدلاً من Cloudinary لرفع الملف:", file.name);
  return uploadToR2(file);
}

// ✅ رفع عدة ملفات (صور أو فيديوهات) → يرجع روابط فقط
export async function uploadMultipleToCloudinary(
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadToR2(file));
  return Promise.all(uploadPromises);
}

// ✅ دالة الحذف
export async function deleteFromCloudinary(fileUrl: string): Promise<void> {
  console.log("استخدام محاكي R2 بدلاً من Cloudinary لحذف الملف:", fileUrl);
  return deleteFromR2(fileUrl);
}
