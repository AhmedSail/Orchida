import JobForm from "@/components/admin/emplyment/JobForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: Promise<{ adminId: string }> }) => {
  const { adminId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div>
      <JobForm adminId={adminId} />
    </div>
  );
};

export default page;
