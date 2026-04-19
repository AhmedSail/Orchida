import { redirect } from "next/navigation";
import AiProView from "@/src/modules/ai-generator/ui/AiProView";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AiProPage() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    redirect("/sign-in");
  }

  return <AiProView />;
}
