"use client";
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { Button } from "./ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Student {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
}
interface Meeting {
  id: string;
  meetingNumber: number;
  date: Date;
}
interface AttendanceRecord {
  enrollmentId: string | null;
  meetingId: string | null;
  status: "present" | "absent" | "excused";
}

interface Props {
  students: Student[];
  meetings: Meeting[];
  attendanceRecords: AttendanceRecord[];
}

const AttendanceTable = ({ students, meetings, attendanceRecords }: Props) => {
  const [attendance, setAttendance] = useState<{
    [studentId: string]: { [meetingId: string]: boolean };
  }>({});
  const [loading, setLoading] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null
  );

  const tableRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    studentId: string,
    meetingId: string,
    checked: boolean
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [meetingId]: checked,
      },
    }));
  };

  const saveAttendance = async (meetingId: string) => {
    setLoading(true);

    const records = students
      .map((st) => {
        const status = attendance[st.id]?.[meetingId];
        if (status === undefined) return null;
        return {
          meetingId,
          enrollmentId: st.id,
          status: status ? "present" : "absent",
        };
      })
      .filter(Boolean);

    if (records.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ تنبيه",
        text: "لم يتم اختيار أي حالة حضور لهذا اللقاء",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/attendance/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "فشل الحفظ");
      }

      Swal.fire({
        icon: "success",
        title: "تم الحفظ ✅",
        text: "تم تسجيل وتحديث الحضور لهذا اللقاء",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "فشل الحفظ ❌",
        text: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedMeetings = [...meetings].sort(
    (a, b) => a.meetingNumber - b.meetingNumber
  );
  const selectedMeeting = sortedMeetings.find(
    (m) => m.id === selectedMeetingId
  );

  return (
    <div className="space-y-8">
      {/* اختيار اللقاء */}
      <div className="mb-4">
        <label className="font-bold">اختر اللقاء:</label>
        <select
          className="border p-2 ml-2 rounded-md"
          value={selectedMeetingId ?? ""}
          onChange={(e) => setSelectedMeetingId(e.target.value)}
        >
          <option value="">-- اختر لقاء --</option>
          {sortedMeetings.map((m) => (
            <option key={m.id} value={m.id}>
              لقاء {m.meetingNumber} - {m.date.toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedMeeting ? (
        <div className="bg-white shadow-lg rounded-lg p-6 border max-w-full">
          {/* عنوان اللقاء */}
          <h2 className="text-xl font-semibold mb-6 text-center">
            لقاء {selectedMeeting.meetingNumber} - 📅{" "}
            {selectedMeeting.date.toLocaleDateString()}
          </h2>

          {/* ✅ جدول للـ Laptop (شاشات كبيرة) */}
          <div className="hidden lg:block overflow-x-auto" ref={tableRef}>
            <table
              className="min-w-full border-collapse rounded-lg shadow-sm text-sm sm:text-base"
              dir="rtl"
            >
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="border p-3 text-right font-semibold">
                    👤 الطالب
                  </th>
                  <th className="border p-3 text-right font-semibold">
                    📧 البريد الإلكتروني
                  </th>
                  <th className="border p-3 text-right font-semibold">
                    📱 الهاتف
                  </th>
                  <th className="border p-3 text-center font-semibold">
                    ✅ حالة الحضور
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, index) => {
                  const existingRecord = attendanceRecords.find(
                    (rec) =>
                      rec.enrollmentId === st.id &&
                      rec.meetingId === selectedMeeting.id
                  );

                  let statusFromDb: "present" | "absent" | "excused" | null =
                    existingRecord ? existingRecord.status : null;

                  const statusFromState =
                    attendance[st.id]?.[selectedMeeting.id];
                  const finalStatus =
                    statusFromState !== undefined
                      ? statusFromState
                      : statusFromDb === "present";

                  return (
                    <tr
                      key={st.id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="border p-3">{st.studentName}</td>
                      <td className="border p-3">{st.studentEmail}</td>
                      <td className="border p-3">{st.studentPhone ?? ""}</td>
                      <td className="border p-3 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <Checkbox
                            checked={finalStatus}
                            onCheckedChange={(checked) =>
                              handleChange(st.id, selectedMeeting.id, !!checked)
                            }
                          />
                          {finalStatus && (
                            <span className="text-green-600 font-bold">
                              ✔️ حاضر
                            </span>
                          )}
                          {!finalStatus && statusFromDb === "absent" && (
                            <span className="text-red-600 font-bold">
                              ❌ غائب
                            </span>
                          )}
                          {!finalStatus && statusFromDb === "excused" && (
                            <span className="text-blue-600 font-bold">
                              📘 معذور
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ كاردات للموبايل والآيباد */}
          <div className="lg:hidden grid grid-cols-1  gap-4 mt-4">
            {students.map((st) => {
              const existingRecord = attendanceRecords.find(
                (rec) =>
                  rec.enrollmentId === st.id &&
                  rec.meetingId === selectedMeeting.id
              );

              let statusFromDb: "present" | "absent" | "excused" | null =
                existingRecord ? existingRecord.status : null;

              const statusFromState = attendance[st.id]?.[selectedMeeting.id];
              const finalStatus =
                statusFromState !== undefined
                  ? statusFromState
                  : statusFromDb === "present";

              return (
                <div
                  key={st.id}
                  className="border rounded-lg shadow-sm p-4 bg-gray-50"
                >
                  <h3 className="font-bold text-lg">{st.studentName}</h3>
                  <p className="text-sm text-gray-600">📧 {st.studentEmail}</p>
                  <p className="text-sm text-gray-600">
                    📱 {st.studentPhone ?? "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      checked={finalStatus}
                      onCheckedChange={(checked) =>
                        handleChange(st.id, selectedMeeting.id, !!checked)
                      }
                    />
                    {finalStatus && (
                      <span className="text-green-600 font-bold">✔️ حاضر</span>
                    )}
                    {!finalStatus && statusFromDb === "absent" && (
                      <span className="text-red-600 font-bold">❌ غائب</span>
                    )}
                    {!finalStatus && statusFromDb === "excused" && (
                      <span className="text-blue-600 font-bold">📘 معذور</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* الأزرار */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => saveAttendance(selectedMeeting.id)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "⏳ جاري الحفظ..." : "💾 حفظ الحضور"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center">لا يوجد لقاءات مختارة</div>
      )}
    </div>
  );
};

export default AttendanceTable;
