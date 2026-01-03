import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ ضبط CORS
  res.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_BASE_URL ?? ""
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");

  // ✅ ضبط الكوكيز بالصيغة الصحيحة
  res.cookies.set("session-token", "your-session-value", {
    path: "/", // متاح لكل المسارات
    httpOnly: true, // يمنع الوصول من الـ JS
    secure: true, // لازم HTTPS
    sameSite: "none", // يسمح بالـ cross-site (مطلوب للجوال)
    maxAge: 60 * 60 * 24, // يوم واحد (تقدر تغيره)
    domain: process.env.NEXT_PUBLIC_BASE_URL ?? "", // ✅ مهم: يربط الكوكيز بالدومين الحقيقي
  });

  return res;
}
