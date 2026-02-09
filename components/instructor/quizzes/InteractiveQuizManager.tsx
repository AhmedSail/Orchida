"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Play,
  Search,
  Timer,
  LayoutGrid,
  MoreVertical,
  CheckCircle2,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  questionCount: number;
  createdAt: string;
  latestSessionStatus?:
    | "waiting"
    | "in_progress"
    | "finished"
    | "active"
    | null;
  latestSessionPin?: string | null;
}

interface Props {
  instructorId: string;
  initialQuizzes: Quiz[];
  isAdmin?: boolean;
}

export default function InteractiveQuizManager({
  instructorId,
  initialQuizzes,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const basePath = isAdmin
    ? `/admin/${instructorId}`
    : `/instructor/${instructorId}`;

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (quizId: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف المسابقة وجميع الأسئلة المرتبطة بها!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
        if (res.ok) {
          setQuizzes(quizzes.filter((q) => q.id !== quizId));
          toast.success("تم حذف المسابقة بنجاح");
        } else {
          toast.error("فشل في حذف المسابقة");
        }
      } catch (error) {
        toast.error("حدث خطأ ما");
      }
    }
  };

  const handleStartSession = async (quizId: string) => {
    try {
      const { value: timeLimit, isDismissed } = await Swal.fire({
        title: "وقت المسابقة (دقائق)",
        text: "حدد الوقت المتاح لكل متسابق لإنهاء المسابقة بالكامل",
        input: "number",
        inputValue: 10,
        inputPlaceholder: "أدخل الوقت بالدقائق",
        showCancelButton: true,
        confirmButtonText: "بدء الجلسة",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#10b981",
      });

      if (isDismissed) return;

      setLoading(true);
      const res = await fetch("/api/quizzes/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          timeLimit: timeLimit ? parseInt(timeLimit) : 0,
        }),
      });

      if (res.ok) {
        const session = await res.json();
        const targetUrl = `${basePath}/quizzes/live/${session.pin}`;
        console.log("📍 Redirecting to:", targetUrl);
        console.log("📦 Session data:", session);

        toast.success("تم إنشاء الجلسة! جاري التوجيه...");

        // Try multiple methods to ensure redirect happens
        try {
          window.location.replace(targetUrl);
        } catch (e) {
          console.error("Replace failed, trying href:", e);
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 100);
        }

        // Fallback using router if window.location fails
        setTimeout(() => {
          router.push(targetUrl);
        }, 500);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(`فشل في بدء المسابقة: ${err.error || ""}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("حدث خطأ ما");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <span className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                <Gamepad2 className="size-8" />
              </span>
              المسابقات التفاعلية
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed">
              إدارة جميع المسابقات الخاصة بك، إنشاء تحديات جديدة، ومتابعة
              النتائج المباشرة.
            </p>
          </div>
          <Link href={`${basePath}/quizzes/new`}>
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 gap-3 group">
              <Plus className="size-6 group-hover:rotate-90 transition-transform duration-500" />
              إنشاء مسابقة جديدة
            </Button>
          </Link>
        </div>

        {/* Stats & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-4 rounded-[32px] shadow-sm border border-slate-100">
          <div className="md:col-span-3 bg-indigo-50 rounded-[24px] p-6 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-purple-500" />
            <div className="relative z-10">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2 block">
                إجمالي المسابقات
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {quizzes.length}
                </span>
                <span className="text-slate-400 font-bold">مسابقة</span>
              </div>
            </div>
            <Trophy className="absolute -bottom-4 -left-4 size-24 text-indigo-100 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="md:col-span-9 flex items-center bg-slate-50 rounded-[24px] px-6 border border-slate-100 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300">
            <Search className="size-6 text-slate-400 ml-4" />
            <input
              type="text"
              placeholder="ابحث عن اسم المسابقة..."
              className="w-full h-24 bg-transparent border-none focus:ring-0 text-xl font-bold text-slate-700 placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[34px] opacity-0 group-hover:opacity-100 blur transition duration-500" />

                <Card className="relative h-full flex flex-col rounded-[32px] border-slate-100 overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500">
                  {/* Card Image Area */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent z-10" />

                    {quiz.coverImage ? (
                      <img
                        src={quiz.coverImage}
                        alt={quiz.title}
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-linear-to-br from-indigo-600 to-violet-600 group-hover:scale-110 transition-transform duration-700">
                        <Gamepad2 className="size-20 text-white/20 rotate-12" />
                      </div>
                    )}

                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-none px-3 py-1.5 rounded-xl font-bold">
                        {quiz.questionCount} سؤال
                      </Badge>
                      {quiz.latestSessionStatus && (
                        <Badge
                          className={`border-none px-3 py-1.5 rounded-xl font-bold backdrop-blur-md ${
                            quiz.latestSessionStatus === "active" ||
                            quiz.latestSessionStatus === "in_progress"
                              ? "bg-emerald-500/80 text-white animate-pulse"
                              : "bg-slate-900/50 text-white"
                          }`}
                        >
                          {quiz.latestSessionStatus === "active" ||
                          quiz.latestSessionStatus === "in_progress"
                            ? "مباشر الآن"
                            : "منتهية"}
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-4 right-4 left-4 z-20">
                      <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-white/80 text-sm mt-1 line-clamp-1 font-medium">
                          {quiz.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6">
                    {/* Action Area */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-slate-400 font-bold px-1">
                        <span className="flex items-center gap-1">
                          <Timer className="size-4" />
                          تم الإنشاء:{" "}
                          {new Date(quiz.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                      <Button
                        onClick={() => {
                          if (quiz.latestSessionStatus === "finished") {
                            router.push(
                              `${basePath}/quizzes/live/${quiz.latestSessionPin}?state=final`,
                            );
                          } else if (
                            quiz.latestSessionStatus === "active" ||
                            quiz.latestSessionStatus === "waiting" ||
                            quiz.latestSessionStatus === "in_progress"
                          ) {
                            // Assuming active/waiting/in_progress all mean joinable/viewable
                            router.push(
                              `${basePath}/quizzes/live/${quiz.latestSessionPin}`,
                            );
                          } else {
                            handleStartSession(quiz.id);
                          }
                        }}
                        disabled={loading}
                        className={`flex-1 h-12 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-105 active:scale-95 ${
                          quiz.latestSessionStatus === "active" ||
                          quiz.latestSessionStatus === "in_progress" ||
                          quiz.latestSessionStatus === "waiting"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                            : quiz.latestSessionStatus === "finished"
                              ? "bg-slate-800 hover:bg-slate-900 text-white shadow-slate-900/20"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                        }`}
                      >
                        {quiz.latestSessionStatus === "active" ||
                        quiz.latestSessionStatus === "waiting" ||
                        quiz.latestSessionStatus === "in_progress" ? (
                          <>
                            {" "}
                            <Timer className="size-5 ml-2" /> متابعة الجلسة{" "}
                          </>
                        ) : quiz.latestSessionStatus === "finished" ? (
                          <>
                            {" "}
                            <Trophy className="size-5 ml-2" /> النتائج{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <Play className="size-5 ml-2" /> ابدأ الآن{" "}
                          </>
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="size-12 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-[20px] p-2 w-48 shadow-xl border-slate-100"
                        >
                          <DropdownMenuItem
                            asChild
                            className="rounded-xl p-3 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 font-bold text-slate-600"
                          >
                            <Link
                              href={`${basePath}/quizzes/${quiz.id}/edit`}
                              className="flex items-center gap-3"
                            >
                              <Edit className="size-4" /> تعديل المسابقة
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(quiz.id)}
                            className="rounded-xl p-3 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-700 font-bold flex items-center gap-3 mt-1"
                          >
                            <Trash2 className="size-4" /> حذف المسابقة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredQuizzes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-[40px] border-2 border-dashed border-slate-200"
            >
              <div className="size-24 rounded-3xl bg-slate-50 flex items-center justify-center rotate-3 transform shadow-sm">
                <Search className="size-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  لا توجد مسابقات مطابقة
                </h3>
                <p className="text-slate-400 font-medium">
                  جرب البحث بكلمات مختلفة أو ابدأ بإنشاء مسابقة جديدة
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="rounded-xl border-slate-200 text-slate-500 font-bold"
              >
                مسح البحث
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
