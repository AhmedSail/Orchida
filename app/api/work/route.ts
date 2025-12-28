// src/app/api/work/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { works } from "@/src/db/schema";
import { NewWork, validateNewWork } from "./_types";

// GET /api/work → list active (not soft-deleted)
export async function GET() {
  try {
    const data = await db.select().from(works);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch works" },
      { status: 500 }
    );
  }
}

// POST /api/work → create new work
// POST /api/work → create new work
