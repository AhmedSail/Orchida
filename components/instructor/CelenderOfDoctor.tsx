"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React from "react";
import { Meeting } from "@/app/admin/[adminId]/courses/sections/meetings/page";
import { Instructor } from "@/app/admin/[adminId]/instructor/page";
export type MeetingWithCourseSection = {
  id: string;
  meetingNumber: number;
  date: Date; // من نوع timestamp
  startTime: string; // نص مثل "09:00"
  endTime: string; // نص مثل "11:00"
  courseName: string | null; // ممكن يكون null لو ما في join
  sectionNumber: number | null; // نفس الشيء
};
const CelenderOfDoctor = ({
  meetings,
  instructor,
}: {
  meetings: MeetingWithCourseSection[];
  instructor: Instructor;
}) => {
  const combineDateTime = (date: Date | string, time: string) => {
    const d = new Date(date); // يستقبل Timestamp من PG أو string ISO
    const [hours, minutes] = time.split(":").map(Number);
    // أنشئ تاريخ محلي بدون UTC
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      hours,
      minutes,
      0
    );
  };

  const events = meetings.map((m) => {
    try {
      const start = combineDateTime(m.date, m.startTime);
      const end = combineDateTime(m.date, m.endTime);

      return {
        id: m.id,
        title: `لقاء لشعبة ${m.sectionNumber} من دورة ${m.courseName}`, // ✅ العنوان الجديد
        start,
        end,
      };
    } catch (e) {
      console.error("Invalid date for meeting:", m);
      return { id: m.id, title: "موعد" };
    }
  });

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="ar"
        buttonText={{ today: "اليوم", month: "شهر", week: "أسبوع", day: "يوم" }}
        timeZone="local" // ✅ مهم جداً
        events={events}
      />
    </div>
  );
};

export default CelenderOfDoctor;
