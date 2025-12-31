import { NextResponse } from "next/server";

export const config = {
  matcher: "/api/:path*",
};

export default function proxy() {
  const res = NextResponse.next();
  res.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_BASE_URL ?? ""
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
  return res;
}
