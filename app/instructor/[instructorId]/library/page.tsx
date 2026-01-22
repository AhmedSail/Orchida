import InstructorMediaLibraryContent from "@/components/instructor/InstructorMediaLibraryContent";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { instructorId } = await params;

  return (
    <div className="container mx-auto p-8 h-full">
      <InstructorMediaLibraryContent className="h-[calc(100vh-100px)]" />
    </div>
  );
}
