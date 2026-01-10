import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "قائمة الموظفين | لوحة الإدارة",
  description: "عرض جميع الموظفين مع تفاصيلهم وتاريخ الإضافة",
  robots: {
    index: false,
    follow: false,
  },
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

  const role = userRecord[0]?.role;
  return (
    <SidebarProvider dir="rtl">
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <AppSidebar user={userRecord[0]} />

        {/* Main content */}
        <main className="flex-1 p-6">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
