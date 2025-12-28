"use client";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Swal from "sweetalert2";
import { Section } from "@/app/admin/[adminId]/courses/sections/[id]/edit/page";

const Celender = ({
  section,
  sectionOfCourse,
}: {
  section: Section;
  sectionOfCourse: Section;
}) => {
  const [meetings, setMeetings] = useState<any[]>([]);

  // دالة لإضافة لقاء جديد عند الضغط على التاريخ
  const handleDateClick = async (info: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // نخلي اليوم يبدأ من منتصف الليل
    const clickedDate = new Date(info.dateStr);

    // ✅ منع إضافة لقاءات في الأيام الماضية
    if (clickedDate.getTime() < today.getTime()) {
      Swal.fire("❌ غير مسموح", "لا يمكنك إضافة لقاء في يوم مضى", "error");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "إضافة لقاء جديد",
      html: `
        <input id="courseTitle" class="swal2-input" placeholder="اسم الدورة/اللقاء" value="${
          sectionOfCourse.courseId || "لقاء"
        }">
        <input id="location" class="swal2-input" placeholder="المكان">
        <input id="startTime" type="time" class="swal2-input" placeholder="وقت البداية">
        <input id="endTime" type="time" class="swal2-input" placeholder="وقت النهاية">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "إضافة",
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const courseTitle = (
          document.getElementById("courseTitle") as HTMLInputElement
        ).value;
        const location = (
          document.getElementById("location") as HTMLInputElement
        ).value;
        const startTime = (
          document.getElementById("startTime") as HTMLInputElement
        ).value;
        const endTime = (document.getElementById("endTime") as HTMLInputElement)
          .value;

        if (!courseTitle) {
          Swal.showValidationMessage("يجب إدخال اسم الدورة/اللقاء");
        }

        return { courseTitle, location, startTime, endTime };
      },
    });

    if (formValues) {
      setMeetings([
        ...meetings,
        {
          title: `${formValues.courseTitle} (${formValues.location})`,
          start: `${info.dateStr}T${formValues.startTime || "09:00"}`,
          end: formValues.endTime
            ? `${info.dateStr}T${formValues.endTime}`
            : undefined,
        },
      ]);
      Swal.fire("تمت الإضافة ✅", "تم إضافة اللقاء بنجاح", "success");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 جدولة اللقاءات</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={meetings}
        dateClick={handleDateClick}
        selectable={true}
        editable={true}
        height="auto"
      />
    </div>
  );
};

export default Celender;
