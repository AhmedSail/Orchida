// 📍 src/components/MeetingScheduler/CalendarControls.tsx

"use client";

import React from "react";
import { Calendar, Sparkles, MousePointerClick, Info } from "lucide-react";

interface CalendarControlsProps {
  hasExistingMeetings: boolean;
  meetingsCount?: number;
  onAutoSchedule: () => void;
  onManualSchedule: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  hasExistingMeetings,
  meetingsCount = 0,
  onAutoSchedule,
  onManualSchedule,
}) => {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">خيارات الجدولة</h2>
          <p className="text-sm text-muted-foreground">
            اختر طريقة جدولة اللقاءات
          </p>
        </div>
      </div>

      {/* Buttons Container - الأزرار متاحة دائماً الآن */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* زر الجدولة التلقائية */}
        <button
          onClick={onAutoSchedule}
          className="group relative flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-white
                     bg-gradient-to-r from-emerald-500 to-emerald-600
                     hover:from-emerald-600 hover:to-emerald-700
                     shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
                     transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5"
        >
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>جدولة تلقائية</span>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
        </button>

        {/* زر الجدولة اليدوية */}
        <button
          onClick={onManualSchedule}
          className="group relative flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-white
                     bg-gradient-to-r from-blue-500 to-blue-600
                     hover:from-blue-600 hover:to-blue-700
                     shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                     transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5"
        >
          <MousePointerClick className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>جدولة يدوية (اختر الأيام)</span>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
        </button>
      </div>

      {/* Info Message - يظهر عندما يوجد لقاءات */}
      {hasExistingMeetings && (
        <div className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            لديك <span className="font-bold">{meetingsCount}</span> لقاء مجدول.{" "}
            <span className="text-amber-600 dark:text-amber-400">
              يمكنك إضافة المزيد من اللقاءات أو إعادة الجدولة.
            </span>
          </p>
        </div>
      )}

      {/* Tip - يظهر دائماً */}
      <div className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
        <span className="text-lg">💡</span>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">نصيحة:</span> يمكنك
          أيضاً النقر مباشرة على أي يوم في التقويم لإضافة لقاء يدوي
        </p>
      </div>
    </div>
  );
};

export default CalendarControls;
