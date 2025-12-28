import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// ✅ تعديل بيانات الشركة
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // تحقق من البيانات الأساسية
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: "الاسم ورقم الهاتف مطلوبان" },
        { status: 400 }
      );
    }

    // نفذ التعديل في قاعدة البيانات
    await db
      .update(companies)
      .set({
        name: body.name,
        phone: body.phone,
        accountNumber: body.accountNumber,
        ibanShekel: body.ibanShekel,
        ibanDinar: body.ibanDinar,
        ibanDollar: body.ibanDollar,
        videoUrl: body.videoUrl,
        managerMessage: body.managerMessage,

        // ✅ روابط السوشيال ميديا
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        twitterUrl: body.twitterUrl,
        whatsappUrl: body.whatsappUrl,
        linkedinUrl: body.linkedinUrl,
        tiktokUrl: body.tiktokUrl,

        updatedAt: new Date(), // ✅ تحديث وقت آخر تعديل
      })
      .where(eq(companies.id, "orchid-company"));

    return NextResponse.json({
      success: true,
      message: "تم تعديل بيانات الشركة بنجاح ✅",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء التعديل" },
      { status: 500 }
    );
  }
}
