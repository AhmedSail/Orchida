import { auth } from "@/lib/auth";
import { db } from "@/src";
import { jobApplications, jobs } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, Phone, Mail, User } from "lucide-react";
import ApplicationActions from "@/components/admin/emplyment/ApplicationActions";

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
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/admin/${adminId}/employment`}>
          <Button variant="ghost" size="icon">
            <ArrowRight size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            طلبات التقديم: {job.title}
          </h1>
          <p className="text-gray-500 text-sm">
            عدد الطلبات: {applications.length}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المتقدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المتقدم</TableHead>
                <TableHead className="text-right">معلومات الاتصال</TableHead>
                <TableHead className="text-right">المؤهل / التخصص</TableHead>
                <TableHead className="text-right">الخبرة</TableHead>
                <TableHead className="text-right">تاريخ التقديم</TableHead>
                <TableHead className="text-center">السيرة الذاتية</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    لا يوجد طلبات تقديم حتى الآن
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          <User size={14} className="text-gray-400" />{" "}
                          {app.applicantName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {app.applicantAge ? `${app.applicantAge} سنة` : "-"} |{" "}
                          {app.applicantGender === "male"
                            ? "ذكر"
                            : app.applicantGender === "female"
                              ? "أنثى"
                              : "-"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {app.applicantLocation}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <a
                          href={`mailto:${app.applicantEmail}`}
                          className="text-sm flex items-center gap-2 hover:text-primary"
                        >
                          <Mail size={14} className="text-gray-400" />{" "}
                          {app.applicantEmail}
                        </a>
                        <a
                          href={`tel:${app.applicantPhone}`}
                          className="text-sm flex items-center gap-2 hover:text-primary"
                        >
                          <Phone size={14} className="text-gray-400" />{" "}
                          {app.applicantPhone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {app.applicantEducation}
                        </span>
                        <span className="text-xs text-gray-500">
                          {app.applicantMajor}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.applicantExperienceYears
                        ? `${app.applicantExperienceYears} سنوات`
                        : "لا يوجد"}
                    </TableCell>
                    <TableCell>
                      {new Date(app.createdAt).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-center">
                      {app.applicantCV ? (
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={app.applicantCV}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText size={16} className="ml-2" />
                            عرض CV
                          </a>
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <ApplicationActions applicationId={app.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
