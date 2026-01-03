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
      setMessage("Invalid or missing token.");
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
      setMessage(error.message ?? "Unexpected error");
      return;
    }

    setMessage("Password reset successfully. Redirecting...");
    router.push("/sign-in");
  };

  return (
    <div>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={300}
          height={300}
          className="block mx-auto"
          unoptimized
        />
      </Link>
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>

        {!token ? (
          <p className="text-red-500">Invalid or expired reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
