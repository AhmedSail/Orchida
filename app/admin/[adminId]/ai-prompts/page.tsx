import React from "react";
import AiPromptsDashboard from "@/components/admin/aiPrompts/AiPromptsDashboard";

export const metadata = {
  title: "مكتبة مطالبات AI | الإدارة",
  description: "إدارة الأوامر الجاهزة (Prompts) لتوليد الصور والفيديوهات.",
};

export default function AdminAiPromptsPage() {
  return <AiPromptsDashboard />;
}
