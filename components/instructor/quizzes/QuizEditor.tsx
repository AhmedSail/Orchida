"use client";

import React, { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Timer,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Settings,
  X,
  Type,
  Check,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Link } from "next-view-transitions";

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  text: string;
  type: "mcq" | "true_false" | "short_answer";
  mediaUrl?: string;
  mediaType?: "image" | "video" | null;
  timer: number;
  points: number;
  options: Option[];
}

interface Quiz {
  id?: string;
  title: string;
  description: string;
  coverImage?: string;
  questions: Question[];
}

interface Props {
  instructorId: string;
  initialData?: Quiz;
  isAdmin?: boolean;
}

export default function QuizEditor({
  instructorId,
  initialData,
  isAdmin,
}: Props) {
  const basePath = isAdmin
    ? `/admin/${instructorId}`
    : `/instructor/${instructorId}`;

  const [quiz, setQuiz] = useState<Quiz>(
    initialData || {
      title: "",
      description: "",
      questions: [
        {
          text: "",
          type: "mcq",
          timer: 20,
          points: 1000,
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
  );

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const activeQuestion = quiz.questions[activeQuestionIndex];

  const updateQuiz = (updates: Partial<Quiz>) => {
    setQuiz({ ...quiz, ...updates });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      text: "",
      type: "mcq",
      timer: 20,
      points: 1000,
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    setActiveQuestionIndex(quiz.questions.length);
  };

  const removeQuestion = (index: number) => {
    if (quiz.questions.length === 1) {
      toast.error("يجب أن تحتوي المسابقة على سؤال واحد على الأقل");
      return;
    }
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
    setActiveQuestionIndex(Math.max(0, index - 1));
  };

  const handleSave = async () => {
    if (!quiz.title) {
      toast.error("يرجى إدخال عنوان المسابقة");
      return;
    }

    // Validation
    for (const q of quiz.questions) {
      if (!q.text) {
        toast.error("يرجى إدخال نص السؤال لجميع الأسئلة");
        return;
      }
      if (q.type === "mcq" || q.type === "true_false") {
        if (!q.options.some((o) => o.isCorrect)) {
          toast.error("يرجى تحديد إجابة صحيحة واحدة على الأقل لكل سؤال");
          return;
        }
        if (q.options.some((o) => !o.text)) {
          toast.error("يرجى ملء جميع الخيارات لجميع الأسئلة");
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const url = quiz.id ? `/api/quizzes/${quiz.id}` : "/api/quizzes";
      const method = quiz.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quiz, instructorId }),
      });

      if (res.ok) {
        toast.success("تم حفظ المسابقة بنجاح");
        window.location.href = `${basePath}/quizzes`;
      } else {
        toast.error("فشل في حفظ المسابقة");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden font-sans"
      dir="rtl"
    >
      {/* Top Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-8 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-6">
          <Link href={`${basePath}/quizzes`}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="size-6" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="عنوان المسابقة..."
              className="text-2xl font-black text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-300 w-[300px] md:w-[500px] bg-transparent"
              value={quiz.title}
              onChange={(e) => updateQuiz({ title: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                مسابقة جديدة
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {quiz.questions.length} أسئلة
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 h-12 px-6 font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            onClick={() => {
              /* Quiz Settings Modal */
            }}
          >
            <Settings className="size-4 ml-2" /> إعدادات
          </Button>
          <Button
            className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-12 px-8 font-bold shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (
              <>
                <Save className="size-4 ml-2" /> حفظ المسابقة
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Questions Panel */}
        <aside className="w-80 bg-white border-l flex flex-col shrink-0 z-10">
          <div className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <span className="flex items-center justify-center size-6 bg-slate-200 rounded-lg text-xs">
                  {quiz.questions.length}
                </span>
                الأسئلة
              </h3>
            </div>
            <Button
              className="w-full justify-between bg-white border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 h-12 rounded-xl font-bold shadow-sm transition-all group"
              onClick={addQuestion}
            >
              <span>إضافة سؤال جديد</span>
              <div className="size-6 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Plus className="size-4" />
              </div>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {quiz.questions.map((q, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`relative group p-4 rounded-[20px] border-2 cursor-pointer transition-all duration-200 ${
                    activeQuestionIndex === idx
                      ? "border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100"
                      : "border-slate-100 hover:border-slate-300 bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <span
                      className={`size-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                        activeQuestionIndex === idx
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p
                      className={`text-sm font-bold line-clamp-2 flex-1 pt-0.5 leading-relaxed ${
                        activeQuestionIndex === idx
                          ? "text-indigo-900"
                          : "text-slate-600"
                      }`}
                    >
                      {q.text || "سؤال جديد..."}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 size-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pl-9">
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-6 px-2 rounded-lg bg-white border border-slate-100 shadow-sm font-bold text-slate-500"
                    >
                      <Timer className="size-3 mr-1 text-slate-400" />
                      {q.timer} ث
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-6 px-2 rounded-lg bg-white border border-slate-100 shadow-sm font-bold text-slate-500"
                    >
                      <Type className="size-3 mr-1 text-slate-400" />
                      {q.type === "mcq"
                        ? "اختياري"
                        : q.type === "true_false"
                          ? "صح/خطأ"
                          : "مقالي"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Editor Panel */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

          <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeQuestionIndex}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Toolbar Settings */}
              <div className="flex flex-wrap items-center gap-4 bg-white/90 p-2 pl-4 rounded-[20px] border border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-2 border-l border-slate-100">
                  <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Type className="size-4 text-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      النوع
                    </span>
                    <Select
                      value={activeQuestion.type}
                      onValueChange={(val: any) => {
                        const newOptions =
                          val === "true_false"
                            ? [
                                { text: "صح", isCorrect: true },
                                { text: "خطأ", isCorrect: false },
                              ]
                            : val === "short_answer"
                              ? []
                              : [
                                  { text: "", isCorrect: true },
                                  { text: "", isCorrect: false },
                                  { text: "", isCorrect: false },
                                  { text: "", isCorrect: false },
                                ];

                        updateQuestion(activeQuestionIndex, {
                          type: val,
                          options: newOptions,
                        });
                      }}
                    >
                      <SelectTrigger className="w-32 border-none shadow-none focus:ring-0 font-bold text-slate-700 h-6 p-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl min-w-[180px]">
                        <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                        <SelectItem value="true_false">صح أو خطأ</SelectItem>
                        <SelectItem value="short_answer">
                          إجابة قصيرة
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border-l border-slate-100">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Timer className="size-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      الوقت
                    </span>
                    <Select
                      value={activeQuestion.timer.toString()}
                      onValueChange={(val) =>
                        updateQuestion(activeQuestionIndex, {
                          timer: parseInt(val),
                        })
                      }
                    >
                      <SelectTrigger className="w-24 border-none shadow-none focus:ring-0 font-bold text-slate-700 h-6 p-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {[5, 10, 20, 30, 60, 90, 120].map((t) => (
                          <SelectItem key={t} value={t.toString()}>
                            {t} ثانية
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Trophy className="size-4 text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      النقاط
                    </span>
                    <Select
                      value={activeQuestion.points.toString()}
                      onValueChange={(val) =>
                        updateQuestion(activeQuestionIndex, {
                          points: parseInt(val),
                        })
                      }
                    >
                      <SelectTrigger className="w-24 border-none shadow-none focus:ring-0 font-bold text-slate-700 h-6 p-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {[0, 500, 1000, 2000].map((p) => (
                          <SelectItem key={p} value={p.toString()}>
                            {p} نقطة
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Question Input Card */}
              <Card className="rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardContent className="p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border border-slate-100 px-4 py-1 rounded-full bg-slate-50">
                    نص السؤال
                  </span>
                  <Textarea
                    placeholder="اكتب سؤالك هنا..."
                    className="w-full text-3xl md:text-5xl font-black text-center text-slate-800 border-none resize-none focus:ring-0 placeholder:text-slate-200 bg-transparent leading-relaxed min-h-[120px]"
                    value={activeQuestion.text}
                    onChange={(e) =>
                      updateQuestion(activeQuestionIndex, {
                        text: e.target.value,
                      })
                    }
                    rows={1}
                    onInput={(e: any) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                </CardContent>
              </Card>

              {/* Options Area */}
              {/* Options Area */}
              {activeQuestion.type !== "short_answer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeQuestion.options.map((option, oIdx) => (
                    <motion.div
                      key={oIdx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: oIdx * 0.1 }}
                      className={`relative group p-1 rounded-[28px] transition-all duration-300 ${
                        option.isCorrect
                          ? "bg-linear-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                          : "bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border-2 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div
                        className={`relative h-full bg-white rounded-[26px] p-6 flex items-center gap-5 overflow-hidden ${
                          option.isCorrect ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        {/* Status Indicator Bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-2 ${
                            option.isCorrect
                              ? "bg-emerald-500"
                              : "bg-slate-200 group-hover:bg-slate-300"
                          }`}
                        />

                        <div
                          onClick={() => {
                            // Immutable update logic
                            const newOptions = activeQuestion.options.map(
                              (opt, i) => {
                                // For True/False, always enforce single selection
                                if (activeQuestion.type === "true_false") {
                                  return { ...opt, isCorrect: i === oIdx };
                                }
                                // For MCQ, let's also enforce single selection for better UX consistency
                                // unless we explicitly want multi-select. Standard quizzes are single select.
                                return { ...opt, isCorrect: i === oIdx };

                                // If multi-select is needed for MCQ in future, use this:
                                // if (i === oIdx) return { ...opt, isCorrect: !opt.isCorrect };
                                // return opt;
                              },
                            );

                            updateQuestion(activeQuestionIndex, {
                              options: newOptions,
                            });
                          }}
                          className={`size-14 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all duration-500 ${
                            option.isCorrect
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 rotate-12"
                              : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:scale-110"
                          }`}
                        >
                          <Check className="size-7 font-black" />
                        </div>

                        <div className="flex-1">
                          <Input
                            placeholder={`الخيار ${oIdx + 1}...`}
                            className="border-none bg-transparent shadow-none focus:ring-0 text-xl font-bold p-0 h-auto placeholder:text-slate-300 text-slate-700"
                            value={option.text}
                            onChange={(e) => {
                              // Immutable text update
                              const newOptions = activeQuestion.options.map(
                                (opt, i) =>
                                  i === oIdx
                                    ? { ...opt, text: e.target.value }
                                    : opt,
                              );
                              updateQuestion(activeQuestionIndex, {
                                options: newOptions,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
