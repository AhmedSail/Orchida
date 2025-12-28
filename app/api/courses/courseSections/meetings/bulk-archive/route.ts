// app/api/courses/courseSections/meetings/archive-past/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { lt, eq } from "drizzle-orm";

export async function PUT(req: Request) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db
    .update(meetings)
    .set({ archived: true })
    .where(lt(meetings.date, today));

  return NextResponse.json({ message: "Archived old meetings" });
}
