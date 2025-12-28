"use client";
import React, { useState } from "react";

interface Student {
  id: string;
  studentName: string;
  studentEmail: string;
}
interface Meeting {
  id: string;
  meetingNumber: number;
  date: Date;
}
interface AttendanceRecord {
  studentId: string | null;
  meetingId: string | null;
  status: "present" | "absent" | "excused";
}

interface Props {
  students: Student[];
  meetings: Meeting[];
  attendance: AttendanceRecord[]; // ✅ بيانات الحضور جاهزة من الـ DB
}

const AttendanceTableOfCor = ({ students, meetings, attendance }: Props) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMeetingId(e.target.value);
  };

  // ترتيب اللقاءات
  const sortedMeetings = [...meetings].sort(
    (a, b) => a.meetingNumber - b.meetingNumber
  );

  const selectedMeeting = sortedMeetings.find(
    (m) => m.id === selectedMeetingId
  );

  // ✅ فلترة الحضور حسب اللقاء المختار
  const meetingAttendance = attendance.filter(
    (rec) => rec.meetingId === selectedMeetingId
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold mb-4">📋 جدول الحضور والغياب</h1>

      {/* قائمة اختيار اللقاء */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">اختر اللقاء:</label>
        <select
          value={selectedMeetingId}
          onChange={handleSelectChange}
          className="border rounded p-2"
        >
          <option value="">-- اختر لقاء --</option>
          {sortedMeetings.map((m) => (
            <option key={m.id} value={m.id}>
              لقاء {m.meetingNumber} - 📅{" "}
              {new Date(m.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* عرض الطلاب وحالتهم */}
      {selectedMeeting ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-right">👤 الطالب</th>
                <th className="border p-2 text-right">📧 البريد الإلكتروني</th>
                <th className="border p-2 text-center">📌 الحالة</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => {
                const record = meetingAttendance.find(
                  (rec) => rec.studentId === st.id
                );
                const status = record?.status ?? "غير مسجل";
                return (
                  <tr key={st.id}>
                    <td className="border p-2">{st.studentName}</td>
                    <td className="border p-2">{st.studentEmail}</td>
                    <td className="border p-2 text-center">
                      {status === "present"
                        ? "✔️ حاضر"
                        : status === "absent"
                        ? "❌ غائب"
                        : "⚠️ غير مسجل"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">⚠️ الرجاء اختيار لقاء لعرض الحضور</p>
      )}
    </div>
  );
};

export default AttendanceTableOfCor;
