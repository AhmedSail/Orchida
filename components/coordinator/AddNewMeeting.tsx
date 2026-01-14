// 📍 المسار: src/components/MeetingScheduler/AddNewMeeting.tsx

"use client";

import React from "react";
import {
  JoinedMeeting,
  useMeetingScheduler,
} from "../MeetingScheduler/useMeetingScheduler";
import CalendarControls from "../MeetingScheduler/CalendarControls";
import MeetingCalendar from "../MeetingScheduler/MeetingCalendar";
import { Calendar, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

// استيراد المكونات الجديدة والـ Hook
export interface DbSection {
  id: string;
  courseId: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  maxCapacity: number;
  currentEnrollment: number;
  status: string;
  instructorId: string | null;
  coordinatorId: string | null;
  location: string | null;
  courseType: string | null;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// تعريف Props للمكون
interface AddNewMeetingProps {
  section: DbSection;
  AllMeetings: JoinedMeeting[];
  courseHours: number;
  userId: string;
}

const AddNewMeeting: React.FC<AddNewMeetingProps> = ({
  section,
  AllMeetings,
  courseHours,
  userId,
}) => {
  const router = useRouter();

  // استدعاء الـ Hook للحصول على كل المنطق والحالات
  const {
    combinedEvents,
    sectionMeetings,
    hasExistingMeetings,
    isLoading,
    nextMeetingNumber,
    handleAutoSchedule,
    chooseDaysGroup,
    handleManualAdd,
    handleEventClick,
    handleDeleteAllMeetings,
    handleExport,
    handleEventDrop,
  } = useMeetingScheduler(section, AllMeetings, courseHours, userId);

  // دالة تحديث الصفحة
  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/25">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              📅 جدولة اللقاءات
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              شعبة رقم {section.sectionNumber} • {courseHours} ساعة تدريبية •
              اللقاء التالي: #{nextMeetingNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 
                       text-foreground rounded-xl font-medium text-sm transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            تحديث
          </button>

          {/* Section Info Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-muted rounded-xl border border-border">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                section.status === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : section.status === "closed"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {section.status === "active"
                ? "نشطة"
                : section.status === "closed"
                ? "مغلقة"
                : "قيد الإعداد"}
            </span>
          </div>
        </div>
      </div>

      {/* Section Dates Info */}
      {(section.startDate || section.endDate) && (
        <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
          {section.startDate && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">تاريخ البدء:</span>{" "}
              {new Date(section.startDate).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {section.endDate && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">تاريخ الانتهاء:</span>{" "}
              {new Date(section.endDate).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <CalendarControls
        hasExistingMeetings={hasExistingMeetings}
        meetingsCount={sectionMeetings.length}
        onAutoSchedule={handleAutoSchedule}
        onManualSchedule={chooseDaysGroup}
      />

      {/* Calendar */}
      <MeetingCalendar
        events={combinedEvents}
        sectionMeetings={sectionMeetings}
        onDateClick={handleManualAdd}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        onExport={handleExport}
        onDeleteAll={handleDeleteAllMeetings}
        isLoading={isLoading}
        hasExistingMeetings={hasExistingMeetings}
      />

      {/* Quick Stats */}
      {hasExistingMeetings && sectionMeetings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <p className="text-xs text-muted-foreground">إجمالي اللقاءات</p>
            <p className="text-2xl font-bold text-primary">
              {sectionMeetings.length}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20">
            <p className="text-xs text-muted-foreground">المكتملة</p>
            <p className="text-2xl font-bold text-emerald-600">
              {
                sectionMeetings.filter((m) => new Date(m.start) < new Date())
                  .length
              }
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20">
            <p className="text-xs text-muted-foreground">القادمة</p>
            <p className="text-2xl font-bold text-blue-600">
              {
                sectionMeetings.filter((m) => new Date(m.start) >= new Date())
                  .length
              }
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-500/20">
            <p className="text-xs text-muted-foreground">ساعات التدريب</p>
            <p className="text-2xl font-bold text-orange-600">{courseHours}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewMeeting;
