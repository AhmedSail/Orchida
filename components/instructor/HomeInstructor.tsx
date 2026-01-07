"use client";
import { Instructor } from "@/app/admin/[adminId]/instructor/page";
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  LayoutDashboard,
  CheckCircle2,
  Timer,
  Info,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Section = {
  sectionId: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  status?: string;
};

type Meeting = {
  meetingId: string;
  meetingDate: Date;
  meetingStartTime: string;
  meetingEndTime: string;
  meetingNotes: string | null;
  sectionId: string | null;
  sectionNumber: number | null;
  courseTitle: string | null;
};

const HomeInstructor = ({
  instructorRecord,
  instructorSections,
  instructorMeetings,
  totalStudents,
  instructorId,
}: {
  instructorRecord: Instructor;
  instructorSections: Section[];
  instructorMeetings: Meeting[];
  totalStudents: number;
  instructorId: string;
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            مفتوحة للتسجيل
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50">
            قيد التنفيذ
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-50">
            مكتملة
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 sm:p-8 space-y-10 bg-[#fafafa]/50 min-h-screen"
    >
      {/* Premium Header */}
      <header className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/90 to-primary p-8 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 opacity-80">
              <LayoutDashboard className="size-5" />
              <span className="text-sm font-medium tracking-wider uppercase font-sans">
                بوابة المدرب
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">
              أهلاً بك، {instructorRecord.name}
            </h1>
            <p className="text-primary-foreground/80 max-w-xl leading-relaxed">
              تخصص {instructorRecord.specialty}. لديك{" "}
              {instructorRecord.experienceYears} سنوات من الخبرة المهنية التي
              تبني بها أجيال اليوم.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-bold uppercase tracking-tighter">
                الحالة المهنية
              </p>
              <p className="text-lg font-black leading-none">مدرب معتمد</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-white/10 blur-3xl opacity-50" />
      </header>

      {/* Instructor Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <BookOpen className="size-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">
                  الشعب التدريبية
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {instructorSections.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href={`/instructor/${instructorId}/students`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:ring-1 hover:ring-emerald-500/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Users className="size-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    إجمالي طلابي
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900">
                      {totalStudents}
                    </p>
                    <span className="text-xs text-slate-400 font-medium tracking-tighter uppercase">
                      طالب تم تدريبه
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
                <Calendar className="size-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">
                  اللقاءات المجدولة
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {instructorMeetings.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sections List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              الدورات والشعب التدريبية
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructorSections.map((section) => (
              <motion.div key={section.sectionId} variants={itemVariants}>
                <Card className="group border-none shadow-sm hover:shadow-md transition-all hover:ring-1 hover:ring-primary/20 bg-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {section.status && getStatusBadge(section.status)}
                        <h4 className="text-lg font-black text-slate-800 group-hover:text-primary transition-colors leading-tight">
                          {section.courseTitle}
                        </h4>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 border-none font-bold"
                      >
                        شعبة #{section.sectionNumber}
                      </Badge>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Timer className="size-3.5 text-primary" />
                        <span>
                          من{" "}
                          {section.startDate
                            ? new Date(section.startDate).toLocaleDateString(
                                "ar-EG"
                              )
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          إلى{" "}
                          {section.endDate
                            ? new Date(section.endDate).toLocaleDateString(
                                "ar-EG"
                              )
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Meetings Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-6 w-1 rounded-full bg-amber-500" />
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              اللقاءات القادمة
            </h3>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              {instructorMeetings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {instructorMeetings.slice(0, 5).map((meeting) => (
                    <div
                      key={meeting.meetingId}
                      className="p-5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center p-2 size-14 rounded-xl bg-slate-100 group-hover:bg-amber-100 transition-colors">
                          <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-amber-600 leading-none">
                            {new Date(meeting.meetingDate).toLocaleDateString(
                              "ar-EG",
                              { month: "short" }
                            )}
                          </span>
                          <span className="text-lg font-black text-slate-700 group-hover:text-amber-700">
                            {new Date(meeting.meetingDate).toLocaleDateString(
                              "en-US",
                              { day: "numeric" }
                            )}
                          </span>
                        </div>
                        <div className="space-y-1 grow">
                          <p className="font-bold text-slate-800 leading-tight">
                            {meeting.courseTitle}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {meeting.meetingStartTime}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>شعبة #{meeting.sectionNumber}</span>
                          </div>
                        </div>
                      </div>
                      {meeting.meetingNotes && (
                        <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700 font-medium border border-amber-100/50 leading-relaxed ring-1 ring-amber-500/10">
                          <Info className="size-3.5 shrink-0 mt-0.5" />
                          <p>{meeting.meetingNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                    <Calendar className="size-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-bold">
                    لا يوجد لقاءات قادمة مجدولة
                  </p>
                </div>
              )}
            </CardContent>
            {instructorMeetings.length > 5 && (
              <div className="p-4 bg-slate-50/50 border-t text-center">
                <button className="text-xs font-black text-primary hover:underline flex items-center gap-1 mx-auto">
                  عرض كافة المواعيد <ChevronLeft className="size-3" />
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeInstructor;
