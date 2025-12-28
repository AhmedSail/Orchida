import { Instructor } from "@/app/admin/[adminId]/instructor/page";
import React from "react";
type Section = {
  sectionId: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
};
type Meeting = {
  meetingId: string;
  meetingDate: Date;
  meetingStartTime: string;
  meetingEndTime: string;
  meetingNotes: string | null;
  sectionId: string | null;
  sectionNumber: number | null;
  courseTitle: string | null;
};
const HomeInstructor = ({
  instructorRecord,
  instructorSections,
  instructorMeetings,
}: {
  instructorRecord: Instructor;
  instructorSections: Section[];
  instructorMeetings: Meeting[];
}) => {
  console.log(instructorSections);
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="md:flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">
          مرحبًا {instructorRecord.name} 👋، هذه نظرة عامة على نشاطك
        </p>
      </header>

      {/* معلومات شخصية */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold">{instructorRecord.name}</h2>
        <p className="text-gray-600">{instructorRecord.specialty}</p>
        <p className="text-sm text-gray-500">
          خبرة: {instructorRecord.experienceYears} سنوات
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-primary text-white p-4 rounded">
          الشعب الخاصة بي: {instructorSections.length}
        </div>
        <div className="bg-secondary text-white p-4 rounded">
          👨‍🎓 الطلاب: 200
        </div>
        <div className="bg-[#F6C100] text-black p-4 rounded">
          🗓️ المحاضرات القادمة: {instructorMeetings.length}
        </div>
      </div>

      {/* الجدول الزمني */}
      <div>
        <h3 className="text-lg font-semibold mb-2">📅 جدول اللقاءات القادمة</h3>
        {instructorMeetings.length > 0 ? (
          <ul className="space-y-2">
            {instructorMeetings.slice(0, 3).map((meeting) => (
              <li key={meeting.meetingId} className="p-3 bg-gray-100 rounded">
                {new Date(meeting.meetingDate).toLocaleDateString("ar-EG")} -{" "}
                {meeting.meetingEndTime} - {meeting.meetingStartTime} -{" "}
                {meeting.courseTitle} (شعبة {meeting.sectionNumber})
                {meeting.meetingNotes && (
                  <p className="text-sm text-gray-500 mt-1">
                    ملاحظات: {meeting.meetingNotes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">لا يوجد لقاءات قادمة حالياً</p>
        )}
      </div>

      {/* الدورات */}
      <div>
        <h3 className="text-lg font-semibold mb-2">📚 دوراتي</h3>
        <div className="grid grid-cols-2 gap-4">
          {instructorSections.map((section) => (
            <div
              key={section.sectionId}
              className="p-4 bg-white shadow rounded"
            >
              <h4 className="font-bold">{section.courseTitle}</h4>
              <p className="text-sm text-gray-600">
                رقم الشعبة: {section.sectionNumber}
              </p>
              <p className="text-sm text-gray-500">
                من{" "}
                {section.startDate
                  ? new Date(section.startDate).toLocaleDateString()
                  : "—"}
                إلى{" "}
                {section.endDate
                  ? new Date(section.endDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeInstructor;
