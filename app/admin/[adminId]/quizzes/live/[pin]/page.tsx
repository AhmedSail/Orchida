import { db } from "@/src/db";
import { quizSessions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import LiveHostGame from "@/components/instructor/quizzes/LiveHostGame";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function LiveQuizPage(props: {
  params: Promise<{ adminId: string; pin: string }>;
}) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch session with relations
  const sessionData = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.pin, params.pin),
    with: {
      quiz: {
        with: {
          questions: {
            with: {
              options: true,
            },
            orderBy: (questions, { asc }) => [asc(questions.order)],
          },
        },
      },
    },
  });

  if (!sessionData || !sessionData.quiz) {
    notFound();
  }

  // Transform data for the component
  const quiz = {
    ...sessionData.quiz,
    questions: sessionData.quiz.questions.map((q) => ({
      ...q,
      options: q.options,
    })),
  };

  return (
    <LiveHostGame
      pin={params.pin}
      instructorId={params.adminId}
      initialSession={sessionData}
      quiz={quiz}
      isAdmin={true}
    />
  );
}
