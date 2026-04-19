import { redirect } from "next/navigation";
import AiLandingView from "@/src/modules/ai-generator/ui/components/AiLandingView";
import { auth } from "@/lib/auth"; // Using the better-auth from lib
import { headers } from "next/headers";

export default async function AiGeneratorPage() {
  // Try to get the session from better-auth
  // Based on better-auth standard setup
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen text-zinc-900 font-sans selection:bg-purple-200 pb-20 relative">
      <AiLandingView />
    </div>
  );
}
