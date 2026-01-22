import JobForm from "@/components/admin/emplyment/JobForm";
import { auth } from "@/lib/auth";
import { db } from "@/src";
import { jobs } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ adminId: string; jobId: string }>;
}) => {
  const { adminId, jobId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const jobResults = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  const job = jobResults[0];

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div>
      <JobForm
        adminId={adminId}
        jobId={jobId}
        initialData={{
          title: job.title,
          department: job.department,
          description: job.description,
          isActive: job.isActive,
        }}
      />
    </div>
  );
};

export default page;
