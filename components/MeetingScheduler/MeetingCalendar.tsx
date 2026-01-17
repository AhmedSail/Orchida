"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import type { CalendarEvent } from "./useMeetingScheduler";
import { EventClickArg, EventDropArg } from "@fullcalendar/core";
import {
  CalendarDays,
  Info,
  FileDown,
  FileSpreadsheet,
  Trash2,
  Loader2,
} from "lucide-react";

interface MeetingCalendarProps {
  events: CalendarEvent[];
  sectionMeetings: CalendarEvent[];
  onDateClick: (arg: DateClickArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  onEventDrop?: (arg: EventDropArg) => void;
  onExport?: (format: "pdf" | "excel") => void;
  onDeleteAll?: () => void;
  isLoading?: boolean;
  hasExistingMeetings?: boolean;
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  events,
  sectionMeetings,
  onDateClick,
  onEventClick,
  onEventDrop,
  onExport,
  onDeleteAll,
  isLoading = false,
  hasExistingMeetings = false,
}) => {
  const [initialView, setInitialView] = useState("dayGridMonth");

  // ✅ تغيير الـ view حسب حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setInitialView("timeGridDay");
      } else if (window.innerWidth < 1024) {
        setInitialView("timeGridWeek");
      } else {
        setInitialView("dayGridMonth");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // إحصائيات اللقاءات
  const currentSectionMeetings = events.filter(
    (e) => e.extendedProps?.isCurrentSection
  ).length;
  const otherSectionMeetings = events.filter(
    (e) => !e.extendedProps?.isCurrentSection
  ).length;

  return (
    <div className="space-y-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-foreground font-medium">جاري المعالجة...</p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-card to-secondary/30 rounded-2xl border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">إجمالي اللقاءات</p>
            <p className="text-2xl font-bold text-foreground">
              {events.length}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* لقاءاتي */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-sm shadow-primary/30" />
            <div>
              <p className="text-xs text-muted-foreground">لقاءات هذه الشعبة</p>
              <p className="text-lg font-bold text-foreground">
                {currentSectionMeetings}
              </p>
            </div>
          </div>

          {/* لقاءات أخرى */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
            <div>
              <p className="text-xs text-muted-foreground">لقاءات محجوزة</p>
              <p className="text-lg font-bold text-foreground">
                {otherSectionMeetings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasExistingMeetings && (
        <div className="flex flex-wrap items-center justify-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
          {/* Export PDF */}
          {onExport && (
            <button
              onClick={() => onExport("pdf")}
              disabled={isLoading}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 
                         hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium text-sm
                         transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              تصدير PDF
            </button>
          )}

          {/* Export Excel */}
          {onExport && (
            <button
              onClick={() => onExport("excel")}
              disabled={isLoading}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 
                         hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium text-sm
                         transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              تصدير Excel
            </button>
          )}

          {/* Delete All */}
          {onDeleteAll && (
            <button
              onClick={onDeleteAll}
              disabled={isLoading}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 
                         hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium text-sm
                         transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              حذف الكل
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 p-3 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-r from-primary to-primary/80" />
          <span className="text-sm text-foreground">لقاءات الشعبة الحالية</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-r from-gray-500 to-gray-600 opacity-75" />
          <span className="text-sm text-foreground">
            لقاءات محجوزة (شعب أخرى)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            انقر على يوم لإضافة لقاء • اسحب لقاء لنقله
          </span>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={initialView}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="ar"
          direction="rtl"
          buttonText={{
            today: "اليوم",
            month: "شهر",
            week: "أسبوع",
            day: "يوم",
          }}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.5}
          windowResizeDelay={100}
          events={events}
          selectable={true}
          editable={true} // ✅ تفعيل السحب والإفلات
          droppable={true}
          dateClick={onDateClick}
          eventClick={onEventClick}
          eventDrop={onEventDrop} // ✅ دالة السحب والإفلات
          dayMaxEvents={3}
          moreLinkText={(n) => `+${n} لقاءات`}
          nowIndicator={true}
          eventDisplay="block"
          displayEventTime={true}
          displayEventEnd={true}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          weekends={true}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            meridiem: "short",
          }}
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            meridiem: "short",
          }}
          // ✅ تخصيص مظهر الأحداث
          eventClassNames={(arg) => {
            if (arg.event.extendedProps?.isCurrentSection) {
              return ["current-section-event"];
            }
            return ["other-section-event"];
          }}
        />
      </div>

      {/* Footer Hints */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2">
        <p className="text-xs text-muted-foreground">
          💡 انقر على أي لقاء لتعديله أو حذفه أو نسخه
        </p>
        <p className="text-xs text-muted-foreground">
          🔄 اسحب أي لقاء لنقله إلى تاريخ جديد
        </p>
      </div>
    </div>
  );
};

export default MeetingCalendar;
