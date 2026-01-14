// This file is deprecated - using direct Cloudflare API upload instead
// See /api/upload/r2/route.ts for the main upload endpoint

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/upload/r2 instead." },
    { status: 410 }
  );
}
