import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";
import { db } from "@/src";
import { jobs, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Lock, AlertCircle, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-gray-50/50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تسجيل الدخول مطلوب
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من تعبئة نموذج التقديم على
            هذه الوظيفة.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full h-12 text-base rounded-xl">
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(`/jobs/${jobId}/apply`)}`}
              >
                تسجيل الدخول الآن
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-base rounded-xl"
            >
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const jobResults = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  const job = jobResults[0];

  if (!job) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            الوظيفة غير موجودة
          </h2>
          <p className="text-gray-500 mb-6">
            قد تكون الوظيفة قد حذفت أو انتهت صلاحيتها.
          </p>
          <Button asChild variant="outline">
            <Link href="/">تصفح الوظائف الأخرى</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const user = userResults[0];

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 py-10 mb-10 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <Link href="/" className="hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <span>التقديم لوظيفة</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            التقديم على وظيفة: <span className="text-primary">{job.title}</span>
          </h1>
          {job.department && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Briefcase size={18} />
              <span>{job.department}</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <JobApplicationForm
            jobId={jobId}
            userId={session.user.id}
            initialData={{
              name: user?.name,
              email: user?.email,
              phone: user?.phone,
            }}
          />
        </div>
      </div>
    </div>
  );
}
