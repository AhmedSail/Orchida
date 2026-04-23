import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courses, leadStatuses } from "@/src/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allCourses = await db.query.courses.findMany({
      columns: {
        id: true,
        title: true,
      }
    });
    const allStatuses = await db.query.leadStatuses.findMany({
      columns: {
        value: true,
        label: true,
        color: true,
      },
      orderBy: [asc(leadStatuses.orderIndex)],
    });

    return NextResponse.json({
      courses: allCourses,
      statuses: allStatuses,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}
