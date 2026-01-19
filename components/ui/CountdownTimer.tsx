"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  targetDate: Date;
  onComplete?: () => void;
}

export default function CountdownTimer({ targetDate, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft(null);
        if (onComplete) onComplete();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
      <Clock className="size-4 animate-pulse" />
      <div className="flex items-center gap-1 font-mono text-xs font-black">
        {timeLeft.days > 0 && <span>{timeLeft.days}ي : </span>}
        <span>{String(timeLeft.hours).padStart(2, "0")}</span>:
        <span>{String(timeLeft.minutes).padStart(2, "0")}</span>:
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
      </div>
      <span className="text-[10px] font-bold mr-1">حتى الظهور</span>
    </div>
  );
}
