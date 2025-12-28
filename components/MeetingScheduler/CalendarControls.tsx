// 📍 src/components/MeetingScheduler/CalendarControls.tsx

import React from "react";

interface CalendarControlsProps {
  hasExistingMeetings: boolean;
  onAutoSchedule: () => void;
  onManualSchedule: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  hasExistingMeetings,
  onAutoSchedule,
  onManualSchedule,
}) => {
  return (
    <>
      <div className="mb-4 text-center flex justify-center gap-4">
        <button
          onClick={onAutoSchedule}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={hasExistingMeetings}
        >
          جدولة تلقائية
        </button>
        <button
          onClick={onManualSchedule}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={hasExistingMeetings}
        >
          جدولة يدوية (اختر الأيام)
        </button>
      </div>
      {hasExistingMeetings && (
        <p className="text-center text-sm text-red-600 mb-4">
          لا يمكن استخدام الجدولة لوجود لقاءات مجدولة بالفعل لهذه الشعبة.
        </p>
      )}
    </>
  );
};

export default CalendarControls;
