"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message ?? "خطأ غير متوقع");
      return;
    }

    setMessage("تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين.");
  };

  return (
    <div
      className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow"
      dir="rtl"
    >
      <h1 className="text-2xl font-bold mb-4 text-center">
        إعادة تعيين كلمة المرور
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="أدخل بريدك الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
        </Button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
      )}
    </div>
  );
}
