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
      setMessage(error.message ?? "Unexpected error");
      return;
    }

    setMessage("Check your email for the reset link.");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
