import React from "react";
import QuizEditor from "@/components/instructor/quizzes/QuizEditor";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "إنشاء مسابقة جديدة | لوحة الإدارة",
  description: "أنشئ مسابقة تفاعلية جديدة للطلاب",
};

export default async function Page(props: {
  params: Promise<{ adminId: string }>;
}) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  return <QuizEditor instructorId={params.adminId} isAdmin={true} />;
}
