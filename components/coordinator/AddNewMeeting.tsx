// 📍 المسار: src/components/MeetingScheduler/AddNewMeeting.tsx

"use client"; // 👈 هذا السطر ضروري جداً

import React from "react";
import {
  JoinedMeeting,
  useMeetingScheduler,
} from "../MeetingScheduler/useMeetingScheduler";
import CalendarControls from "../MeetingScheduler/CalendarControls";
import MeetingCalendar from "../MeetingScheduler/MeetingCalendar";

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
  // استدعاء الـ Hook للحصول على كل المنطق والحالات
  const {
    combinedEvents,
    hasExistingMeetings,
    handleAutoSchedule,
    chooseDaysGroup,
    handleManualAdd,
    handleEventClick, // 👈 استلام الدالة الجديدة
  } = useMeetingScheduler(section, AllMeetings, courseHours, userId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 جدولة اللقاءات</h1>

      {/* استخدام مكون أزرار التحكم */}
      <CalendarControls
        hasExistingMeetings={hasExistingMeetings}
        onAutoSchedule={handleAutoSchedule}
        onManualSchedule={chooseDaysGroup}
      />

      {/* استخدام مكون التقويم */}
      <MeetingCalendar
        events={combinedEvents}
        onDateClick={handleManualAdd}
        onEventClick={handleEventClick}
      />
    </div>
  );
};

export default AddNewMeeting;
