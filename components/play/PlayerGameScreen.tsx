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
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

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
        setQuestionStartTime(Date.now());
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
        const sorted = participants.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.totalTime || 0) - (b.totalTime || 0);
        });
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

    // 1. Socket.io real-time listening
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
        console.log("✅ Player Socket.io connected:", socket?.id);
        // Join the quiz room
        socket?.emit("join-room", `session-${pin}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ Player Socket.io disconnected");
      });

      socket.on("game-started", () => {
        console.log("🎮 Player: Game started");
        fetchMyQuestion();
      });

      socket.on("game-finished", () => {
        console.log("🏁 Player: Game finished");
        setGameState("finished");
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
  }, [pin, participantId]);

  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (gameState === "question" && currentQuestion?.timer) {
      setTotalTime(currentQuestion.timer);
      // Reset timer based on when we received the question
      // Ideally, server sends "startTime", but for now we rely on client receive time
      // or we can just start countdown from full duration for simplicity in client-side sync
      // Better: set timeLeft to duration and decrement.
      setTimeLeft(currentQuestion.timer);

      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1; // Decrement by 1 second
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [currentQuestion, gameState]);

  const handleAnswer = async (optionId: string) => {
    if (hasAnswered || gameState !== "question" || timeLeft <= 0) return;
    setHasAnswered(true);
    try {
      const responseTime = Date.now() - questionStartTime;

      const res = await fetch("/api/quizzes/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          participantId,
          questionId: currentQuestion.id,
          optionId,
          responseTime,
        }),
      });

      const data = await res.json();

      if (data.status === "eliminated") {
        setTimeout(() => setGameState("eliminated"), 1000);
      } else {
        // Handle correct/wrong/submitted states
        if (data.status === "correct") {
          toast.success("إجابة صحيحة! 🎉");
        } else if (data.status === "wrong") {
          toast.error("إجابة خاطئة 😔");
        } else {
          toast.success("تم تسجيل الإجابة");
        }

        // Fetch next question immediately
        fetchMyQuestion();
      }
    } catch (e) {
      toast.error("فشل في إرسال الإجابة");
    }
  };

  // ... (rest of imports and setup)

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
            // Sort by score descending, then time ascending
            const sorted = participants.sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return (a.totalTime || 0) - (b.totalTime || 0);
            });
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

  // Background Decor Component
  const BackgroundDecor = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-20 -left-20 size-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 right-0 size-80 bg-secondary/50 rounded-full blur-[100px]" />
      <div className="absolute -bottom-20 -right-20 size-96 bg-primary/10 rounded-full blur-[100px]" />
    </div>
  );

  if (gameState === "waiting") {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground text-center relative overflow-hidden"
        dir="rtl"
      >
        <BackgroundDecor />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-8 z-10"
        >
          <div className="size-32 bg-secondary rounded-[40px] flex items-center justify-center mx-auto border border-border animate-pulse shadow-lg">
            <User className="size-16 text-primary" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-widest text-foreground">
            {nickname || "أنت مشارك!"}
          </h1>
          <p className="text-xl font-bold text-muted-foreground">
            أنت جاهز، بانتظار السؤال الأول...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-black bg-secondary/50 py-2 px-6 rounded-full w-fit mx-auto text-primary">
            <Clock className="size-4" />
            انتظر الادمين
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === "question") {
    const progressPercentage = (timeLeft / totalTime) * 100;
    const isTimeCritical = timeLeft < 5;

    return (
      <div
        className="min-h-screen bg-background p-4 flex flex-col relative overflow-hidden"
        dir="rtl"
      >
        <BackgroundDecor />
        {/* Header with Timer */}
        <div className="flex justify-between items-stretch mb-6 gap-3 z-10">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm relative overflow-hidden">
              {/* Progress Bar Background */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                <motion.div
                  className={`h-full ${isTimeCritical ? "bg-red-500" : "bg-primary"}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="size-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-sm truncate max-w-[100px]">
                    {nickname}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">
                    النقاط: <span className="text-primary">{score}</span>
                  </p>
                </div>
              </div>

              {/* Timer Display */}
              <div
                className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl border ${isTimeCritical ? "bg-red-500/10 border-red-500/50" : "bg-secondary/50 border-input"}`}
              >
                <div className="flex items-center gap-2">
                  <Clock
                    className={`size-4 ${isTimeCritical ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-2xl font-black tabular-nums leading-none ${isTimeCritical ? "text-red-500" : "text-foreground"}`}
                  >
                    {timeLeft}
                  </span>
                </div>
                <span className="text-[8px] uppercase font-bold text-muted-foreground">
                  ثانية
                </span>
              </div>
            </div>
          </div>
        </div>

        {hasAnswered ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 z-10">
            <div className="size-24 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
              <CheckCircle2 className="size-12 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-black text-foreground italic">
              تم الإرسال!
            </h2>
            <p className="text-muted-foreground font-bold max-w-xs mx-auto">
              الإجابة مسجلة، انتظر النتيجة...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 z-10">
            <div className="p-8 bg-card rounded-[32px] border border-border shadow-md text-center mb-4 min-h-[160px] flex items-center justify-center relative overflow-hidden">
              {/* Timeout Overlay */}
              {timeLeft === 0 && (
                <div className="absolute inset-0 bg-red-500/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                  <Clock className="size-16 text-white mb-4" />
                  <h2 className="text-3xl font-black text-white">
                    انتهى الوقت!
                  </h2>
                </div>
              )}

              <h2 className="text-2xl font-bold text-foreground leading-relaxed relative z-10">
                {currentQuestion?.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-1">
              {currentQuestion?.options?.map((option: any, idx: number) => (
                <button
                  key={option.id}
                  disabled={timeLeft === 0}
                  onClick={() => handleAnswer(option.id)}
                  className={`relative h-full min-h-[80px] rounded-[24px] border-2 text-xl font-bold transition-all flex items-center justify-between px-8 group ${
                    timeLeft === 0
                      ? "bg-secondary border-transparent opacity-50 cursor-not-allowed text-muted-foreground"
                      : "bg-card hover:bg-secondary/50 active:scale-95 border-transparent hover:border-primary/50 text-foreground shadow-sm"
                  }`}
                >
                  <span>{option.text}</span>
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                      timeLeft === 0
                        ? "bg-secondary text-muted-foreground"
                        : "bg-secondary group-hover:bg-primary group-hover:text-primary-foreground text-foreground"
                    }`}
                  >
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
        className="min-h-screen bg-destructive flex flex-col items-center justify-center p-6 text-destructive-foreground text-center relative overflow-hidden"
        dir="rtl"
      >
        <BackgroundDecor />
        <div className="z-10 flex flex-col items-center">
          <XCircle className="size-24 text-white/50 mb-6" />
          <h1 className="text-5xl font-black mb-4">لقد خسرت!</h1>
          <p className="text-xl opacity-80">
            في وضع البقاء، خطأ واحد يعني الخروج.
          </p>
          <Button
            className="mt-8 bg-background text-foreground hover:bg-background/90"
            onClick={() => (window.location.href = "/play")}
          >
            خروج
          </Button>
        </div>
      </div>
    );
  }

  // Finished State
  if (gameState === "finished") {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground text-center relative overflow-hidden"
        dir="rtl"
      >
        <BackgroundDecor />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6 w-full max-w-sm z-10"
        >
          <Zap className="size-20 text-primary mx-auto animate-bounce" />
          <h2 className="text-4xl font-black italic">انتهت اللعبة!</h2>

          {finalRank ? (
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-xl space-y-6 backdrop-blur-md">
              <div>
                <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
                  مركزك النهائي
                </p>
                <div className="text-6xl font-black text-primary">
                  #{finalRank.rank}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs font-bold uppercase mb-1">
                    النقاط
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {finalRank.score}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-muted-foreground text-xs font-bold uppercase mb-1">
                    اسمك
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {finalRank.nickname}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    {finalRank.realName}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    {finalRank.phone}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          )}

          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl"
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
      className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground text-center"
      dir="rtl"
    >
      <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
    </div>
  );
}
