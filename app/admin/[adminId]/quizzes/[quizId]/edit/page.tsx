import React from "react";
import QuizEditor from "@/components/instructor/quizzes/QuizEditor";
import { db } from "@/src/db";
import { quizzes } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

export const metadata = {
  title: "تعديل المسابقة | لوحة الإدارة",
  description: "تعديل أسئلة وإعدادات المسابقة",
};

export default async function Page(props: {
  params: Promise<{ adminId: string; quizId: string }>;
}) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  // Fetch full quiz data
  const quizData = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, params.quizId),
    with: {
      questions: {
        with: {
          options: true,
        },
      },
    },
  });

  if (!quizData) {
    notFound();
  }

  return (
    <QuizEditor
      instructorId={params.adminId}
      initialData={quizData as any}
      isAdmin={true}
    />
  );
}
