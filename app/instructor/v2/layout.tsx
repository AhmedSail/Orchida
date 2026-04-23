import { AppSidebarInstructor } from "@/components/instructor/app-sidebar-instructor";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "لوحة المدرب | الإصدار الثاني",
  description: "لوحة المدرب المطور",
};

export default async function Layout({
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

  const currentUser = userRecord[0];

  if (!currentUser || (currentUser.role !== "instructor" && currentUser.role !== "admin")) {
    redirect("/");
  }

  return (
    <SidebarProvider dir="rtl">
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <AppSidebarInstructor user={currentUser} instructorId={currentUser.id} />

        {/* Main content */}
        <main className="flex-1 p-6 relative">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
