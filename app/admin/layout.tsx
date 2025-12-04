import { AppSidebar } from "../../components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider dir="rtl">
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <main className="flex-1 p-6">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
