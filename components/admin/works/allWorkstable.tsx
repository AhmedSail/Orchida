"use client";
import React, { useState } from "react";
import { InferSelectModel } from "drizzle-orm";
import { works } from "@/src/db/schema";
import WorksTable from "./worksTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

// ✅ تعريف النوع بشكل صحيح
export type Work = InferSelectModel<typeof works>;

const AllWorkstable = ({
  allWorks,
}: {
  allWorks: (Work & {
    mainMedia?: { url: string; type: string; publicId?: string } | null;
  })[];
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddWork = () => {
    setLoading(true); // ✅ إظهار السبينر
    router.push("/admin/works/new");
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
      <WorksTable allWorks={allWorks} />
    </div>
  );
};

export default AllWorkstable;
