import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { leadStatuses } from "@/src/db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// الحالات الافتراضية لإضافتها إذا كانت القاعدة فارغة
const DEFAULT_STATUSES = [
  { value: "new", label: "جديد", color: "blue", orderIndex: 1 },
  { value: "contacted", label: "تم التواصل", color: "purple", orderIndex: 2 },
  { value: "interested", label: "مهتم", color: "amber", orderIndex: 3 },
  { value: "no_response", label: "لم يرد", color: "red", orderIndex: 4 },
  { value: "high_price", label: "السعر مرتفع", color: "zinc", orderIndex: 5 },
  { value: "wants_online", label: "يريد أونلاين", color: "cyan", orderIndex: 6 },
  { value: "future_course", label: "الدورة القادمة", color: "indigo", orderIndex: 7 },
  { value: "far_location", label: "المكان بعيد", color: "orange", orderIndex: 8 },
  { value: "busy_morning", label: "مشغول فترة صباحية", color: "orange", orderIndex: 9 },
  { value: "busy_evening", label: "مشغول فترة مسائية", color: "indigo", orderIndex: 10 },
  { value: "cancel_reg", label: "يريد إلغاء التسجيل", color: "rose", orderIndex: 11 },
  { value: "focal_course", label: "دورة بؤرية", color: "purple", orderIndex: 12 },
];

export async function GET() {
  try {
    let statuses = await db
      .select()
      .from(leadStatuses)
      .orderBy(asc(leadStatuses.orderIndex));

    // إذا كانت القاعدة فارغة، نضيف الحالات الافتراضية تلقائياً
    if (statuses.length === 0) {
      await db.insert(leadStatuses).values(
        DEFAULT_STATUSES.map((s) => ({ ...s, id: uuidv4() }))
      );
      statuses = await db
        .select()
        .from(leadStatuses)
        .orderBy(asc(leadStatuses.orderIndex));
    }

    return NextResponse.json(statuses, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching lead statuses:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب الحالات", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value, label, color } = body;

    if (!value || !label) {
      return NextResponse.json(
        { message: "يجب إدخال القيمة البرمجية والاسم العربي" },
        { status: 400 }
      );
    }

    // التحقق من عدم التكرار
    const existing = await db
      .select()
      .from(leadStatuses)
      .where(eq(leadStatuses.value, value));

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "هذه الحالة موجودة مسبقاً" },
        { status: 409 }
      );
    }

    // حساب أعلى orderIndex موجود
    const all = await db.select().from(leadStatuses);
    const maxOrder = all.reduce((max, s) => Math.max(max, s.orderIndex), 0);

    const newStatus = await db
      .insert(leadStatuses)
      .values({
        id: uuidv4(),
        value: value.trim().toLowerCase().replace(/\s+/g, "_"),
        label: label.trim(),
        color: color || "gray",
        orderIndex: maxOrder + 1,
      })
      .returning();

    return NextResponse.json(newStatus[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating lead status:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء الحالة", error: error.message },
      { status: 500 }
    );
  }
}
