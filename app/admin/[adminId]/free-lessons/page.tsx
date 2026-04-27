import React from "react";
import {
  getFreeLessonsAction,
  getFreeLessonCategoriesAction,
} from "@/app/actions/free-lessons";
import AdminFreeLessonsClient from "./AdminFreeLessonsClient";

interface Props {
  params: Promise<{ adminId: string }>;
}

export default async function AdminFreeLessonsPage({ params }: Props) {
  const { adminId } = await params;

  const [lr, cr] = await Promise.all([
    getFreeLessonsAction(),
    getFreeLessonCategoriesAction(),
  ]);

  const lessons = (lr.success && lr.data ? lr.data : []) as any[];
  const categories = (cr.success && cr.data ? cr.data : []) as any[];

  return (
    <AdminFreeLessonsClient
      adminId={adminId}
      initialLessons={lessons}
      initialCategories={categories}
    />
  );
}
