// app/api/courses/route.ts
import { db } from "@/src";
import { courses } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET: جلب كل الدورات
export async function GET() {
  try {
    const allCourses = await db.select().from(courses);
    return NextResponse.json(allCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST: إضافة دورة جديدة
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newCourse = await db
      .insert(courses)
      .values({
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newCourse[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

// PUT: تعديل دورة موجودة
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const updatedCourse = await db
      .update(courses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    return NextResponse.json(updatedCourse[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE: حذف دورة
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const deletedCourse = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();

    return NextResponse.json(deletedCourse[0]);
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
