import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default function proxy() {
  const res = NextResponse.next();

  // ✅ ضبط CORS
  res.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_BASE_URL ?? ""
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");

  // ✅ ضبط CSP
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'", // أو استخدم nonce لو بدك أمان أعلى
      "script-src 'self' https://apis.google.com 'unsafe-inline'",
      "img-src 'self' https://files.edgestore.dev https://res.cloudinary.com",
      "connect-src 'self' https://orchida-liard.vercel.app",
    ].join("; ")
  );

  return res;
}
