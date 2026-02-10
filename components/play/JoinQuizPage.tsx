"use client";

import React, { useState } from "react";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";

export default function JoinQuizPage() {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
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
    if (!nickname || !realName || !phone) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quizzes/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, nickname, realName, phone }),
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative direction-rtl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 size-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-0 size-80 bg-secondary/50 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 size-96 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md z-10 relative"
      >
        <div className="text-center mb-10">
          <motion.div
            whileHover={{ rotate: 0, scale: 1.05 }}
            className="size-24 bg-card rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-primary/10 rotate-12 mb-6 border border-border"
          >
            <Gamepad2 className="size-12 text-primary -rotate-12" />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-widest uppercase italic">
            مسابقة أوركيدة
          </h1>
          <p className="text-muted-foreground mt-2 font-bold italic">
            أدخل الرمز وابدأ التحدي!
          </p>
        </div>

        <Card className="rounded-[40px] border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
          <CardContent className="p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="mx-auto"
                />
                <Input
                  type="text"
                  placeholder="PIN"
                  className="h-20 text-center text-4xl font-black tracking-[0.3em] rounded-3xl bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-primary focus:border-primary transition-all uppercase shadow-inner"
                  maxLength={6}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleCheckPin()}
                />
                <Button
                  className="w-full h-16 rounded-3xl text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleCheckPin}
                  disabled={loading}
                >
                  {loading ? "جاري التحقق..." : "دخول"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4 justify-between">
                  <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                    بيانات اللاعب
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-full"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="size-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="اسمك المستعار (للمسابقة)"
                    className="h-14 text-center text-xl font-bold rounded-2xl bg-secondary/30 border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-primary focus:border-primary transition-all"
                    maxLength={15}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="اسمك الحقيقي"
                    className="h-14 text-center text-xl font-bold rounded-2xl bg-secondary/30 border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-primary focus:border-primary transition-all"
                    maxLength={50}
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="رقم الهاتف"
                    className="h-14 text-center text-xl font-bold rounded-2xl bg-secondary/30 border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-primary focus:border-primary transition-all"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  />
                </div>
                <Button
                  className="w-full h-16 rounded-3xl text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleJoin}
                  disabled={loading}
                >
                  {loading ? "جاري الانضمام..." : "ابدأ اللعب!"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground/60 mt-8 text-xs font-bold uppercase tracking-widest">
          أوركيدة للخدمات الرقمية والأكاديمية &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
