"use client";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export function useLogout(authClient: any, closeMenu?: () => void) {
  const router = useRouter();

  const logout = async () => {
    try {
      // تسجيل الخروج من الـ Auth
      await authClient.signOut();
      window.location.reload();
      // إغلاق القائمة إذا فيه دالة مرسلة
      if (closeMenu) {
        closeMenu();
      }

      // عرض سويت أليرت
      await Swal.fire({
        title: "تم تسجيل الخروج",
        text: "نراك قريباً 👋",
        icon: "success",
        confirmButtonText: "موافق",
      });

      // إعادة التوجيه لصفحة تسجيل الدخول أو الرئيسية
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);

      // عرض خطأ في حال فشل تسجيل الخروج
      Swal.fire({
        title: "خطأ",
        text: "فشل تسجيل الخروج، حاول مرة أخرى",
        icon: "error",
        confirmButtonText: "موافق",
      });
    }
  };

  return logout;
}
