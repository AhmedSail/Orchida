import { NextResponse } from "next/server";

export function proxy() {
  const res = NextResponse.next();

  // Content Security Policy
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://files.edgestore.dev; script-src 'self' https://apis.google.com; frame-ancestors 'self';"
  );

  // X-Frame-Options
  res.headers.set("X-Frame-Options", "DENY");

  return res;
}
