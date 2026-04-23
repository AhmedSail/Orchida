import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseApplications, users, account } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const applications = await db.query.courseApplications.findMany({
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            major: true,
            location: true,
            age: true,
          }
        },
        course: {
          columns: {
            title: true,
            imageUrl: true,
            id: true,
          }
        },
        status: {
          columns: {
            label: true,
            color: true,
          }
        },
      },
      orderBy: (apps, { desc }) => [desc(apps.createdAt)],
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { message: "فشل جلب الطلبات", error: error.message },
      { status: 500 },
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
        { status: 400 },
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
          message: "لديك حساب بالفعل في النظام. يرجى تسجيل الدخول لتتمكن من تقديم الطلب.",
          code: "REQUIRE_LOGIN",
        },
        { status: 403 },
      );
    }

    let userId = session?.user?.id || existingUser[0]?.id;

    if (!userId) {
      // 2. إنشاء مستخدم جديد بدور "guest" إذا لم يكن موجوداً
      userId = uuidv4();
      const hashedPassword = await bcrypt.hash(body.studentPhone, 10);

      await db.insert(users).values({
        id: userId,
        name: body.studentName,
        email: body.studentEmail,
        phone: body.studentPhone,
        whatsapp: body.whatsapp || null,
        age: body.studentAge || null,
        major: body.studentMajor || null,
        location: body.studentCountry || null,
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
    } else {
      // 3. تحديث بيانات المستخدم الحالي بالمعلومات الجديدة
      await db.update(users).set({
        phone: body.studentPhone || undefined,
        whatsapp: body.whatsapp || undefined,
        age: body.studentAge || undefined,
        major: body.studentMajor || undefined,
        location: body.studentCountry || undefined,
      }).where(eq(users.id, userId));
    }

    // 4. منع تكرار الطلب لنفس الطالب في نفس الدورة
    const existingApp = await db
      .select()
      .from(courseApplications)
      .where(
        and(
          eq(courseApplications.userId, userId),
          eq(courseApplications.courseId, body.courseId),
        ),
      )
      .limit(1);

    if (existingApp[0]) {
      return NextResponse.json(
        {
          message: "لقد قمت بتقديم طلب لهذه الدورة مسبقاً. طلبك قيد المراجعة.",
          code: "ALREADY_REGISTERED",
        },
        { status: 409 },
      );
    }

    // 5. إنشاء طلب الالتحاق في الطابور
    const application = {
      id: uuidv4(),
      userId: userId,
      courseId: body.courseId,
      statusValue: "new",
      attendanceType: body.attendanceType || "in_person",
      studentNotes: body.notes || null,
    };

    await db.insert(courseApplications).values(application);

    return NextResponse.json(
      {
        message: "تم تقديم طلبك بنجاح! سيقوم فريقنا بمراجعة الطلب وتوجيهك للشعبة المناسبة قريباً.",
        application,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating course application:", error);
    return NextResponse.json(
      { message: "فشل إرسال الطلب", error: error.message },
      { status: 500 },
    );
  }
}
