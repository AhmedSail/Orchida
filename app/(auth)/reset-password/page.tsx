"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Link } from "next-view-transitions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage("رمز التحقق مفقود أو غير صالح.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message ?? "خطأ غير متوقع");
      return;
    }

    setMessage("تم إعادة تعيين كلمة المرور بنجاح. جارٍ التحويل...");
    router.push("/sign-in");
  };

  return (
    <div dir="rtl">
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={200}
          height={200}
          className="block mx-auto"
          unoptimized
        />
      </Link>
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          تعيين كلمة مرور جديدة
        </h1>

        {!token ? (
          <p className="text-destructive text-center">
            رابط إعادة التعيين غير صالح أو منتهي الصلاحية.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}
