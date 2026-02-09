"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Play,
  LogOut,
  Copy,
  Check,
  Gamepad2,
  Trophy,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

interface Participant {
  id: string;
  nickname: string;
  realName?: string;
  phone?: string;
  score: number;
  totalTime: number;
}

interface Quiz {
  title: string;
  questions: any[];
}

interface Props {
  pin: string;
  instructorId: string;
  initialSession: any;
  quiz: Quiz;
  isAdmin?: boolean;
}

export default function LiveHostGame({
  pin,
  instructorId,
  initialSession,
  quiz,
  isAdmin,
}: Props) {
  const searchParams = useSearchParams();
  const initialState =
    searchParams.get("state") === "final" ? "final" : "lobby";

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [status, setStatus] = useState(initialSession.status); // waiting, in_progress, finished
  const [hostState, setHostState] = useState<"lobby" | "monitoring" | "final">(
    initialSession.status === "finished" ? "final" : initialState,
  );
  // Remove unused state
  const [, setCurrentQuestionIdx] = useState(-1);
  const [, setTimeLeft] = useState(0);
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const basePath = isAdmin
    ? `/admin/${instructorId}`
    : `/instructor/${instructorId}`;

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // 1. Initial participants fetch
    const fetchParticipants = async () => {
      try {
        const res = await fetch(
          `/api/quizzes/sessions/participants?pin=${pin}`,
        );
        if (res.ok) {
          const data = await res.json();
          setParticipants(data);
        }
      } catch (e) {
        console.error("Failed to fetch participants:", e);
      }
    };
    fetchParticipants();

    // 2. Socket.io real-time listening
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    let socket: Socket | null = null;

    try {
      socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("✅ Socket.io connected:", socket?.id);
        // Join the quiz room
        socket?.emit("join-room", `session-${pin}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket.io disconnected");
      });

      socket.on("connect_error", (error) => {
        console.error("Socket.io connection error:", error);
      });

      socket.on("player-joined", (data: Participant) => {
        console.log("👤 Player joined:", data);
        setParticipants((prev) => {
          if (prev.find((p) => p.id === data.id)) return prev;
          return [...prev, data];
        });
        toast(`انضم ${data.nickname} للعبة!`, { icon: "👋" });
      });

      socket.on("answer-submitted", (data: any) => {
        console.log("📝 Answer submitted:", data);
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === data.participantId
              ? {
                  ...p,
                  score: (p.score || 0) + data.pointsEarned,
                  totalTime: (p.totalTime || 0) + (data.responseTime || 0),
                  status: data.status,
                }
              : p,
          ),
        );
      });

      socket.on("game-started", () => {
        console.log("🎮 Game started");
        setHostState("monitoring");
      });

      socket.on("game-finished", () => {
        console.log("🏁 Game finished");
        setHostState("final");
      });
    } catch (error) {
      console.error("Failed to initialize Socket.io:", error);
    }

    return () => {
      try {
        if (socket) {
          socket.emit("leave-room", `session-${pin}`);
          socket.close();
        }
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    };
  }, [pin]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("تم نسخ الرمز");
  };

  const startGame = async () => {
    if (participants.length === 0) {
      toast.error("لا يمكن بدء اللعبة بدون لاعبين");
      return;
    }

    try {
      const res = await fetch(`/api/quizzes/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        toast.error("فشل في بدء اللعبة");
      }
    } catch (e) {
      toast.error("حدث خطأ في الاتصال");
    }
  };

  const finishGame = async () => {
    try {
      await fetch(`/api/quizzes/sessions/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, event: "game-finished" }),
      });
    } catch (e) {}
  };

  if (hostState === "lobby") {
    return (
      <div
        className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col p-6"
        dir="rtl"
      >
        {/* Enhanced Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-lg shadow-slate-200/50 mb-10 border border-white/60"
        >
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Trophy className="size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none">
                {quiz.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-slate-500 font-bold">
                  بانتظار اللاعبين • {participants.length} منضم
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 px-6"
            onClick={() => (window.location.href = `${basePath}/quizzes`)}
          >
            <LogOut className="size-4 ml-2" /> إنهاء الجلسة
          </Button>
        </motion.header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - PIN & Controls */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* PIN Card */}
            <Card className="rounded-[40px] border-none bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-900/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />
              <CardContent className="p-10 text-center relative z-10">
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-4">
                  رمز الانضمام
                </p>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <motion.h1
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-8xl font-black tracking-widest leading-none bg-linear-to-br from-white to-slate-300 bg-clip-text text-transparent"
                  >
                    {pin}
                  </motion.h1>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="size-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
                  >
                    {copied ? (
                      <Check className="size-7 text-emerald-400" />
                    ) : (
                      <Copy className="size-7" />
                    )}
                  </motion.button>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-sm font-bold opacity-90">
                    اذهب إلى:{" "}
                    <span className="text-primary font-black">
                      {process.env.NEXT_PUBLIC_BASE_URL}/play
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-lg"
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <Users className="size-6 text-primary mb-2" />
                  <p className="text-3xl font-black text-slate-900">
                    {participants.length}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">مشارك</p>
                </div>
                <div className="p-4 rounded-2xl bg-linear-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <Gamepad2 className="size-6 text-purple-600 mb-2" />
                  <p className="text-3xl font-black text-slate-900">
                    {quiz.questions.length}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">سؤال</p>
                </div>
              </div>

              <Button
                className="w-full h-16 rounded-[24px] bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-xl font-black shadow-xl shadow-emerald-500/30 transition-all"
                onClick={startGame}
                disabled={participants.length === 0}
              >
                <Play className="size-6 ml-2" /> ابدأ المسابقة
              </Button>

              {participants.length === 0 && (
                <p className="text-xs text-center text-slate-400 font-bold mt-3">
                  في انتظار انضمام اللاعبين...
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Right Panel - Participants Grid */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white/60 shadow-lg"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">المشاركون</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-bold">
                {participants.length} لاعب
              </Badge>
            </div>

            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Users className="size-12 text-slate-300" />
                </div>
                <h4 className="text-xl font-black text-slate-400 mb-2">
                  لا يوجد مشاركون بعد
                </h4>
                <p className="text-sm text-slate-400 max-w-sm">
                  شارك رمز الانضمام{" "}
                  <span className="font-black text-primary">{pin}</span> مع
                  اللاعبين للبدء
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <AnimatePresence>
                  {participants.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 10 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className="relative">
                        <div className="size-20 rounded-[24px] bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
                          {player.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -top-1 -right-1 size-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="font-black text-slate-700 text-sm block">
                          {player.nickname}
                        </span>
                        {player.realName && (
                          <span className="text-[10px] text-slate-400 font-bold block mt-1">
                            {player.realName}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (hostState === "monitoring") {
    // Top players sort
    // Top players sort: Score Desc, then Time Asc
    const sortedPlayers = [...participants].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.totalTime || 0) - (b.totalTime || 0);
    });

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col p-6" dir="rtl">
        <header className="flex justify-between items-center bg-white p-4 rounded-[24px] shadow-sm mb-6">
          <h2 className="text-xl font-black">{quiz.title} - المراقبة الحية</h2>
          <Button variant="destructive" onClick={finishGame}>
            إنهاء المسابقة
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlayers.map((p, idx) => (
            <motion.div
              layout
              key={p.id}
              className={`p-6 rounded-[24px] flex items-center justify-between border-2 ${
                (p as any).status === "eliminated"
                  ? "bg-slate-200 border-slate-300 opacity-60 grayscale"
                  : "bg-white border-emerald-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center font-black">
                  #{idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{p.nickname}</h3>
                  <div className="flex flex-col text-[10px] text-slate-500 font-bold">
                    <span>{p.realName}</span>
                    <span>{p.phone}</span>
                  </div>
                  {(p as any).status === "eliminated" && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold mt-1">
                      تم الاستبعاد
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-2xl font-black text-emerald-500">
                  {p.score}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-lg">
                  <Clock className="size-3" />
                  <span>{((p.totalTime || 0) / 1000).toFixed(1)} ثانية</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8"
      dir="rtl"
    >
      <Trophy className="size-40 text-amber-500 mb-8 animate-bounce" />
      <h1 className="text-6xl font-black mb-12">انتهت المسابقة!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
        {participants
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.totalTime || 0) - (b.totalTime || 0);
          })
          .slice(0, 3)
          .map((p, idx) => (
            <div
              key={p.id}
              className={`p-10 rounded-[40px] text-center flex flex-col items-center gap-4 ${
                idx === 0
                  ? "bg-amber-500 order-1 md:scale-110"
                  : idx === 1
                    ? "bg-slate-400 order-2"
                    : "bg-orange-700 order-3"
              }`}
            >
              <div className="text-sm font-black uppercase tracking-widest opacity-70">
                {idx === 0
                  ? "البطل"
                  : idx === 1
                    ? "المركز الثاني"
                    : "المركز الثالث"}
              </div>
              <div className="size-24 rounded-[32px] bg-white text-slate-900 flex items-center justify-center text-4xl font-black">
                {p.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="text-2xl font-black">{p.nickname}</div>
              <div className="text-sm font-bold opacity-80">
                {p.realName} - {p.phone}
              </div>
              <div className="text-4xl font-black">{p.score} pt</div>
            </div>
          ))}
      </div>

      <Button
        className="h-20 px-12 rounded-3xl bg-primary text-2xl font-black"
        onClick={() => (window.location.href = `${basePath}/quizzes`)}
      >
        العودة للوحة القيادة
      </Button>
    </div>
  );
}
