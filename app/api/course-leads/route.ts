import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseLeads, users, account } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const leads = await db.query.courseLeads.findMany({
      with: {
        course: true,
        section: true,
      },
      orderBy: (leads, { desc }) => [desc(leads.createdAt)],
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error("Error fetching course leads:", error);
    return NextResponse.json(
      { message: "فشل جلب الطلبات", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { headers: authHeaders } = await import("next/headers");
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: await authHeaders() });

    const body = await req.json();

    if (!body.studentEmail || !body.studentPhone || !body.studentName) {
      return NextResponse.json(
        { message: "الاسم، البريد الإلكتروني، ورقم الهاتف مطلوبة" },
        { status: 400 }
      );
    }

    // 1. التأكد من وجود المستخدم مسبقاً
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.studentEmail))
      .limit(1);

    // إذا لم يكن هناك سيشن، وكان المستخدم موجوداً برول غير زائر، نطلب منه تسجيل الدخول
    if (!session?.user && existingUser[0] && existingUser[0].role !== "guest") {
      return NextResponse.json(
        {
          message:
            "لديك حساب بالفعل في النظام. يرجى تسجيل الدخول بحسابك لتتمكن من التسجيل في الدورة.",
          code: "REQUIRE_LOGIN",
        },
        { status: 403 }
      );
    }

    // 2. منع التكرار لنفس الطالب في نفس الشعبة
    const existingLead = await db
      .select()
      .from(courseLeads)
      .where(
        and(
          eq(courseLeads.studentEmail, body.studentEmail),
          eq(courseLeads.sectionId, body.sectionId)
        )
      )
      .limit(1);

    if (existingLead[0]) {
      return NextResponse.json(
        {
          message: "لقد قمت بالتسجيل مسبقاً في هذه الشعبة. سنتواصل معك قريباً.",
          code: "ALREADY_REGISTERED",
        },
        { status: 409 }
      );
    }

    let userId = session?.user?.id || existingUser[0]?.id;

    if (!userId) {
      // 3. إنشاء مستخدم جديد بدور "guest" إذا لم يكن موجوداً ولم يكن هناك سيشن
      userId = uuidv4();
      const hashedPassword = await bcrypt.hash(body.studentPhone, 10);

      await db.insert(users).values({
        id: userId,
        name: body.studentName,
        email: body.studentEmail,
        phone: body.studentPhone,
        role: "guest",
        emailVerified: true,
      });

      await db.insert(account).values({
        id: uuidv4(),
        accountId: body.studentEmail,
        providerId: "credential",
        userId: userId,
        password: hashedPassword,
      });
    }

    // 4. إنشاء طلب التسجيل (Lead)
    const lead = {
      id: uuidv4(),
      courseId: body.courseId,
      sectionId: body.sectionId,
      studentId: userId, // ✅ إضافة معرف المستخدم
      studentName: body.studentName,
      studentPhone: body.studentPhone,
      studentEmail: body.studentEmail,
      studentAge: body.studentAge || null,
      studentMajor: body.studentMajor || null,
      studentCountry: body.studentCountry || null,
      status: "new",
      notes: body.notes || null,
    };

    await db.insert(courseLeads).values(lead);

    const successMessage = session?.user
      ? "تم تسجيل اهتمامك بنجاح! سنتواصل معك قريباً لتأكيد الحجز."
      : "تم تسجيل اهتمامك بنجاح! تم إنشاء حساب زائر لك (إذا لم يكن لديك واحد)، يمكنك استخدامه بكلمة مرور هي رقم هاتفك.";

    return NextResponse.json(
      {
        message: successMessage,
        lead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating course lead:", error);
    return NextResponse.json(
      { message: "فشل إرسال الطلب", error: error.message },
      { status: 500 }
    );
  }
}
