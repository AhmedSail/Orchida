"use client";

import React, { useState } from "react";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function JoinQuizPage() {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState(1); // 1: PIN, 2: Nickname
  const [loading, setLoading] = useState(false);

  const handleCheckPin = async () => {
    if (pin.length < 6) {
      toast.error("يرجى إدخال رمز صحيح مكون من 6 أرقام");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/sessions/check?pin=${pin}`);
      if (res.ok) {
        setStep(2);
      } else {
        toast.error("عذراً، هذا الرمز غير صحيح أو المسابقة مغلقة");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!nickname) {
      toast.error("يرجى إدخال اسمك المستعار");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quizzes/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, nickname }),
      });

      if (res.ok) {
        const { participantId } = await res.json();
        // Redirect to game room
        window.location.href = `/play/${pin}/${participantId}`;
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل في الانضمام");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 size-80 bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 size-80 bg-purple-500/30 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="size-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 rotate-12 mb-6">
            <Gamepad2 className="size-12 text-primary -rotate-12" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase italic">
            Orchida Quiz
          </h1>
          <p className="text-slate-400 mt-2 font-bold italic">
            أدخل الرمز وابدأ التحدي!
          </p>
        </div>

        <Card className="rounded-[40px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-slate-800/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden border-b-8 border-slate-900">
          <CardContent className="p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <Input
                  type="text"
                  placeholder="رمز المسابقة (PIN)"
                  className="h-20 text-center text-4xl font-black tracking-[0.3em] rounded-3xl bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-primary focus:border-primary transition-all uppercase"
                  maxLength={6}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleCheckPin()}
                />
                <Button
                  className="w-full h-16 rounded-3xl text-xl font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleCheckPin}
                  disabled={loading}
                >
                  {loading ? "جاري التحقق..." : "دخول"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="size-5" />
                  </Button>
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    خطوة واحدة متبقية
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="اسمك المستعار"
                  className="h-20 text-center text-3xl font-black rounded-3xl bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-primary focus:border-primary transition-all"
                  maxLength={15}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <Button
                  className="w-full h-16 rounded-3xl text-xl font-black bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleJoin}
                  disabled={loading}
                >
                  {loading ? "جاري الانضمام..." : "ابدأ اللعب!"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 mt-8 text-xs font-bold uppercase tracking-widest">
          أوركيدة للخدمات الرقمية والأكاديمية &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
