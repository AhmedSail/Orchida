import { redirect } from "next/navigation";
import FreeTrialView from "@/src/modules/ai-generator/ui/components/FreeTrialView";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function AiFreePage() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-8 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <Link href="/ai" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span className="font-semibold">العودة للرئيسية</span>
        </Link>
      </div>
      <FreeTrialView />
    </div>
  );
}
