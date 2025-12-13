import { AppSidebarAttractor } from "@/components/attractor/app-sidebar-attractor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
export const metadata = {
  title: "لوحة مستقطب المشاريع",
  description: "لوحة مستقطب المشاريع",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider dir="rtl">
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <AppSidebarAttractor />

        {/* Main content */}
        <main className="flex-1 p-6">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
