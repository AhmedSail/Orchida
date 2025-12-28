"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import type { CalendarEvent } from "./useMeetingScheduler";
import { EventClickArg } from "@fullcalendar/core";

interface MeetingCalendarProps {
  events: CalendarEvent[];
  onDateClick: (arg: DateClickArg) => void;
  onEventClick: (arg: EventClickArg) => void;
}

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  events,
  onDateClick,
  onEventClick,
}) => {
  const [initialView, setInitialView] = useState("dayGridMonth");

  // ✅ تغيير الـ view حسب حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setInitialView("timeGridDay"); // موبايل: عرض يومي
      } else if (window.innerWidth < 1024) {
        setInitialView("timeGridWeek"); // تابلت: عرض أسبوعي
      } else {
        setInitialView("dayGridMonth"); // ديسكتوب: عرض شهري
      }
    };

    handleResize(); // استدعاء أول مرة
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={initialView}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      locale="ar"
      buttonText={{ today: "اليوم", month: "شهر", week: "أسبوع", day: "يوم" }}
      height="auto"
      contentHeight="auto"
      aspectRatio={1.5}
      windowResizeDelay={100}
      events={events}
      selectable={true}
      editable={false}
      droppable={false}
      dateClick={onDateClick}
      eventClick={onEventClick}
    />
  );
};

export default MeetingCalendar;
