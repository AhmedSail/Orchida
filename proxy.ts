import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export const config = {
  // تشغيل الميدلوير على كل المسارات ما عدا الملفات الثابتة والـ API
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logoLoading.webp|logo.svg).*)",
  ],
};

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // جلب الجلسة (Session) باستخدام BetterAuth
  const session = await auth.api.getSession({ headers: req.headers });
  const role = session?.user?.role;

  // تعريف المسارات المحمية لكل دور
  const rolePaths: Record<string, string> = {
    admin: "/admin",
    coordinator: "/coordinator",
    attractor: "/attractor",
    content_creator: "/content_creator",
    instructor: "/instructor",
    user: "/dashboardUser",
  };

  const protectedPrefixes = Object.values(rolePaths);
  const isProtectedPath = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // إذا كان المسار محمياً
  if (isProtectedPath) {
    // 1. إذا لم يكن هناك تسجيل دخول -> توجيه لصفحة تسجيل الدخول
    if (!session) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("callbackURL", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 2. التحقق من صلاحية الدور للوصول لهذا المسار
    const userDashboardPrefix = rolePaths[role as string];

    // إذا كان يحاول الدخول لمسار محمي لا يخص دوره (مثلاً يوزر يحاول دخول أدمن)
    if (!userDashboardPrefix || !pathname.startsWith(userDashboardPrefix)) {
      console.log(
        `Unauthorized access attempt: Role [${role}] tried to access [${pathname}]`
      );

      // توجيه لصفحة لوحة التحكم الخاصة به أو للرئيسية
      const fallbackUrl = "/";
      return NextResponse.redirect(new URL(fallbackUrl, req.url));
    }
  }

  // إذا كان المسار عاماً أو الصلاحيات صحيحة
  return NextResponse.next();
}
