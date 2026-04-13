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

  return <AiGeneratorView />;
}
