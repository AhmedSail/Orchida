import React from "react";
import { db } from "@/src";
import { jobs, jobApplications } from "@/src/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import JobActions from "@/components/admin/emplyment/JobActions";
import { Plus, Users } from "lucide-react";
import { count, eq } from "drizzle-orm";

const page = async ({ params }: { params: Promise<{ adminId: string }> }) => {
  const { adminId } = await params;

  const allJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      department: jobs.department,
      description: jobs.description,
      isActive: jobs.isActive,
      createdAt: jobs.createdAt,
      applicantsCount: count(jobApplications.id),
    })
    .from(jobs)
    .leftJoin(jobApplications, eq(jobs.id, jobApplications.jobId))
    .groupBy(jobs.id);

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إدارة الوظائف
          </h1>
          <p className="text-gray-500">
            إدارة الوظائف المعلنة والتحكم في حالتها
          </p>
        </div>
        <Link href={`/admin/${adminId}/employment/new`}>
          <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="ml-2 h-4 w-4" />
            إضافة وظيفة جديدة
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allJobs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-gray-400 mb-2">لا يوجد وظائف معلنة حالياً</div>
            <p className="text-sm text-gray-500">قم بإضافة وظيفة جديدة للبدء</p>
          </div>
        )}
        {allJobs.map((job) => (
          <Card
            key={job.id}
            className="group hover:shadow-lg transition-all border-gray-100 bg-white overflow-hidden flex flex-col"
          >
            <div
              className={`h-1 w-full ${job.isActive ? "bg-green-500" : "bg-gray-300"}`}
            />
            <CardHeader className="flex flex-row justify-between items-start gap-4 pb-3">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
                  {job.title}
                </CardTitle>
                <div className="text-sm text-gray-500 mt-1">
                  {job.department || "عام"}
                </div>
              </div>
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  job.isActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {job.isActive ? "نشط" : "غير نشط"}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col grow">
              <p className="text-sm text-gray-600 mb-6 line-clamp-3 min-h-[60px] leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded-md mb-4">
                <Users size={14} />
                <span>{job.applicantsCount} متقدمين</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                <div className="text-xs text-gray-400">
                  {new Date(job.createdAt).toLocaleDateString("ar-EG")}
                </div>
                <JobActions
                  jobId={job.id}
                  adminId={adminId}
                  isActive={job.isActive}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default page;
