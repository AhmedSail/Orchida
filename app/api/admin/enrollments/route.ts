import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments, courseSections, courses, users } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const enrollments = await db.query.courseEnrollments.findMany({
      with: {
        section: {
          with: {
            course: {
              columns: {
                title: true,
                id: true,
              }
            }
          }
        }
      },
      orderBy: [desc(courseEnrollments.registeredAt)],
    });

    return NextResponse.json(enrollments);
  } catch (error: any) {
    console.error("Error fetching admin enrollments:", error);
    return NextResponse.json(
      { message: "فشل جلب التسجيلات", error: error.message },
      { status: 500 },
    );
  }
}
