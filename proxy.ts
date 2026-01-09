import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // ✅ جلب الـ session من BetterAuth
  const session = await auth.api.getSession({ headers: req.headers });

  const role = session?.user?.role;
  const rolePaths: Record<string, string> = {
    admin: "/admin",
    coordinator: "/coordinator",
    attractor: "/attractor",
    content_creator: "/content_creator",
    instructor: "/instructor",
    user: "/dashboardUser",
  };

  // ✅ تحقق فقط إذا كان المسار محمي
  const protectedPrefixes = Object.values(rolePaths);
  const isProtectedPath = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedPath) {
    const requiredPrefix = rolePaths[role || "user"];
    if (!requiredPrefix || !pathname.startsWith(requiredPrefix)) {
      console.log(`Unauthorized: Role ${role} trying to access ${pathname}`);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ✅ لو المسار عام أو الدور صحيح → كمل
  return res;
}
