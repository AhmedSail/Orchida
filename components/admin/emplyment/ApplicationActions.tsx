"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { deleteApplication } from "@/app/actions/jobs";
import { toast } from "sonner";

export default function ApplicationActions({
  applicationId,
}: {
  applicationId: string;
}) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذا الطلب بعد حذفه!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await deleteApplication(applicationId);
        Swal.fire("تم الحذف!", "تم حذف الطلب بنجاح.", "success");
      } catch (error) {
        console.error(error);
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      title="حذف الطلب"
    >
      <Trash2 size={16} />
    </Button>
  );
}
