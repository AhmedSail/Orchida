"use client";

import { deleteJob, toggleJobStatus } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, Trash2, Power, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function JobActions({
  jobId,
  adminId,
  isActive,
}: {
  jobId: string;
  adminId: string;
  isActive: boolean;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء! سيتم حذف الوظيفة وجميع الطلبات المرتبطة بها.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفها!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await deleteJob(jobId);
        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف الوظيفة بنجاح.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        router.refresh();
      } catch (error) {
        Swal.fire({
          title: "خطأ!",
          text: "حدث خطأ أثناء عملية الحذف.",
          icon: "error",
        });
      }
    }
  };

  const handleToggle = async () => {
    try {
      await toggleJobStatus(jobId, isActive);
      toast.success(isActive ? "تم إلغاء تفعيل الوظيفة" : "تم تفعيل الوظيفة");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء تغيير الحالة");
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/admin/${adminId}/employment/${jobId}/applications`}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 text-blue-600"
          title="عرض الطلبات"
        >
          <Users size={16} />
        </Button>
      </Link>

      <Link href={`/admin/${adminId}/employment/${jobId}/edit`}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <Edit size={16} />
        </Button>
      </Link>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={`h-8 w-8 p-0 border-gray-200 hover:bg-gray-50 ${isActive ? "text-green-600" : "text-gray-400"}`}
        title={isActive ? "إلغاء التفعيل" : "تفعيل"}
      >
        <Power size={16} />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
