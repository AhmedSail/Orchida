"use client";
import React, { useState } from "react";
import { InferSelectModel } from "drizzle-orm";
import { mediaFiles, works } from "@/src/db/schema";
import WorksTable from "./worksTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
export type Work = InferSelectModel<typeof works>;

// يمثل صف واحد من جدول mediaFiles
export type MediaFile = InferSelectModel<typeof mediaFiles>;
export type WorkWithMedia = Work & {
  mediaFiles: MediaFile[];
};

const AllWorkstable = ({
  allWorks,
  userId,
}: {
  allWorks: WorkWithMedia[];
  userId: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddWork = () => {
    setLoading(true); // ✅ إظهار السبينر
    router.push(`/admin/${userId}/works/new`);
  };

  return (
    <div>
      <div className="flex justify-between items-center my-4">
        <h2 className="text-xl font-bold mb-4 text-primary">
          📋 قائمة الأعمال
        </h2>
        <Button
          variant="default"
          onClick={handleAddWork}
          disabled={loading} // ✅ تعطيل الزر أثناء التحميل
          className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
            </>
          ) : (
            "إضافة عمل جديد"
          )}
        </Button>
      </div>
      <WorksTable allWorks={allWorks} userId={userId} />
    </div>
  );
};

export default AllWorkstable;
