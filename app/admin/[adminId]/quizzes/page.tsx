import React from "react";
import { db } from "@/src/db";
import { quizzes, quizQuestions } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import InteractiveQuizManager from "@/components/instructor/quizzes/InteractiveQuizManager";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "المسابقات التفاعلية | لوحة الإدارة",
  description: "عرض وإدارة المسابقات التفاعلية",
};

export default async function Page(props: {
  params: Promise<{ adminId: string }>;
}) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  // Fetch all quizzes (since it's admin) or group by creator
  const allQuizzes = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      coverImage: quizzes.coverImage,
      createdAt: sql<string>`${quizzes.createdAt}`,
      questionCount: sql<number>`CAST(count(${quizQuestions.id}) AS INTEGER)`,
      latestSessionStatus: sql<
        "waiting" | "in_progress" | "finished" | null
      >`(SELECT status FROM "quizSessions" WHERE "quizId" = ${quizzes.id} ORDER BY "createdAt" DESC LIMIT 1)`,
      latestSessionPin: sql<string>`(SELECT pin FROM "quizSessions" WHERE "quizId" = ${quizzes.id} ORDER BY "createdAt" DESC LIMIT 1)`,
    })
    .from(quizzes)
    .leftJoin(quizQuestions, eq(quizzes.id, quizQuestions.quizId))
    .groupBy(quizzes.id)
    .orderBy(sql`${quizzes.createdAt} DESC`);

  return (
    <div className="container mx-auto">
      <InteractiveQuizManager
        instructorId={params.adminId} // Using adminId as the base ID for navigation
        initialQuizzes={allQuizzes}
        isAdmin={true}
      />
    </div>
  );
}
