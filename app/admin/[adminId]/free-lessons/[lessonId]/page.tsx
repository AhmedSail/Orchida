import React from "react";
import { notFound } from "next/navigation";
import { getFreeLessonByIdAction } from "@/app/actions/free-lessons";
import FreeLessonBuilderClient from "./FreeLessonBuilderClient";

interface Props {
  params: Promise<{ adminId: string; lessonId: string }>;
}

export default async function FreeLessonBuilderPage({ params }: Props) {
  const { adminId, lessonId } = await params;

  const res = await getFreeLessonByIdAction(lessonId);
  if (!res.success || !res.data) notFound();

  return (
    <FreeLessonBuilderClient
      adminId={adminId}
      lessonId={lessonId}
      initialLesson={res.data}
    />
  );
}
