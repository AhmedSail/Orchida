import { redirect } from "next/navigation";
import AiGeneratorView from "@/src/modules/ai-generator/ui/AiGeneratorView";
import { auth } from "@/lib/auth"; // Using the better-auth from lib
import { headers } from "next/headers";

// Add the emails or IDs of the allowed students here
const ALLOWED_STUDENT_EMAILS = ["sdew2sdew0592855602@gmail.com"];

export default async function AiGeneratorPage() {
  // Try to get the session from better-auth
  // Based on better-auth standard setup
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.session) {
    // If not logged in
    redirect("/sign-in");
  }

  // Check if they are authorized
  const userEmail = sessionData.user?.email || "";
  if (!ALLOWED_STUDENT_EMAILS.includes(userEmail)) {
    // Or you can check by role, or add a column to database
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            عذراً، غير مصرح لك
          </h2>
          <p className="text-zinc-400">
            هذه الأداة مخصصة لطلاب محددين فقط. يرجى التواصل مع الإدارة إذا كنت
            تعتقد أنه يجب أن يكون لديك وصول.
          </p>
        </div>
      </div>
    );
  }

  return <AiGeneratorView />;
}
