"use client";

import React, { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
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
      className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden"
      dir="rtl"
    >
      {/* Top Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/quizzes`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight className="size-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="عنوان المسابقة..."
              className="text-lg font-black text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-300 w-[200px] md:w-[400px]"
              value={quiz.title}
              onChange={(e) => updateQuiz({ title: e.target.value })}
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              إعدادات المسابقة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => {
              /* Quiz Settings Modal */
            }}
          >
            <Settings className="size-4 ml-2" /> إعدادات
          </Button>
          <Button
            className="rounded-xl bg-primary hover:bg-primary/90 min-w-[120px]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              "جاري الحفظ..."
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
        <aside className="w-64 bg-white border-l flex flex-col shrink-0 overflow-y-auto overflow-x-hidden p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 text-sm italic">
              الأسئلة ({quiz.questions.length})
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={addQuestion}
            >
              <Plus className="size-5 text-primary" />
            </Button>
          </div>

          <div className="space-y-3">
            {quiz.questions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`relative group p-3 rounded-[18px] border-2 cursor-pointer transition-all ${
                  activeQuestionIndex === idx
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="size-6 rounded-lg bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-600 line-clamp-2 flex-1 pt-1 leading-relaxed">
                    {q.text || "سؤال جديد..."}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuestion(idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md transition-all"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="text-[8px] py-0 px-1 rounded-md bg-white border-slate-100"
                  >
                    {q.timer} ث
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[8px] py-0 px-1 rounded-md bg-white border-slate-100"
                  >
                    {q.type === "mcq"
                      ? "اختياري"
                      : q.type === "true_false"
                        ? "صح/خطأ"
                        : "مقالي"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-6 border-dashed border-2 py-8 rounded-[24px] text-slate-400 hover:text-primary hover:border-primary transition-all flex flex-col gap-2"
            onClick={addQuestion}
          >
            <Plus className="size-6" />
            <span className="font-bold text-xs">إضافة سؤال</span>
          </Button>
        </aside>

        {/* Main Editor Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Question Type & Settings Row */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3 border-l ml-2">
                <Type className="size-5 text-slate-400" />
                <Select
                  value={activeQuestion.type}
                  onValueChange={(val: any) => {
                    // Reset options if type changes
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
                  <SelectTrigger className="w-40 border-none shadow-none focus:ring-0 font-bold text-slate-700 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                    <SelectItem value="true_false">صح أو خطأ</SelectItem>
                    <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 px-3 border-l ml-2">
                <Timer className="size-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-500">الوقت:</span>
                <Select
                  value={activeQuestion.timer.toString()}
                  onValueChange={(val) =>
                    updateQuestion(activeQuestionIndex, {
                      timer: parseInt(val),
                    })
                  }
                >
                  <SelectTrigger className="w-24 border-none shadow-none focus:ring-0 font-bold text-slate-700 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[5, 10, 20, 30, 60, 90, 120].map((t) => (
                      <SelectItem key={t} value={t.toString()}>
                        {t} ث
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 px-3">
                <Trophy className="size-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-500">
                  النقاط:
                </span>
                <Select
                  value={activeQuestion.points.toString()}
                  onValueChange={(val) =>
                    updateQuestion(activeQuestionIndex, {
                      points: parseInt(val),
                    })
                  }
                >
                  <SelectTrigger className="w-32 border-none shadow-none focus:ring-0 font-bold text-slate-700 h-10">
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

            {/* Question Input Card */}
            <Card className="rounded-[40px] border-slate-200 overflow-hidden shadow-sm shadow-slate-100 bg-white border-2 border-b-8">
              <CardContent className="p-8">
                <textarea
                  placeholder="اكتب سؤالك هنا..."
                  rows={2}
                  className="w-full text-2xl md:text-3xl font-black text-center text-slate-900 border-none resize-none focus:ring-0 placeholder:text-slate-200 bg-transparent leading-relaxed h-auto overflow-hidden"
                  value={activeQuestion.text}
                  onChange={(e) =>
                    updateQuestion(activeQuestionIndex, {
                      text: e.target.value,
                    })
                  }
                />

                {/* Media Upload Area */}
                <div className="mt-8">
                  {activeQuestion.mediaUrl ? (
                    <div className="relative aspect-video max-w-lg mx-auto rounded-[32px] overflow-hidden border-2 border-slate-100 ring-8 ring-slate-50 shadow-inner group">
                      <img
                        src={activeQuestion.mediaUrl}
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          className="rounded-full size-12 p-0"
                          onClick={() =>
                            updateQuestion(activeQuestionIndex, {
                              mediaUrl: undefined,
                              mediaType: null,
                            })
                          }
                        >
                          <X className="size-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-21/9 max-w-xl mx-auto rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 hover:border-primary/20 hover:bg-primary/5 transition-all text-slate-300 cursor-pointer group">
                      <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                        <Plus className="size-8 text-slate-200 group-hover:text-primary" />
                      </div>
                      <p className="font-bold text-sm text-slate-400 group-hover:text-primary">
                        أضف صورة أو فيديو
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Options Area */}
            {activeQuestion.type !== "short_answer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeQuestion.options.map((option, oIdx) => (
                  <div
                    key={oIdx}
                    className={`relative p-5 rounded-[32px] flex items-center gap-4 transition-all duration-300 border-2 border-b-8 ${
                      option.isCorrect
                        ? "bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-500/10"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      onClick={() => {
                        const newOptions = [...activeQuestion.options];
                        if (activeQuestion.type === "mcq") {
                          // Toggle and ensure others correct/incorrect logic depends on requirement
                          // Kahoot allows multiple but single is common
                          newOptions.forEach(
                            (o, i) => (o.isCorrect = i === oIdx),
                          );
                        } else {
                          newOptions[oIdx].isCorrect =
                            !newOptions[oIdx].isCorrect;
                        }
                        updateQuestion(activeQuestionIndex, {
                          options: newOptions,
                        });
                      }}
                      className={`size-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                        option.isCorrect
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 rotate-12 scale-110"
                          : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      <Check className="size-6 font-black" />
                    </div>

                    <Input
                      placeholder={`الخيار ${oIdx + 1}...`}
                      className="border-none bg-transparent shadow-none focus:ring-0 text-lg font-bold p-0 h-auto placeholder:text-slate-200"
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...activeQuestion.options];
                        newOptions[oIdx].text = e.target.value;
                        updateQuestion(activeQuestionIndex, {
                          options: newOptions,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
