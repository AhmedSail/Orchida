import React from "react";
import { db } from "@/src/db";
import { courses, courseSections, interactiveLinks } from "@/src/db/schema";
import { eq, inArray, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Users,
  GraduationCap,
  Link as LinkIcon,
} from "lucide-react";

export const metadata = {
  title: "الروابط التفاعلية | لوحة المدرب",
  description: "عرض الروابط التفاعلية الخاصة بالدورات",
};

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "instructor") {
    redirect("/sign-in");
  }

  // Fetch courses taught by this instructor
  const taughtSections = await db
    .select({ courseId: courseSections.courseId })
    .from(courseSections)
    .where(eq(courseSections.instructorId, session.user.id));

  const taughtCourseIds = Array.from(
    new Set(taughtSections.map((s) => s.courseId)),
  );

  if (taughtCourseIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <LinkIcon className="size-12 mb-4 opacity-20" />
        <p>لا توجد دورات مسندة إليك حالياً</p>
      </div>
    );
  }

  // Fetch interactive links for these courses
  const links = await db
    .select({
      id: interactiveLinks.id,
      title: interactiveLinks.title,
      description: interactiveLinks.description,
      url: interactiveLinks.url,
      target: interactiveLinks.target,
      courseTitle: courses.title,
    })
    .from(interactiveLinks)
    .innerJoin(courses, eq(interactiveLinks.courseId, courses.id))
    .where(inArray(interactiveLinks.courseId, taughtCourseIds))
    .orderBy(interactiveLinks.createdAt);

  const instructorLinks = links.filter(
    (l) => l.target === "instructor" || l.target === "both",
  );
  const studentLinks = links.filter((l) => l.target === "student");

  return (
    <div className="space-y-8 p-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الروابط التفاعلية</h1>
        <p className="text-slate-500">
          الروابط والموارد التفاعلية المخصصة لدوراتك التدريبية
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instructor Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">
              روابط خاصة بالمدرب
            </h2>
          </div>
          {instructorLinks.length > 0 ? (
            instructorLinks.map((link) => (
              <InteractiveLinkCard
                key={link.id}
                link={link}
                type="instructor"
              />
            ))
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
              لا توجد روابط مخصصة للمدرب
            </div>
          )}
        </section>

        {/* Student Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="size-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">
              روابط خاصة بالطلاب
            </h2>
          </div>
          {studentLinks.length > 0 ? (
            studentLinks.map((link) => (
              <InteractiveLinkCard key={link.id} link={link} type="student" />
            ))
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
              لا توجد روابط مخصصة للطلاب
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InteractiveLinkCard({
  link,
  type,
}: {
  link: any;
  type: "instructor" | "student";
}) {
  return (
    <Card className="rounded-[24px] border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1 text-right">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-900">{link.title}</h3>
            <Badge variant="secondary" className="text-[10px] rounded-lg">
              {link.courseTitle}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2">
            {link.description}
          </p>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`shrink-0 size-10 flex items-center justify-center rounded-xl transition-colors ${
            type === "instructor"
              ? "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
          }`}
        >
          <ExternalLink className="size-5" />
        </a>
      </CardContent>
    </Card>
  );
}
