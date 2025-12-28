import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { studentWorks } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ➕ إضافة عمل جديد
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 👇 افترض أنك تستخدم next-auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const newWork = {
      id: crypto.randomUUID(),
      studentId: formData.get("studentId") as string,
      courseId: formData.get("courseId") as string,
      sectionId: formData.get("sectionId") as string,
      type: formData.get("type") as "story" | "image" | "video",
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      mediaUrl: formData.get("mediaUrl") as string | null,
      status: "approved" as "approved" | "pending", // أو approved/rejected حسب اللوجيك
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id as string, // 👈 لازم يكون موجود في جدول users
    };

    await db.insert(studentWorks).values(newWork);

    return NextResponse.json({ success: true, work: newWork });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to add work" },
      { status: 500 }
    );
  }
}
