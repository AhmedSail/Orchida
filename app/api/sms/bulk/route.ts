import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { mobiles, text } = await req.json();

    if (!mobiles || !Array.isArray(mobiles) || mobiles.length === 0) {
      return NextResponse.json(
        { message: "قائمة الأرقام مطلوبة" },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { message: "نص الرسالة مطلوب" },
        { status: 400 }
      );
    }

    const results = [];
    for (const mobile of mobiles) {
      try {
        const res = await sendSMS({ mobile, text });
        results.push({
          mobile,
          success: res.success,
          data: res.data,
          error: res.error,
        });
      } catch (err) {
        results.push({ mobile, success: false, error: err });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `تم إرسال ${successCount} رسالة من أصل ${mobiles.length}`,
      results,
    });
  } catch (error: any) {
    console.error("Bulk SMS failed:", error);
    return NextResponse.json(
      { message: "فشل إرسال الرسائل الجماعية", error: error.message },
      { status: 500 }
    );
  }
}
