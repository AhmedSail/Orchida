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
    <div className="space-y-8 p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Trophy className="size-8 text-amber-500" />
            المسابقات التفاعلية
          </h1>
          <p className="text-slate-500 mt-1">
            أنشئ وادر مسابقاتك الخاصة لزيادة تفاعل الطلاب
          </p>
        </div>
        <Link href={`${basePath}/quizzes/new`}>
          <Button className="rounded-2xl h-12 px-6 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="size-5" />
            إنشاء مسابقة جديدة
          </Button>
        </Link>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-[24px] border-slate-200 shadow-sm bg-blue-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shrink-0">
              <Gamepad2 className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">
                مجموع المسابقات
              </p>
              <h3 className="text-2xl font-black text-slate-900">
                {quizzes.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              placeholder="ابحث عن مسابقة..."
              className="pr-12 h-14 rounded-2xl border-slate-200 bg-white focus:ring-primary shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-[32px] border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="relative h-44 bg-slate-100">
                  {quiz.coverImage ? (
                    <img
                      src={quiz.coverImage}
                      alt={quiz.title}
                      className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600">
                      <Trophy className="size-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm rounded-xl py-1 px-3">
                      {quiz.questionCount} أسئلة
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {quiz.description || "لا يوجد وصف لهذه المسابقة"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl shrink-0"
                        >
                          <MoreVertical className="size-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-40"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`${basePath}/quizzes/${quiz.id}/edit`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="size-4" /> تعديل المسابقة
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(quiz.id)}
                          className="flex items-center gap-2 text-red-600 focus:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="size-4" /> حذف المسابقة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Button
                      onClick={() => {
                        if (quiz.latestSessionStatus === "finished") {
                          // Go to results page directly
                          router.push(
                            `${basePath}/quizzes/live/${quiz.latestSessionPin}?state=final`,
                          );
                        } else if (
                          quiz.latestSessionStatus === "active" ||
                          quiz.latestSessionStatus === "waiting"
                        ) {
                          router.push(
                            `${basePath}/quizzes/live/${quiz.latestSessionPin}`,
                          );
                        } else {
                          handleStartSession(quiz.id);
                        }
                      }}
                      disabled={loading}
                      className={`flex-1 rounded-2xl h-11 text-white font-bold gap-2 shadow-sm ${
                        quiz.latestSessionStatus === "finished"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : quiz.latestSessionStatus === "waiting" ||
                              quiz.latestSessionStatus === "in_progress"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      {quiz.latestSessionStatus === "finished" ? (
                        <>
                          <Trophy className="size-4" /> عرض النتائج
                        </>
                      ) : quiz.latestSessionStatus === "waiting" ||
                        quiz.latestSessionStatus === "in_progress" ? (
                        <>
                          <Timer className="size-4" /> متابعة المسابقة
                        </>
                      ) : (
                        <>
                          <Play className="size-4" /> بدء المسابقة الآن
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredQuizzes.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Gamepad2 className="size-10 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">لا توجد مسابقات حالياً</p>
            <Link href={`${basePath}/quizzes/new`}>
              <Button variant="outline" className="rounded-xl border-slate-300">
                أنشئ مسابقتك الأولى
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
