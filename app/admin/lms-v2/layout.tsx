import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LmsV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userRecord[0] || userRecord[0].role !== "admin") {
    redirect("/");
  }

  return (
    <SidebarProvider dir="rtl">
      <div className="flex w-full min-h-screen bg-zinc-50">
        <AppSidebar user={userRecord[0] as any} />
        <main className="flex-1 p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
