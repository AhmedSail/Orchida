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
import PusherClient from "pusher-js";

interface Participant {
  id: string;
  nickname: string;
  score: number;
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

    // 2. Pusher real-time listening
    const cleanEnv = (val: string | undefined) =>
      val?.replace(/['"]/g, "") || "";

    const pusherKey = cleanEnv(process.env.NEXT_PUBLIC_PUSHER_KEY);
    const pusherCluster = cleanEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER);

    if (!pusherKey || !pusherCluster) {
      return;
    }

    let pusher: PusherClient | null = null;
    let channel: any = null;

    try {
      pusher = new PusherClient(pusherKey, {
        cluster: pusherCluster,
      });

      channel = pusher.subscribe(`session-${pin}`);

      channel.bind("player-joined", (data: Participant) => {
        setParticipants((prev) => {
          if (prev.find((p) => p.id === data.id)) return prev;
          return [...prev, data];
        });
        toast(`انضم ${data.nickname} للعبة!`, { icon: "👋" });
      });

      channel.bind("answer-submitted", (data: any) => {
        // Update participant in list
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === data.participantId
              ? {
                  ...p,
                  score: (p.score || 0) + data.pointsEarned,
                  status: data.status,
                }
              : p,
          ),
        );
      });

      channel.bind("game-started", () => {
        setHostState("monitoring");
      });

      channel.bind("game-finished", () => {
        setHostState("final");
      });
    } catch (error) {
      console.error("Failed to initialize Pusher:", error);
    }

    return () => {
      try {
        if (channel && pusher) {
          pusher.unsubscribe(`session-${pin}`);
        }
        if (pusher) {
          pusher.disconnect();
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
      <div className="min-h-screen bg-slate-100 flex flex-col p-6" dir="rtl">
        <header className="flex justify-between items-center bg-white p-4 rounded-[24px] shadow-sm mb-10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white">
              <Trophy className="size-6" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 leading-none">
                {quiz.title}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                بانتظار اللاعبين...
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="rounded-xl text-red-500"
            onClick={() => (window.location.href = `${basePath}/quizzes`)}
          >
            <LogOut className="size-4 ml-2" /> إنهاء الجلسة
          </Button>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[40px] border-none bg-slate-900 text-white border-b-8 border-black">
              <CardContent className="p-10 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm mb-4">
                  رمز الانضمام
                </p>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <h1 className="text-7xl font-black tracking-widest leading-none">
                    {pin}
                  </h1>
                  <button
                    onClick={handleCopy}
                    className="size-12 rounded-2xl bg-white/10 flex items-center justify-center"
                  >
                    {copied ? (
                      <Check className="size-6 text-emerald-400" />
                    ) : (
                      <Copy className="size-6" />
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm font-bold opacity-70 italic">
                    اذهب إلى:{" "}
                    <span className="text-primary">
                      {process.env.NEXT_PUBLIC_BASE_URL}/play
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-white rounded-[32px] border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <span className="font-black">
                    اللاعبين: {participants.length}
                  </span>
                </div>
              </div>
              <Button
                className="w-full h-16 rounded-[24px] bg-emerald-500 text-xl font-black shadow-xl shadow-emerald-500/20"
                onClick={startGame}
                disabled={participants.length === 0}
              >
                <Play className="size-6 ml-2" /> ابدأ المسابقة
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border-2 border-dashed border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {participants.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="size-16 rounded-[24px] bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                    {player.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {player.nickname}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hostState === "monitoring") {
    // Top players sort
    const sortedPlayers = [...participants].sort((a, b) => b.score - a.score);

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
                  {(p as any).status === "eliminated" && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold">
                      تم الاستبعاد
                    </span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-500">
                {p.score}
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
          .sort((a, b) => b.score - a.score)
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
