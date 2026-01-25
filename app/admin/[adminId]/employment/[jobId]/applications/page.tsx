import { auth } from "@/lib/auth";
import { db } from "@/src";
import { jobApplications, jobs } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ApplicationsTableClient from "@/components/admin/emplyment/ApplicationsTableClient";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ adminId: string; jobId: string }>;
}) {
  const { adminId, jobId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch job details
  const jobResult = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  const job = jobResult[0];

  if (!job) {
    return <div>Job not found</div>;
  }

  // Fetch applications
  const applications = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.jobId, jobId))
    .orderBy(desc(jobApplications.createdAt));

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/admin/${adminId}/employment`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            طلبات التقديم: {job.title}
          </h1>
          <p className="text-gray-500 text-sm font-bold">
            إجمالي الطلبات: {applications.length}
          </p>
        </div>
      </div>

      <ApplicationsTableClient applications={applications} />
    </div>
  );
}
