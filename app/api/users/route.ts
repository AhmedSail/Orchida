import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, account } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "الاسم والإيميل وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    // تحقق إذا الإيميل موجود مسبقاً
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "هذا البريد مسجل مسبقاً" },
        { status: 409 }
      );
    }

    // إنشاء مستخدم جديد
    const userId = uuidv4();
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name,
        email,
        phone,
        emailVerified: true,
      })
      .returning();

    // تشفير كلمة المرور
    // const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء حساب مرتبط بالمستخدم الجديد
    await db.insert(account).values({
      id: uuidv4(),
      accountId: userId, // أو أي معرف داخلي
      providerId: "local", // مزود تسجيل الدخول (محلي)
      userId: userId, // ربط بالحقل users.id
      password: phone,
    });

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "فشل إنشاء الحساب", error: error.message },
      { status: 500 }
    );
  }
}
