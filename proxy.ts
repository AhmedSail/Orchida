import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default function proxy() {
  // اسم الدالة تم تغييره إلى middleware
  const res = NextResponse.next();

  // ✅ ضبط CORS (هذا جيد)
  res.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_BASE_URL ?? ""
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}
