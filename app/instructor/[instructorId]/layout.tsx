import { AppSidebarInstructor } from "@/components/instructor/app-sidebar-instructor";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "لوحة المدرب",
  description: "لوحة المدرب",
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ instructorId: string }>;
}) {
  const { instructorId } = await params;
  console.log("Layout Extracted instructorId:", instructorId);
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

  if (!currentUser) {
    redirect("/sign-in");
  }

  const isAdmin = currentUser.role === "admin";
  const isOwner = currentUser.id === instructorId;

  // Access Control: Allow only Admin or the Instructor themselves
  if (!isAdmin && !isOwner) {
    console.log(
      "Access Denied. User Role:",
      currentUser.role,
      "isOwner:",
      isOwner,
    );
    redirect("/"); // Redirect unauthorized users to home
  }

  return (
    <SidebarProvider dir="rtl">
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <AppSidebarInstructor user={currentUser} instructorId={instructorId} />

        {/* Main content */}
        <main className="flex-1 p-6 relative">
          <SidebarTrigger />
          {isAdmin && !isOwner && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <span className="font-bold">⚠️ وضع المشرف:</span>
              <span>
                أنت تشاهد لوحة التحكم الخاصة بالمدرب (وضع للقراءة والإدارة)
              </span>
            </div>
          )}
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
