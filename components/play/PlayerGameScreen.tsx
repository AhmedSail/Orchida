"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Timer as TimerIcon,
  Gamepad2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  User,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PusherClient from "pusher-js";
import { toast } from "sonner";

interface Props {
  pin: string;
  participantId: string;
}

export default function PlayerGameScreen({ pin, participantId }: Props) {
  const [gameState, setGameState] = useState<
    | "waiting"
    | "question"
    | "result"
    | "leaderboard"
    | "finished"
    | "eliminated"
  >("waiting");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [nickname, setNickname] = useState("");
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(0);

  // New fetcher for survival mode
  const fetchMyQuestion = async () => {
    try {
      const res = await fetch(
        `/api/quizzes/sessions/player/current-question?pin=${pin}&participantId=${participantId}`,
      );
      const data = await res.json();

      if (data.status === "eliminated") {
        setGameState("eliminated");
      } else if (data.status === "finished") {
        setGameState("finished");
      } else if (data.status === "active") {
        setCurrentQuestion(data.question);
        setGameState("question");
        setHasAnswered(false);
        // Refresh rank/score
        fetchParticipantData();
      } else if (data.status === "waiting_host") {
        setGameState("waiting");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to get score and rank
  const fetchParticipantData = async () => {
    try {
      // We need all participants to calculate rank? Or the API can give it.
      // Let's just fetch all participants and find my index.
      const res = await fetch(`/api/quizzes/sessions/participants?pin=${pin}`);
      if (res.ok) {
        const participants: any[] = await res.json();
        const sorted = participants.sort((a, b) => b.score - a.score);
        const myIndex = sorted.findIndex((p) => p.id === participantId);
        const me = sorted[myIndex];

        if (me) {
          setScore(me.score);
          setNickname(me.nickname);
          setRank(myIndex + 1);
        }
      }
    } catch (e) {
      console.error("Failed to fetch participant data", e);
    }
  };

  useEffect(() => {
    // 0. Initial Sync
    fetchMyQuestion();
    fetchParticipantData();

    // 1. Pusher real-time listening
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`session-${pin}`);

    channel.bind("game-started", () => {
      fetchMyQuestion();
    });

    channel.bind("game-finished", () => {
      setGameState("finished");
    });

    return () => {
      pusher.unsubscribe(`session-${pin}`);
      pusher.disconnect();
    };
  }, [pin, participantId]);

  const handleAnswer = async (optionId: string) => {
    if (hasAnswered || gameState !== "question") return;
    setHasAnswered(true);
    try {
      const res = await fetch("/api/quizzes/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          participantId,
          questionId: currentQuestion.id,
          optionId,
          responseTime: 0,
        }),
      });

      const data = await res.json();

      if (data.status === "eliminated") {
        setTimeout(() => setGameState("eliminated"), 1000);
      } else if (data.status === "correct") {
        setTimeout(() => {
          fetchMyQuestion();
        }, 1000);
      } else {
        toast.error("حدث خطأ ما");
      }
    } catch (e) {
      toast.error("فشل في إرسال الإجابة");
    }
  };

  const [finalRank, setFinalRank] = useState<{
    rank: number;
    score: number;
    nickname: string;
    realName?: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    if (gameState === "finished") {
      const fetchFinalRank = async () => {
        try {
          const res = await fetch(
            `/api/quizzes/sessions/participants?pin=${pin}`,
          );
          if (res.ok) {
            const participants: any[] = await res.json();
            // Sort by score descending
            const sorted = participants.sort((a, b) => b.score - a.score);
            const myRankIdx = sorted.findIndex((p) => p.id === participantId);
            if (myRankIdx !== -1) {
              setFinalRank({
                rank: myRankIdx + 1,
                score: sorted[myRankIdx].score,
                nickname: sorted[myRankIdx].nickname,
                realName: sorted[myRankIdx].realName,
                phone: sorted[myRankIdx].phone,
              });
            }
          }
        } catch (e) {
          console.error("Failed to fetch final rank", e);
        }
      };
      fetchFinalRank();
    }
  }, [gameState, pin, participantId]);

  if (gameState === "waiting") {
    return (
      <div
        className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white text-center"
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-8"
        >
          <div className="size-32 bg-white/20 rounded-[40px] flex items-center justify-center mx-auto backdrop-blur-xl border border-white/30 animate-pulse">
            <User className="size-16 text-white" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-widest">
            {nickname || "أنت مشارك!"}
          </h1>
          <p className="text-xl font-bold opacity-80">
            أنت جاهز، بانتظار السؤال الأول...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-black bg-black/20 py-2 px-6 rounded-full w-fit mx-auto">
            <Clock className="size-4" />
            انتظر المضيف
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === "question") {
    return (
      <div className="min-h-screen bg-slate-900 p-4 flex flex-col" dir="rtl">
        <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="size-5 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                اللاعب{" "}
                {rank > 0 && (
                  <span className="text-emerald-400 text-xs">#{rank}</span>
                )}
              </p>
              <p className="font-bold text-white text-sm">{nickname}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                النقاط
              </p>
              <p className="font-black text-amber-500 text-lg">{score}</p>
            </div>
            <div className="size-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Star className="size-5 text-amber-500" />
            </div>
          </div>
        </div>

        {hasAnswered ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="size-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
              <CheckCircle2 className="size-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white italic">
              تم الإرسال!
            </h2>
            <p className="text-slate-400 font-bold max-w-xs mx-auto">
              الإجابة مسجلة، انتظر النتيجة...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 text-center mb-4 min-h-[160px] flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white leading-relaxed">
                {currentQuestion?.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-1">
              {currentQuestion?.options?.map((option: any, idx: number) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className="relative h-full min-h-[80px] rounded-[24px] bg-white/10 hover:bg-white/20 active:scale-95 border-2 border-white/10 hover:border-primary/50 text-white text-xl font-bold transition-all flex items-center justify-between px-8 group"
                >
                  <span>{option.text}</span>
                  <div className="size-8 rounded-full bg-white/10 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-sm font-black transition-colors">
                    {idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Eliminated State
  if (gameState === "eliminated") {
    return (
      <div
        className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-6 text-white text-center"
        dir="rtl"
      >
        <XCircle className="size-24 text-white/50 mb-6" />
        <h1 className="text-5xl font-black mb-4">لقد خسرت!</h1>
        <p className="text-xl opacity-80">
          في وضع البقاء، خطأ واحد يعني الخروج.
        </p>
        <Button
          className="mt-8 bg-white text-red-900 hover:bg-red-50"
          onClick={() => (window.location.href = "/play")}
        >
          خروج
        </Button>
      </div>
    );
  }

  // Finished State
  if (gameState === "finished") {
    return (
      <div
        className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center"
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6 w-full max-w-sm"
        >
          <Zap className="size-20 text-amber-500 mx-auto animate-bounce" />
          <h2 className="text-4xl font-black italic">انتهت اللعبة!</h2>

          {finalRank ? (
            <div className="bg-white/10 rounded-[32px] p-8 border border-white/10 space-y-6 backdrop-blur-md">
              <div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">
                  مركزك النهائي
                </p>
                <div className="text-6xl font-black text-amber-500">
                  #{finalRank.rank}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">
                    النقاط
                  </p>
                  <p className="text-2xl font-black">{finalRank.score}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">
                    اسمك
                  </p>
                  <p className="text-xl font-bold">{finalRank.nickname}</p>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {finalRank.realName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {finalRank.phone}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="size-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          )}

          <Button
            variant="ghost"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => (window.location.href = "/play")}
          >
            خروج
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center"
      dir="rtl"
    >
      <div className="size-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
    </div>
  );
}
