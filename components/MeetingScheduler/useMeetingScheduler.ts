"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { DbSection } from "../coordinator/AddNewMeeting";

// --- تعريف الأنواع (Types) ---
export interface Section {
  id: string;
  courseId: string;
  instructorId: string | null;
  sectionNumber: number;
  startDate: string;
}

export interface Meeting {
  id: string;
  courseId: string;
  sectionId: string;
  instructorId?: string | null;
  meetingNumber: number;
  date: Date | string;
  startTime: string;
  endTime: string;
  location: string | null;
}

export interface CourseSection {
  sectionNumber?: number;
}

export interface JoinedMeeting {
  meetings: Meeting;
  courseSections: CourseSection | null;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: { isCurrentSection: boolean; sectionId?: string };
}

// --- دالة مساعدة ---
function formatDateToYMD(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTimeTo12h(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "م" : "ص";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// --- دالة توليد PDF ---
async function exportToPDF(meetings: CalendarEvent[], sectionNumber: number) {
  // استخدام html2pdf أو jspdf
  const content = `
    <html dir="rtl">
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #675795; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background: #675795; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>جدول لقاءات الشعبة ${sectionNumber}</h1>
        <table>
          <thead>
            <tr>
              <th>رقم اللقاء</th>
              <th>التاريخ</th>
              <th>وقت البداية</th>
              <th>وقت النهاية</th>
            </tr>
          </thead>
          <tbody>
            ${meetings
              .sort(
                (a, b) =>
                  new Date(a.start).getTime() - new Date(b.start).getTime()
              )
              .map(
                (m, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${m.start.split("T")[0]}</td>
                  <td>${formatTimeTo12h(m.start.split("T")[1])}</td>
                  <td>${formatTimeTo12h(m.end.split("T")[1])}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
        <p style="text-align: center; margin-top: 30px; color: #666;">
          تم التصدير بتاريخ: ${new Date().toLocaleDateString("ar-EG")}
        </p>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
}

// --- دالة تصدير Excel ---
function exportToExcel(meetings: CalendarEvent[], sectionNumber: number) {
  const csvContent = [
    ["رقم اللقاء", "التاريخ", "وقت البداية", "وقت النهاية"].join(","),
    ...meetings
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .map((m, i) =>
        [
          i + 1,
          m.start.split("T")[0],
          formatTimeTo12h(m.start.split("T")[1]),
          formatTimeTo12h(m.end.split("T")[1]),
        ].join(",")
      ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `جدول_الشعبة_${sectionNumber}.csv`;
  link.click();
}

// --- الخطاف المخصص (Custom Hook) ---
export const useMeetingScheduler = (
  section: DbSection,
  AllMeetings: JoinedMeeting[],
  courseHours: number,
  userId: string
) => {
  const router = useRouter();
  const [sectionMeetings, setSectionMeetings] = useState<CalendarEvent[]>([]);
  const [combinedEvents, setCombinedEvents] = useState<CalendarEvent[]>([]);
  const [nextMeetingNumber, setNextMeetingNumber] = useState<number>(1);
  const [hasExistingMeetings, setHasExistingMeetings] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ✅ أرشفة اللقاءات القديمة تلقائياً
  useEffect(() => {
    const archivePastMeetings = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pastMeetingsToArchive = AllMeetings.filter((jm) => {
        if (jm.meetings.sectionId !== section.id) return false;
        const meetingDate = new Date(jm.meetings.date);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate < today;
      });

      if (pastMeetingsToArchive.length === 0) return;

      try {
        const meetingIdsToArchive = pastMeetingsToArchive.map(
          (jm) => jm.meetings.id
        );
        const res = await fetch(
          `/api/courses/courseSections/meetings/bulk-archive`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: meetingIdsToArchive }),
          }
        );

        if (res.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error(
          "An error occurred while archiving past meetings:",
          error
        );
      }
    };

    archivePastMeetings();
  }, [section.id, AllMeetings, router]);

  // ✅ تحديث الأحداث عند تغيير البيانات (useEffect واحد فقط بدلاً من اثنين)
  useEffect(() => {
    const otherMeetings: CalendarEvent[] = AllMeetings.filter(
      (jm) => jm.meetings.sectionId !== section.id
    ).map((jm) => ({
      id: jm.meetings.id.toString(),
      title: `لقاء محجوز - شعبة ${jm.courseSections?.sectionNumber ?? "-"}`,
      start: `${formatDateToYMD(jm.meetings.date)}T${jm.meetings.startTime}`,
      end: `${formatDateToYMD(jm.meetings.date)}T${jm.meetings.endTime}`,
      backgroundColor: "#6c757d",
      borderColor: "#6c757d",
      extendedProps: {
        isCurrentSection: false,
        sectionId: jm.meetings.sectionId,
      },
    }));

    const currentMeetings: CalendarEvent[] = AllMeetings.filter(
      (jm) => jm.meetings.sectionId === section.id
    ).map((jm) => ({
      id: jm.meetings.id.toString(),
      title: `لقاء ${jm.meetings.meetingNumber ?? ""} - ${
        jm.meetings.location ?? ""
      }`.trim(),
      start: `${formatDateToYMD(jm.meetings.date)}T${jm.meetings.startTime}`,
      end: `${formatDateToYMD(jm.meetings.date)}T${jm.meetings.endTime}`,
      extendedProps: {
        isCurrentSection: true,
        sectionId: jm.meetings.sectionId,
      },
    }));

    setSectionMeetings(currentMeetings);
    setCombinedEvents([...otherMeetings, ...currentMeetings]);
    setNextMeetingNumber(currentMeetings.length + 1);
    setHasExistingMeetings(currentMeetings.length > 0);
  }, [AllMeetings, section.id]);

  // ✅ تحديث combinedEvents عند تغيير sectionMeetings
  useEffect(() => {
    const otherMeetings: CalendarEvent[] = AllMeetings.filter(
      (jm) => jm.meetings.sectionId !== section.id
    ).map((jm) => ({
      id: jm.meetings.id.toString(),
      title: `لقاء محجوز - شعبة ${jm.courseSections?.sectionNumber ?? "-"}`,
      start: `${formatDateToYMD(jm.meetings.date)}T${jm.meetings.startTime}`,
      end: `${formatDateToYMD(jm.meetings.date)}T${jm.meetings.endTime}`,
      backgroundColor: "#6c757d",
      borderColor: "#6c757d",
      extendedProps: {
        isCurrentSection: false,
        sectionId: jm.meetings.sectionId,
      },
    }));
    setCombinedEvents([...otherMeetings, ...sectionMeetings]);
  }, [sectionMeetings, AllMeetings, section.id]);

  // ✅ دالة اختيار أيام الأسبوع للجدولة اليدوية (تم إصلاحها)
  const chooseDaysGroup = useCallback(async () => {
    const { value: selectedDays } = await Swal.fire({
      title: "اختر أيام الأسبوع للجدولة",
      html: `
        <p class="text-sm text-gray-600 mb-4">اختر الأيام التي تريد جدولة اللقاءات فيها</p>
        <div class="grid grid-cols-2 gap-3 text-right">
          <label class="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" class="swal2-checkbox-days" value="6"> السبت
          </label>
          <label class="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" class="swal2-checkbox-days" value="0"> الأحد
          </label>
          <label class="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" class="swal2-checkbox-days" value="1"> الاثنين
          </label>
          <label class="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" class="swal2-checkbox-days" value="2"> الثلاثاء
          </label>
          <label class="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" class="swal2-checkbox-days" value="3"> الأربعاء
          </label>
          <label class="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" class="swal2-checkbox-days" value="4"> الخميس
          </label>
        </div>
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            💡 <strong>نصيحة:</strong> بعد اختيار الأيام، انقر على أي يوم في التقويم لإضافة لقاء
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "تأكيد الاختيار",
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const days = Array.from(
          document.querySelectorAll<HTMLInputElement>(
            ".swal2-checkbox-days:checked"
          )
        ).map((cb) => parseInt(cb.value));

        if (days.length === 0) {
          Swal.showValidationMessage("الرجاء اختيار يوم واحد على الأقل");
          return null;
        }
        return days;
      },
    });

    if (selectedDays) {
      const dayNames: Record<number, string> = {
        0: "الأحد",
        1: "الاثنين",
        2: "الثلاثاء",
        3: "الأربعاء",
        4: "الخميس",
        5: "الجمعة",
        6: "السبت",
      };

      Swal.fire({
        icon: "success",
        title: "تم اختيار الأيام",
        html: `
          <p>الأيام المختارة: <strong>${selectedDays
            .map((d: number) => dayNames[d])
            .join("، ")}</strong></p>
          <p class="mt-2 text-sm text-gray-600">الآن انقر على أي من هذه الأيام في التقويم لإضافة لقاء</p>
        `,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }, []);

  // ✅ الجدولة التلقائية
  const handleAutoSchedule = useCallback(async () => {
    // ✅ إذا كان هناك لقاءات موجودة، اعرض خيارات للمستخدم
    if (hasExistingMeetings) {
      const { value: choice } = await Swal.fire({
        title: "يوجد لقاءات مجدولة مسبقاً",
        html: `
          <p class="text-gray-600 mb-4">هذه الشعبة لديها <strong>${sectionMeetings.length}</strong> لقاء مجدول مسبقاً.</p>
          <p class="text-sm text-gray-500">ماذا تريد أن تفعل؟</p>
        `,
        icon: "question",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "➕ إضافة لقاءات جديدة",
        denyButtonText: "🗑️ حذف الموجودة وإعادة الجدولة",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#10b981",
        denyButtonColor: "#ef4444",
      });

      if (choice === undefined) return; // المستخدم ألغى

      // إذا اختار حذف اللقاءات الموجودة
      if (choice === false) {
        const { isConfirmed } = await Swal.fire({
          title: "⚠️ تأكيد الحذف",
          text: `هل أنت متأكد من حذف جميع اللقاءات الـ ${sectionMeetings.length} الموجودة؟`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "نعم، احذف وأعد الجدولة",
          cancelButtonText: "إلغاء",
        });

        if (!isConfirmed) return;

        // حذف جميع اللقاءات الموجودة
        try {
          const meetingIds = sectionMeetings.map((m) => m.id).filter(Boolean);
          await fetch(`/api/courses/courseSections/meetings/bulk-delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: meetingIds }),
          });
          setSectionMeetings([]);
          setNextMeetingNumber(1);
        } catch (error) {
          Swal.fire("خطأ", "فشل حذف اللقاءات الموجودة", "error");
          return;
        }
      }
      // إذا اختار الإضافة، نكمل بشكل طبيعي
    }

    if (courseHours <= 0) {
      Swal.fire(
        "خطأ",
        "عدد الساعات في الكورس غير محدد. الرجاء إضافة عدد الساعات في تفاصيل الكورس أولاً.",
        "error"
      );
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "جدولة تلقائية للقاءات",
      html: `
        <p class="text-sm text-gray-600 mb-2">أدخل تفاصيل الجدولة ليتم توزيع اللقاءات تلقائياً.</p>
        <div id="swal-days-container" class="grid grid-cols-3 gap-2 mb-3">
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" class="swal2-checkbox" value="6"> السبت</label>
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" class="swal2-checkbox" value="0"> الأحد</label>
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" class="swal2-checkbox" value="1"> الاثنين</label>
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" class="swal2-checkbox" value="2"> الثلاثاء</label>
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" class="swal2-checkbox" value="3"> الأربعاء</label>
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" class="swal2-checkbox" value="4"> الخميس</label>
        </div>
        <input id="swal-start-date" type="date" class="swal2-input" placeholder="تاريخ بدء الجدولة">
        <input id="swal-start-time" type="time" class="swal2-input" value="09:00">
        <input id="swal-total-meetings" type="number" class="swal2-input" placeholder="عدد اللقاءات الإجمالي (مثال: 15)">
        <div class="mt-3 p-3 bg-blue-50 rounded">
          <p class="text-sm text-blue-800">
            <strong>عدد الساعات في الكورس:</strong> ${courseHours} ساعة<br>
            <strong>عدد الساعات لكل لقاء:</strong> سيتم حسابه تلقائياً
          </p>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "توليد الجدول",
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const selectedDays = Array.from(
          document.querySelectorAll<HTMLInputElement>(".swal2-checkbox:checked")
        ).map((cb) => parseInt(cb.value));
        const startDate = (
          document.getElementById("swal-start-date") as HTMLInputElement
        ).value;
        const startTime = (
          document.getElementById("swal-start-time") as HTMLInputElement
        ).value;
        const totalMeetings = parseInt(
          (document.getElementById("swal-total-meetings") as HTMLInputElement)
            .value
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sectionStart = section.startDate
          ? new Date(section.startDate)
          : today;
        sectionStart.setHours(0, 0, 0, 0);

        const minAllowedDate = sectionStart > today ? sectionStart : today;
        const chosenStartDate = new Date(startDate);
        chosenStartDate.setHours(0, 0, 0, 0);

        if (chosenStartDate < minAllowedDate) {
          Swal.showValidationMessage(
            `التاريخ المختار (${startDate}) لا يمكن أن يكون قبل ${formatDateToYMD(
              minAllowedDate
            )} ${
              minAllowedDate.getTime() === today.getTime()
                ? "(تاريخ اليوم)"
                : "(تاريخ بداية الشعبة)"
            }`
          );
          return null;
        }
        if (
          !selectedDays.length ||
          !startDate ||
          !startTime ||
          !totalMeetings
        ) {
          Swal.showValidationMessage("الرجاء إدخال جميع الحقول المطلوبة.");
          return null;
        }
        if (totalMeetings <= 0) {
          Swal.showValidationMessage("يجب أن يكون عدد اللقاءات أكبر من صفر.");
          return null;
        }
        if (totalMeetings > courseHours) {
          Swal.showValidationMessage(
            `عدد اللقاءات (${totalMeetings}) لا يمكن أن يكون أكبر من عدد الساعات في الكورس (${courseHours}).`
          );
          return null;
        }

        const hoursPerMeeting = Math.ceil(courseHours / totalMeetings);
        return {
          selectedDays,
          startDate,
          startTime,
          totalMeetings,
          hoursPerMeeting,
        };
      },
    });

    if (!formValues) return;

    setIsLoading(true);

    const {
      selectedDays,
      startDate,
      startTime,
      totalMeetings,
      hoursPerMeeting,
    } = formValues;
    const generatedMeetings: Omit<Meeting, "id">[] = [];
    let currentDate = new Date(startDate);
    let meetingsCount = 0;
    let safetyBreak = 0;
    let conflictFoundAndReported = false;

    while (meetingsCount < totalMeetings && !conflictFoundAndReported) {
      safetyBreak++;
      if (safetyBreak > 365) {
        setIsLoading(false);
        Swal.fire(
          "خطأ",
          "فشل توليد الجدول. قد تكون الأيام المختارة غير كافية أو هناك تعارضات كثيرة.",
          "error"
        );
        return;
      }

      const dayOfWeek = currentDate.getDay();
      const dateStr = formatDateToYMD(currentDate);
      const startDateTime = new Date(`${dateStr}T${startTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + hoursPerMeeting * 60 * 60 * 1000
      );
      const endTime = endDateTime.toTimeString().slice(0, 5);
      const isValidDay = selectedDays.includes(dayOfWeek);
      const isWithinWorkHours = startTime >= "08:00" && endTime <= "20:00";

      if (isValidDay && isWithinWorkHours) {
        const conflictingEvent = combinedEvents.find((event) => {
          const eventDate = event.start.split("T")[0];
          if (eventDate !== dateStr) return false;
          const existingStart = new Date(event.start).getTime();
          const existingEnd = new Date(event.end).getTime();
          const newStart = startDateTime.getTime();
          const newEnd = endDateTime.getTime();
          return newStart < existingEnd && newEnd > existingStart;
        });

        if (conflictingEvent) {
          const originalMeetingDetails = AllMeetings.find(
            (jm) => jm.meetings.id === conflictingEvent.id
          );
          setIsLoading(false);
          Swal.fire({
            title: "⚠️ تعارض في المواعيد!",
            html: `
              <div class="text-right">
                <p class="font-bold mb-2">الموعد المقترح (${dateStr} من ${startTime} إلى ${endTime}) يتعارض مع:</p>
                <div class="bg-red-50 p-3 rounded mb-3">
                  <p><strong>الشعبة:</strong> ${
                    originalMeetingDetails?.courseSections?.sectionNumber ||
                    "غير معروف"
                  }</p>
                  <p><strong>التاريخ:</strong> ${
                    conflictingEvent.start.split("T")[0]
                  }</p>
                  <p><strong>الوقت:</strong> ${formatTimeTo12h(
                    startTime
                  )} - ${formatTimeTo12h(endTime)}</p>
                </div>
                <p class="text-red-600">سيتم إيقاف الجدولة. يرجى اختيار موعد بدء أو أيام مختلفة.</p>
              </div>
            `,
            icon: "warning",
            confirmButtonText: "حسناً",
          });
          conflictFoundAndReported = true;
        } else {
          generatedMeetings.push({
            courseId: section.courseId,
            sectionId: section.id,
            instructorId: section.instructorId ?? undefined,
            meetingNumber: nextMeetingNumber + meetingsCount,
            date: dateStr,
            startTime: startTime,
            endTime: endTime,
            location: "",
          });
          meetingsCount++;
        }
      }

      if (!conflictFoundAndReported) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    if (conflictFoundAndReported || generatedMeetings.length === 0) {
      setIsLoading(false);
      return;
    }

    const reviewHtml = generatedMeetings
      .map((m) => `<li>${m.date} (${m.startTime} - ${m.endTime})</li>`)
      .join("");

    const { isConfirmed } = await Swal.fire({
      title: `تم توليد ${generatedMeetings.length} لقاء بنجاح`,
      html: `<p>هل تود حفظ هذه اللقاءات؟</p><ul class="text-right list-disc pr-5 mt-3 max-h-60 overflow-y-auto">${reviewHtml}</ul>`,
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "نعم، حفظ الكل",
      cancelButtonText: "لا، إلغاء",
    });

    if (isConfirmed) {
      try {
        const res = await fetch("/api/courses/courseSections/meetings/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(generatedMeetings),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "فشل حفظ اللقاءات في قاعدة البيانات."
          );
        }
        const savedMeetings = await res.json();
        const newEvents: CalendarEvent[] = savedMeetings.map((m: Meeting) => ({
          id: m.id.toString(),
          title: `لقاء ${m.meetingNumber}`,
          start: `${formatDateToYMD(m.date)}T${m.startTime}`,
          end: `${formatDateToYMD(m.date)}T${m.endTime}`,
          extendedProps: { isCurrentSection: true, sectionId: m.sectionId },
        }));
        setSectionMeetings((prev) => [...prev, ...newEvents]);
        Swal.fire("تم الحفظ!", "تمت جدولة جميع اللقاءات بنجاح.", "success");
        router.push(`/coordinator/${userId}/courses/sections/meetings`);
      } catch (error: any) {
        Swal.fire(
          "خطأ",
          error.message || "حدث خطأ أثناء حفظ اللقاءات.",
          "error"
        );
      }
    }
    setIsLoading(false);
  }, [
    hasExistingMeetings,
    courseHours,
    section,
    combinedEvents,
    AllMeetings,
    nextMeetingNumber,
    router,
    userId,
  ]);

  // ✅ إضافة لقاء يدوي (مع تأكيد قبل الحفظ)
  const handleManualAdd = useCallback(
    async (arg: { dateStr: string }) => {
      const dateStr = arg.dateStr;

      const { value: formValues } = await Swal.fire({
        title: `إضافة لقاء يدوي`,
        html: `
        <p class="text-sm text-gray-600 mb-2">أدخل تفاصيل اللقاء ليوم ${dateStr}</p>
        <input id="swal-title" class="swal2-input" placeholder="عنوان اللقاء (اختياري)">
        <input id="swal-start-time" type="time" class="swal2-input" value="09:00">
        <input id="swal-end-time" type="time" class="swal2-input" value="11:00">
        <input id="swal-location" class="swal2-input" placeholder="الموقع (اختياري)">
      `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "حفظ اللقاء",
        cancelButtonText: "إلغاء",
        preConfirm: () => {
          const title = (
            document.getElementById("swal-title") as HTMLInputElement
          ).value;
          const startTime = (
            document.getElementById("swal-start-time") as HTMLInputElement
          ).value;
          const endTime = (
            document.getElementById("swal-end-time") as HTMLInputElement
          ).value;
          const location = (
            document.getElementById("swal-location") as HTMLInputElement
          ).value;

          if (!startTime || !endTime) {
            Swal.showValidationMessage("الرجاء إدخال وقت البداية والنهاية.");
            return null;
          }

          if (startTime >= endTime) {
            Swal.showValidationMessage(
              "وقت النهاية يجب أن يكون بعد وقت البداية."
            );
            return null;
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const sectionStart = section.startDate
            ? new Date(section.startDate)
            : today;
          sectionStart.setHours(0, 0, 0, 0);

          const minAllowedDate = sectionStart > today ? sectionStart : today;
          const chosenDate = new Date(dateStr);
          chosenDate.setHours(0, 0, 0, 0);

          if (chosenDate < minAllowedDate) {
            Swal.showValidationMessage(
              `التاريخ المختار (${dateStr}) لا يمكن أن يكون قبل ${formatDateToYMD(
                minAllowedDate
              )} ${
                minAllowedDate.getTime() === today.getTime()
                  ? "(تاريخ اليوم)"
                  : "(تاريخ بداية الشعبة)"
              }`
            );
            return null;
          }

          return { title, startTime, endTime, location };
        },
      });

      if (!formValues) return;

      const { title, startTime, endTime, location } = formValues;

      // التحقق من التعارض
      const startDateTime = new Date(`${dateStr}T${startTime}`).getTime();
      const endDateTime = new Date(`${dateStr}T${endTime}`).getTime();

      const conflictingEvent = combinedEvents.find((event) => {
        const eventDate = event.start.split("T")[0];
        if (eventDate !== dateStr) return false;
        const existingStart = new Date(event.start).getTime();
        const existingEnd = new Date(event.end).getTime();
        return startDateTime < existingEnd && endDateTime > existingStart;
      });

      if (conflictingEvent) {
        Swal.fire(
          "خطأ",
          "يوجد تعارض مع لقاء آخر في نفس الوقت والتاريخ.",
          "error"
        );
        return;
      }

      // ✅ تأكيد قبل الحفظ
      const { isConfirmed } = await Swal.fire({
        title: "تأكيد إضافة اللقاء",
        html: `
        <div class="text-right">
          <p><strong>التاريخ:</strong> ${dateStr}</p>
          <p><strong>الوقت:</strong> ${formatTimeTo12h(
            startTime
          )} - ${formatTimeTo12h(endTime)}</p>
          ${location ? `<p><strong>الموقع:</strong> ${location}</p>` : ""}
          <p><strong>رقم اللقاء:</strong> ${nextMeetingNumber}</p>
        </div>
      `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "نعم، أضف اللقاء",
        cancelButtonText: "إلغاء",
      });

      if (!isConfirmed) return;

      setIsLoading(true);

      const newMeetingData = {
        courseId: section.courseId,
        sectionId: section.id,
        instructorId: section.instructorId,
        meetingNumber: nextMeetingNumber,
        date: dateStr,
        startTime,
        endTime,
        location,
        title: title || `لقاء ${nextMeetingNumber}`,
      };

      try {
        const res = await fetch("/api/courses/courseSections/meetings/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMeetingData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "فشل حفظ اللقاء.");
        }

        const savedMeeting: Meeting = await res.json();

        const newCalendarEvent: CalendarEvent = {
          id: savedMeeting.id.toString(),
          title: newMeetingData.title,
          start: `${formatDateToYMD(savedMeeting.date)}T${
            savedMeeting.startTime
          }`,
          end: `${formatDateToYMD(savedMeeting.date)}T${savedMeeting.endTime}`,
          extendedProps: {
            isCurrentSection: true,
            sectionId: savedMeeting.sectionId,
          },
        };

        setSectionMeetings((prev) => [...prev, newCalendarEvent]);
        setNextMeetingNumber((prev) => prev + 1);
        Swal.fire("تم الحفظ!", "تمت إضافة اللقاء بنجاح.", "success");
        router.refresh();
      } catch (error: any) {
        Swal.fire("خطأ", error.message, "error");
      }
      setIsLoading(false);
    },
    [combinedEvents, section, nextMeetingNumber, router]
  );

  // ✅ نسخ لقاء موجود
  const handleDuplicateMeeting = useCallback(
    async (meetingId: string) => {
      const originalMeeting = AllMeetings.find(
        (jm) => jm.meetings.id === meetingId
      )?.meetings;
      if (!originalMeeting) return;

      const { value: newDate } = await Swal.fire({
        title: "نسخ اللقاء",
        html: `
        <p class="text-sm text-gray-600 mb-2">اختر تاريخ جديد للقاء المنسوخ</p>
        <input id="swal-new-date" type="date" class="swal2-input" value="${formatDateToYMD(
          new Date()
        )}">
      `,
        showCancelButton: true,
        confirmButtonText: "نسخ",
        cancelButtonText: "إلغاء",
        preConfirm: () => {
          const date = (
            document.getElementById("swal-new-date") as HTMLInputElement
          ).value;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const chosenDate = new Date(date);
          chosenDate.setHours(0, 0, 0, 0);

          if (chosenDate < today) {
            Swal.showValidationMessage("لا يمكن نسخ اللقاء لتاريخ قديم.");
            return null;
          }
          return date;
        },
      });

      if (!newDate) return;

      setIsLoading(true);

      try {
        const res = await fetch("/api/courses/courseSections/meetings/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: originalMeeting.courseId,
            sectionId: originalMeeting.sectionId,
            instructorId: originalMeeting.instructorId,
            meetingNumber: nextMeetingNumber,
            date: newDate,
            startTime: originalMeeting.startTime,
            endTime: originalMeeting.endTime,
            location: originalMeeting.location,
          }),
        });

        if (!res.ok) throw new Error("فشل نسخ اللقاء");

        const savedMeeting: Meeting = await res.json();
        const newEvent: CalendarEvent = {
          id: savedMeeting.id.toString(),
          title: `لقاء ${savedMeeting.meetingNumber}`,
          start: `${formatDateToYMD(savedMeeting.date)}T${
            savedMeeting.startTime
          }`,
          end: `${formatDateToYMD(savedMeeting.date)}T${savedMeeting.endTime}`,
          extendedProps: {
            isCurrentSection: true,
            sectionId: savedMeeting.sectionId,
          },
        };

        setSectionMeetings((prev) => [...prev, newEvent]);
        setNextMeetingNumber((prev) => prev + 1);
        Swal.fire("تم!", "تم نسخ اللقاء بنجاح", "success");
        router.refresh();
      } catch (error: any) {
        Swal.fire("خطأ", error.message, "error");
      }
      setIsLoading(false);
    },
    [AllMeetings, nextMeetingNumber, router]
  );

  // ✅ النقر على حدث (تعديل/حذف/نسخ) - تم إصلاح منطق الحذف
  const handleEventClick = useCallback(
    async (arg: {
      event: {
        id: string;
        startStr: string;
        endStr: string;
        title: string;
        extendedProps: any;
      };
    }) => {
      const clickedEventId = arg.event.id;
      const originalMeeting = AllMeetings.find(
        (jm) => jm.meetings.id === clickedEventId
      )?.meetings;

      if (!originalMeeting) {
        Swal.fire("خطأ", "لم يتم العثور على تفاصيل هذا اللقاء.", "error");
        return;
      }

      // لا تسمح بتعديل لقاءات الشعب الأخرى
      if (originalMeeting.sectionId !== section.id) {
        Swal.fire({
          title: "معلومات اللقاء",
          html: `
          <div class="text-right">
            <p><strong>اللقاء:</strong> ${arg.event.title}</p>
            <p><strong>التاريخ:</strong> ${new Date(
              arg.event.startStr
            ).toLocaleDateString("ar-EG")}</p>
            <p><strong>الوقت:</strong> ${new Date(
              arg.event.startStr
            ).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })} - ${new Date(arg.event.endStr).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}</p>
            <hr class="my-2">
            <p class="text-sm text-gray-500">هذا اللقاء يخص شعبة أخرى ولا يمكنك تعديله.</p>
          </div>
        `,
          icon: "info",
        });
        return;
      }

      const {
        value: formValues,
        isDenied,
        isDismissed,
      } = await Swal.fire({
        title: "تعديل اللقاء",
        html: `
        <input id="swal-date" type="date" class="swal2-input" value="${formatDateToYMD(
          originalMeeting.date
        )}">
        <input id="swal-start-time" type="time" class="swal2-input" value="${
          originalMeeting.startTime
        }">
        <input id="swal-end-time" type="time" class="swal2-input" value="${
          originalMeeting.endTime
        }">
        <input id="swal-location" class="swal2-input" placeholder="الموقع" value="${
          originalMeeting.location || ""
        }">
      `,
        focusConfirm: false,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "حفظ التعديلات",
        cancelButtonText: "إلغاء",
        denyButtonText: "🗑️ حذف اللقاء",
        footer:
          '<button id="swal-copy-btn" class="text-blue-600 hover:underline">📋 نسخ هذا اللقاء</button>',
        didOpen: () => {
          const copyBtn = document.getElementById("swal-copy-btn");
          if (copyBtn) {
            copyBtn.addEventListener("click", () => {
              Swal.close();
              handleDuplicateMeeting(clickedEventId);
            });
          }
        },
        preConfirm: () => {
          const date = (
            document.getElementById("swal-date") as HTMLInputElement
          ).value;
          const startTime = (
            document.getElementById("swal-start-time") as HTMLInputElement
          ).value;
          const endTime = (
            document.getElementById("swal-end-time") as HTMLInputElement
          ).value;
          const location = (
            document.getElementById("swal-location") as HTMLInputElement
          ).value;

          if (!date || !startTime || !endTime) {
            Swal.showValidationMessage("الرجاء إدخال جميع الحقول المطلوبة.");
            return null;
          }
          if (startTime >= endTime) {
            Swal.showValidationMessage(
              "وقت النهاية يجب أن يكون بعد وقت البداية."
            );
            return null;
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const sectionStart = section.startDate
            ? new Date(section.startDate)
            : today;
          sectionStart.setHours(0, 0, 0, 0);

          const minAllowedDate = sectionStart > today ? sectionStart : today;
          const chosenDate = new Date(date);
          chosenDate.setHours(0, 0, 0, 0);

          if (chosenDate < minAllowedDate) {
            Swal.showValidationMessage(
              `التاريخ المختار لا يمكن أن يكون قبل ${formatDateToYMD(
                minAllowedDate
              )} ${
                minAllowedDate.getTime() === today.getTime()
                  ? "(تاريخ اليوم)"
                  : "(تاريخ بداية الشعبة)"
              }`
            );
            return null;
          }

          return { date, startTime, endTime, location };
        },
      });

      // ✅ منطق الحذف المُصلح - فقط نحذف اللقاء المحدد بعد التأكيد
      if (isDenied) {
        const { isConfirmed } = await Swal.fire({
          title: "هل أنت متأكد؟",
          text: "سيتم حذف هذا اللقاء نهائياً!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "نعم، احذفه!",
          cancelButtonText: "إلغاء",
        });

        if (isConfirmed) {
          setIsLoading(true);
          try {
            const res = await fetch(
              `/api/courses/courseSections/meetings/delete`,
              {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: clickedEventId }),
              }
            );

            if (!res.ok) throw new Error("فشل حذف اللقاء.");

            // تحديث الواجهة
            setSectionMeetings((prev) =>
              prev.filter((event) => event.id !== clickedEventId)
            );

            // ✅ تحديث أرقام اللقاءات بعد الحذف
            await updateMeetingNumbers();

            Swal.fire("تم الحذف!", "تم حذف اللقاء بنجاح.", "success");
            router.refresh();
          } catch (error: any) {
            Swal.fire("خطأ", error.message, "error");
          }
          setIsLoading(false);
        }
        return;
      }

      // إذا أغلق المستخدم النافذة
      if (isDismissed || !formValues) return;

      const { date, startTime, endTime, location } = formValues;

      // التحقق من التعارض (مع تجاهل اللقاء الحالي)
      const startDateTime = new Date(`${date}T${startTime}`).getTime();
      const endDateTime = new Date(`${date}T${endTime}`).getTime();

      const conflictingEvent = combinedEvents.find((event) => {
        if (event.id === clickedEventId) return false;
        const eventDate = event.start.split("T")[0];
        if (eventDate !== date) return false;
        const existingStart = new Date(event.start).getTime();
        const existingEnd = new Date(event.end).getTime();
        return startDateTime < existingEnd && endDateTime > existingStart;
      });

      if (conflictingEvent) {
        Swal.fire(
          "خطأ في التعديل",
          "الوقت الجديد يتعارض مع لقاء آخر.",
          "error"
        );
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(`/api/courses/courseSections/meetings/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: clickedEventId,
            date,
            startTime,
            endTime,
            location,
          }),
        });

        if (!res.ok) throw new Error("فشل تحديث اللقاء.");
        const updatedMeeting: Meeting = await res.json();

        setSectionMeetings((prev) =>
          prev.map((event) =>
            event.id === clickedEventId
              ? {
                  ...event,
                  start: `${date}T${startTime}`,
                  end: `${date}T${endTime}`,
                  title:
                    `لقاء ${updatedMeeting.meetingNumber} - ${location}`.trim(),
                }
              : event
          )
        );
        Swal.fire("تم التحديث!", "تم تعديل اللقاء بنجاح.", "success");
        router.refresh();
      } catch (error: any) {
        Swal.fire("خطأ", error.message, "error");
      }
      setIsLoading(false);
    },
    [AllMeetings, section, combinedEvents, handleDuplicateMeeting, router]
  );

  // ✅ تحديث أرقام اللقاءات بعد الحذف
  const updateMeetingNumbers = useCallback(async () => {
    // سيتم تحديث الأرقام في الخلفية عند الـ refresh
    // يمكن إضافة API خاص لإعادة ترقيم اللقاءات إذا لزم الأمر
  }, []);

  // ✅ حذف جميع اللقاءات (bulk delete)
  const handleDeleteAllMeetings = useCallback(async () => {
    if (sectionMeetings.length === 0) {
      Swal.fire("تنبيه", "لا توجد لقاءات لحذفها", "info");
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "⚠️ تحذير!",
      html: `
        <p class="text-red-600 font-bold">هل أنت متأكد من حذف جميع اللقاءات؟</p>
        <p class="mt-2">سيتم حذف <strong>${sectionMeetings.length}</strong> لقاء نهائياً!</p>
        <p class="text-sm text-gray-500 mt-2">هذا الإجراء لا يمكن التراجع عنه.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف الكل!",
      cancelButtonText: "إلغاء",
    });

    if (!isConfirmed) return;

    setIsLoading(true);

    try {
      const meetingIds = sectionMeetings.map((m) => m.id).filter(Boolean);

      // ✅ استخدام bulk-delete بدلاً من حذف واحد تلو الآخر
      const res = await fetch(
        `/api/courses/courseSections/meetings/bulk-delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: meetingIds }),
        }
      );

      if (!res.ok) throw new Error("فشل حذف اللقاءات");

      setSectionMeetings([]);
      setNextMeetingNumber(1);
      setHasExistingMeetings(false);

      Swal.fire("تم الحذف!", "تم حذف جميع اللقاءات بنجاح.", "success");
      router.refresh();
    } catch (error: any) {
      Swal.fire("خطأ", error.message, "error");
    }
    setIsLoading(false);
  }, [sectionMeetings, router]);

  // ✅ تصدير الجدول
  const handleExport = useCallback(
    async (format: "pdf" | "excel") => {
      if (sectionMeetings.length === 0) {
        Swal.fire("تنبيه", "لا توجد لقاءات للتصدير", "info");
        return;
      }

      if (format === "pdf") {
        exportToPDF(sectionMeetings, section.sectionNumber);
      } else {
        exportToExcel(sectionMeetings, section.sectionNumber);
      }

      Swal.fire({
        icon: "success",
        title: "تم التصدير!",
        text: `تم تصدير الجدول بصيغة ${format === "pdf" ? "PDF" : "Excel"}`,
        timer: 2000,
        timerProgressBar: true,
      });
    },
    [sectionMeetings, section.sectionNumber]
  );

  // ✅ دعم السحب والإفلات لنقل اللقاءات
  const handleEventDrop = useCallback(
    async (arg: {
      event: { id: string; startStr: string; endStr: string };
      revert: () => void;
    }) => {
      const { event, revert } = arg;
      const newDate = event.startStr.split("T")[0];
      const newStartTime = event.startStr.split("T")[1]?.slice(0, 5) || "09:00";
      const newEndTime = event.endStr.split("T")[1]?.slice(0, 5) || "11:00";

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosenDate = new Date(newDate);
      chosenDate.setHours(0, 0, 0, 0);

      if (chosenDate < today) {
        revert();
        Swal.fire("تنبيه", "لا يمكن نقل اللقاء لتاريخ قديم.", "warning");
        return;
      }

      const originalMeeting = AllMeetings.find(
        (jm) => jm.meetings.id === event.id
      )?.meetings;
      if (!originalMeeting || originalMeeting.sectionId !== section.id) {
        revert();
        return;
      }

      // التحقق من التعارض
      const startDateTime = new Date(event.startStr).getTime();
      const endDateTime = new Date(event.endStr).getTime();

      const conflictingEvent = combinedEvents.find((e) => {
        if (e.id === event.id) return false;
        const eventDate = e.start.split("T")[0];
        if (eventDate !== newDate) return false;
        const existingStart = new Date(e.start).getTime();
        const existingEnd = new Date(e.end).getTime();
        return startDateTime < existingEnd && endDateTime > existingStart;
      });

      if (conflictingEvent) {
        revert();
        Swal.fire("خطأ", "يوجد تعارض مع لقاء آخر في هذا الموعد.", "error");
        return;
      }

      try {
        const res = await fetch(`/api/courses/courseSections/meetings/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: event.id,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            location: originalMeeting.location,
          }),
        });

        if (!res.ok) {
          revert();
          throw new Error("فشل تحديث موعد اللقاء.");
        }

        Swal.fire({
          icon: "success",
          title: "تم النقل!",
          text: "تم تحديث موعد اللقاء بنجاح",
          timer: 2000,
          timerProgressBar: true,
        });
        router.refresh();
      } catch (error: any) {
        revert();
        Swal.fire("خطأ", error.message, "error");
      }
    },
    [AllMeetings, section, combinedEvents, router]
  );

  return {
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
    handleDuplicateMeeting,
  };
};
