"use client";
import { useState, useEffect } from "react";
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
  useEffect(() => {
    const archivePastMeetings = async () => {
      // 1. تحديد تاريخ اليوم (بدون معلومات الوقت)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 2. فلترة اللقاءات التي انتهت قبل اليوم الحالي
      const pastMeetingsToArchive = AllMeetings.filter((jm) => {
        if (jm.meetings.sectionId !== section.id) {
          return false;
        }
        const meetingDate = new Date(jm.meetings.date);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate < today;
      });

      // 3. إذا لم يكن هناك لقاءات قديمة، لا تفعل شيئاً
      if (pastMeetingsToArchive.length === 0) {
        return;
      }

      // 4. استدعاء API لتحديث اللقاءات القديمة كـ archived
      try {
        const meetingIdsToArchive = pastMeetingsToArchive.map(
          (jm) => jm.meetings.id
        );

        const res = await fetch(
          `/api/courses/courseSections/meetings/bulk-archive`, // 👈 API جديد للأرشفة
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: meetingIdsToArchive }),
          }
        );

        if (!res.ok) {
          console.error("Failed to archive past meetings in the database.");
        } else {
         
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]); // يتم تشغيل هذا التأثير مرة واحدة عند تحميل المكون
  // --- نهاية التعديل ---
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

  const chooseDaysGroup = async () => {
    // ... (الكود هنا لم يتغير)
  };

  // 📍 المسار: src/components/MeetingScheduler/useMeetingScheduler.ts

  // ... (باقي الكود في الملف يبقى كما هو)

  const handleAutoSchedule = async () => {
    if (hasExistingMeetings) {
      Swal.fire(
        "لا يمكن المتابعة",
        "هذه الشعبة لديها بالفعل لقاءات مجدولة. لا يمكن إجراء جدولة تلقائية مرة أخرى.",
        "warning"
      );
      return;
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
        <div id="swal-days-container" class="flex justify-center gap-2 mb-3">
          <label><input type="checkbox" class="swal2-checkbox" value="6"> السبت</label>
          <label><input type="checkbox" class="swal2-checkbox" value="0"> الأحد</label>
          <label><input type="checkbox" class="swal2-checkbox" value="1"> الاثنين</label>
          <label><input type="checkbox" class="swal2-checkbox" value="2"> الثلاثاء</label>
          <label><input type="checkbox" class="swal2-checkbox" value="3"> الأربعاء</label>
          <label><input type="checkbox" class="swal2-checkbox" value="4"> الخميس</label>
        </div>
        <input id="swal-start-date" type="date" class="swal2-input" placeholder="تاريخ بدء الجدولة">
        <input id="swal-start-time" type="time" class="swal2-input" value="09:00">
        <input id="swal-total-meetings" type="number" class="swal2-input" placeholder="عدد اللقاءات الإجمالي (مثال: 15)">
        <div class="mt-3 p-3 bg-blue-50 rounded">
          <p class="text-sm text-blue-800">
            <strong>عدد الساعات في الكورس:</strong> ${courseHours} ساعة  

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
        // ✅ تحقق أن تاريخ بداية الجدولة >= تاريخ بداية الشعبة
        const sectionStartDate = new Date(section.startDate ?? ""); // تاريخ بداية الشعبة من DB
        const chosenStartDate = new Date(startDate);

        if (chosenStartDate < sectionStartDate) {
          Swal.showValidationMessage(
            `تاريخ بداية الجدولة (${startDate}) يجب أن يكون بعد أو يساوي تاريخ بداية الشعبة (${formatDateToYMD(
              sectionStartDate
            )}).`
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
    let conflictFoundAndReported = false; // متغير لمنع تكرار رسالة الخطأ

    while (meetingsCount < totalMeetings && !conflictFoundAndReported) {
      safetyBreak++;
      if (safetyBreak > 365) {
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
        // --- بداية التعديل الرئيسي ---
        // 1. استخدم `find` بدلاً من `some` للحصول على تفاصيل اللقاء المتعذر
        const conflictingEvent = combinedEvents.find((event) => {
          const eventDate = event.start.split("T")[0];
          if (eventDate !== dateStr) {
            return false;
          }
          const existingStart = new Date(event.start).getTime();
          const existingEnd = new Date(event.end).getTime();
          const newStart = startDateTime.getTime();
          const newEnd = endDateTime.getTime();
          return newStart < existingEnd && newEnd > existingStart;
        });

        // 2. تحقق مما إذا تم العثور على تعارض
        if (conflictingEvent) {
          // 3. ابحث عن تفاصيل اللقاء الأصلي من `AllMeetings`
          const originalMeetingDetails = AllMeetings.find(
            (jm) => jm.meetings.id === conflictingEvent.id
          );

          // 4. اعرض رسالة خطأ واضحة ومفصلة
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
                  <p><strong>الوقت:</strong> ${
                    conflictingEvent.start.split("T")[1]
                  } - ${conflictingEvent.end.split("T")[1]}</p>
                </div>
                <p class="text-red-600">سيتم إيقاف الجدولة. يرجى اختيار موعد بدء أو أيام مختلفة.</p>
              </div>
            `,
            icon: "warning",
            confirmButtonText: "حسناً",
          });
          conflictFoundAndReported = true; // أوقف الحلقة
          // --- نهاية التعديل الرئيسي ---
        } else {
          // لا يوجد تعارض، أضف اللقاء
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

      // انتقل إلى اليوم التالي فقط إذا لم يتم إيقاف الحلقة
      if (!conflictFoundAndReported) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // لا تستمر إذا تم العثور على تعارض أو لم يتم توليد أي لقاءات
    if (conflictFoundAndReported || generatedMeetings.length === 0) {
      return;
    }

    // ... (باقي الكود الخاص بعرض ومراجعة وحفظ اللقاءات يبقى كما هو)
    const reviewHtml = generatedMeetings
      .map((m) => `<li>${m.date} (${m.startTime} - ${m.endTime})</li>`)
      .join("");
    const { isConfirmed } = await Swal.fire({
      title: `تم توليد ${generatedMeetings.length} لقاء بنجاح`,
      html: `<p>هل تود حفظ هذه اللقاءات؟</p><ul class="text-right list-disc pr-5 mt-3">${reviewHtml}</ul>`,
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
  };
  const handleManualAdd = async (arg: { dateStr: string }) => {
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
        // ✅ تحقق أن تاريخ بداية الجدولة >= تاريخ بداية الشعبة
        const sectionStartDate = new Date(section.startDate ?? ""); // تاريخ بداية الشعبة من DB
        const chosenStartDate = new Date(startDate);

        if (chosenStartDate < sectionStartDate) {
          Swal.showValidationMessage(
            `تاريخ بداية الجدولة (${startDate}) يجب أن يكون بعد أو يساوي تاريخ بداية الشعبة (${formatDateToYMD(
              sectionStartDate
            )}).`
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

    // تجهيز بيانات اللقاء الجديد
    const newMeetingData = {
      courseId: section.courseId,
      sectionId: section.id,
      instructorId: section.instructorId,
      meetingNumber: nextMeetingNumber,
      date: dateStr,
      startTime,
      endTime,
      location,
      // استخدم العنوان المدخل أو عنوان افتراضي
      title: title || `لقاء ${nextMeetingNumber}`,
    };

    // حفظ اللقاء في قاعدة البيانات
    try {
      const res = await fetch("/api/courses/courseSections/meetings/add", {
        // 👈 افترضنا وجود هذا الـ API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeetingData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل حفظ اللقاء.");
      }

      const savedMeeting: Meeting = await res.json();

      // تحديث الحالة في الواجهة
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
      Swal.fire("تم الحفظ!", "تمت إضافة اللقاء بنجاح.", "success");
      router.push(`/coordinator/${userId}/courses/sections/meetings`);
    } catch (error: any) {
      Swal.fire("خطأ", error.message, "error");
    }
  };
  const handleEventClick = async (arg: {
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
                })} - ${new Date(arg.event.endStr).toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
                <hr class="my-2">
                <p class="text-sm text-gray-500">هذا اللقاء يخص شعبة أخرى ولا يمكنك تعديله.</p>
              </div>
            `,
        icon: "info",
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
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
      showDenyButton: true, // 👈 زر الحذف
      confirmButtonText: "حفظ التعديلات",
      cancelButtonText: "إلغاء",
      denyButtonText: "🗑️ حذف اللقاء",
      preConfirm: () => {
        const date = (document.getElementById("swal-date") as HTMLInputElement)
          .value;
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
        return { date, startTime, endTime, location };
      },
    });

    // --- منطق الحذف ---
    if (formValues === false) {
      // ✅ تحقق أن تاريخ بداية الجدولة >= تاريخ بداية الشعبة
      // احسب تاريخ اليوم (بدون وقت)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // فلترة اللقاءات القديمة
      const pastMeetings = sectionMeetings.filter((event) => {
        const eventDate = new Date(event.start.split("T")[0]); // نفترض أن start فيه التاريخ
        return eventDate < today;
      });

      // لو فيه لقاءات قديمة، احذفها من DB
      for (const meeting of pastMeetings) {
        try {
          const res = await fetch(
            `/api/courses/courseSections/meetings/delete`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: meeting.id }),
            }
          );

          if (res.ok) {
            // تحديث الواجهة
            setSectionMeetings((prev) =>
              prev.filter((ev) => ev.id !== meeting.id)
            );
            
          } else {
           
          }
        } catch (error) {
          console.error("Error deleting meeting:", error);
        }
      }
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
        try {
          // افترضنا وجود هذا الـ API
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
          Swal.fire("تم الحذف!", "تم حذف اللقاء بنجاح.", "success");
          router.push(`/coordinator/${userId}/courses/sections/meetings`);
        } catch (error: any) {
          Swal.fire("خطأ", error.message, "error");
        }
      }
      return;
    }

    // --- منطق التعديل ---
    if (!formValues) return; // إذا أغلق المستخدم النافذة

    const { date, startTime, endTime, location } = formValues;

    // التحقق من التعارض (مع تجاهل اللقاء الحالي)
    const startDateTime = new Date(`${date}T${startTime}`).getTime();
    const endDateTime = new Date(`${date}T${endTime}`).getTime();

    const conflictingEvent = combinedEvents.find((event) => {
      if (event.id === clickedEventId) return false; // 👈 تجاهل اللقاء نفسه
      const eventDate = event.start.split("T")[0];
      if (eventDate !== date) return false;

      const existingStart = new Date(event.start).getTime();
      const existingEnd = new Date(event.end).getTime();
      return startDateTime < existingEnd && endDateTime > existingStart;
    });

    if (conflictingEvent) {
      Swal.fire("خطأ في التعديل", "الوقت الجديد يتعارض مع لقاء آخر.", "error");
      return;
    }

    // حفظ التعديلات في قاعدة البيانات
    try {
      // افترضنا وجود هذا الـ API
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
      router.push(`/coordinator/${userId}/courses/sections/meetings`);
    } catch (error: any) {
      Swal.fire("خطأ", error.message, "error");
    }
  };
  // ... (باقي الكود في الملف يبقى كما هو)

  return {
    combinedEvents,
    hasExistingMeetings,
    handleAutoSchedule,
    chooseDaysGroup,
    handleManualAdd,
    handleEventClick,
  };
};
