"use server";

import { db } from "@/src/db";
import { freeLessons, freeLessonFields, freeLessonCategories } from "@/src/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ==========================================
// Category Actions
// ==========================================

export async function getFreeLessonCategoriesAction() {
  try {
    const cats = await db.query.freeLessonCategories.findMany({
      orderBy: [asc(freeLessonCategories.order)],
    });
    return { success: true, data: cats };
  } catch (error) {
    console.error("Error in getFreeLessonCategoriesAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function createFreeLessonCategoryAction(data: {
  title: string;
  imageUrl?: string;
  order?: number;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    let finalOrder = data.order;
    if (finalOrder === undefined) {
      const last = await db
        .select({ maxOrder: sql<number>`max(${freeLessonCategories.order})` })
        .from(freeLessonCategories);
      finalOrder = (last[0]?.maxOrder || 0) + 1;
    }

    const cat = await db
      .insert(freeLessonCategories)
      .values({ title: data.title, imageUrl: data.imageUrl, order: finalOrder })
      .returning();

    revalidatePath("/admin/free-lessons");
    return { success: true, data: cat[0] };
  } catch (error) {
    console.error("Error in createFreeLessonCategoryAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateFreeLessonCategoryAction(
  categoryId: string,
  data: { title?: string; imageUrl?: string; order?: number }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(freeLessonCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(freeLessonCategories.id, categoryId));

    revalidatePath("/admin/free-lessons");
    return { success: true };
  } catch (error) {
    console.error("Error in updateFreeLessonCategoryAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function deleteFreeLessonCategoryAction(categoryId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .delete(freeLessonCategories)
      .where(eq(freeLessonCategories.id, categoryId));

    revalidatePath("/admin/free-lessons");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFreeLessonCategoryAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * جلب كل الدروس المجانية
 */
export async function getFreeLessonsAction() {
  try {
    const lessons = await db.query.freeLessons.findMany({
      orderBy: [asc(freeLessons.order)],
      with: {
        fields: { orderBy: [asc(freeLessonFields.order)] },
        category: true,
      },
    });
    return { success: true, data: lessons };
  } catch (error) {
    console.error("Error in getFreeLessonsAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * جلب درس مجاني واحد بالـ ID
 */
export async function getFreeLessonByIdAction(lessonId: string) {
  try {
    const lesson = await db.query.freeLessons.findFirst({
      where: eq(freeLessons.id, lessonId),
      with: {
        fields: { orderBy: [asc(freeLessonFields.order)] },
        category: true,
      },
    });
    if (!lesson) return { success: false, error: "Not Found" };
    return { success: true, data: lesson };
  } catch (error) {
    console.error("Error in getFreeLessonByIdAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * إضافة درس مجاني جديد
 */
export async function createFreeLessonAction(data: {
  mainTitle: string;
  subTitle?: string;
  description?: string;
  categoryId?: string;
  order?: number;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    let finalOrder = data.order;
    if (finalOrder === undefined) {
      const lastLesson = await db
        .select({ maxOrder: sql<number>`max(${freeLessons.order})` })
        .from(freeLessons);
      finalOrder = (lastLesson[0]?.maxOrder || 0) + 1;
    }

    const newLesson = await db
      .insert(freeLessons)
      .values({
        mainTitle: data.mainTitle,
        subTitle: data.subTitle,
        description: data.description,
        categoryId: data.categoryId || null,
        order: finalOrder,
      })
      .returning();

    revalidatePath("/admin/free-lessons");
    return { success: true, data: newLesson[0] };
  } catch (error) {
    console.error("Error in createFreeLessonAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * تحديث درس مجاني
 */
export async function updateFreeLessonAction(
  lessonId: string,
  data: { mainTitle?: string; subTitle?: string; description?: string; order?: number; isActive?: boolean; categoryId?: string | null }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(freeLessons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(freeLessons.id, lessonId));

    revalidatePath("/admin/free-lessons");
    return { success: true };
  } catch (error) {
    console.error("Error in updateFreeLessonAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * حذف درس مجاني
 */
export async function deleteFreeLessonAction(lessonId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(freeLessons).where(eq(freeLessons.id, lessonId));

    revalidatePath("/admin/free-lessons");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFreeLessonAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * إضافة حقل محتوى للدرس المجاني
 */
export async function addFreeLessonFieldAction(data: {
  lessonId: string;
  fieldType: string;
  content: string;
  order?: number;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    let finalOrder = data.order;
    if (finalOrder === undefined) {
      const lastField = await db
        .select({ maxOrder: sql<number>`max(${freeLessonFields.order})` })
        .from(freeLessonFields)
        .where(eq(freeLessonFields.lessonId, data.lessonId));
      finalOrder = (lastField[0]?.maxOrder || 0) + 1;
    }

    const newField = await db
      .insert(freeLessonFields)
      .values({
        lessonId: data.lessonId,
        fieldType: data.fieldType,
        content: data.content,
        order: finalOrder,
      })
      .returning();

    return { success: true, data: newField[0] };
  } catch (error) {
    console.error("Error in addFreeLessonFieldAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * تحديث حقل محتوى
 */
export async function updateFreeLessonFieldAction(
  fieldId: string,
  data: { content?: string; fieldType?: string; order?: number }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(freeLessonFields)
      .set(data)
      .where(eq(freeLessonFields.id, fieldId));

    return { success: true };
  } catch (error) {
    console.error("Error in updateFreeLessonFieldAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * حذف حقل محتوى
 */
export async function deleteFreeLessonFieldAction(fieldId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(freeLessonFields).where(eq(freeLessonFields.id, fieldId));

    return { success: true };
  } catch (error) {
    console.error("Error in deleteFreeLessonFieldAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

/**
 * ترتيب الحقول
 */
export async function reorderFreeLessonFieldsAction(fields: { id: string; order: number }[]) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    for (const field of fields) {
      await db
        .update(freeLessonFields)
        .set({ order: field.order })
        .where(eq(freeLessonFields.id, field.id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error in reorderFreeLessonFieldsAction:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
