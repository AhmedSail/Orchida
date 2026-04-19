"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function sendChatMessageAction(messages: ChatMessage[]) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "OpenAI API key not configured" };
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content: `أنت مساعد ذكاء اصطناعي متخصص تابع لشركة أوركيدة للخدمات الرقمية. 
      أنت تساعد المستخدمين في مجالات التصميم، الذكاء الاصطناعي، التسويق الرقمي، والبرمجة.
      كن ودوداً، دقيقاً، ومفيداً. يمكنك الرد باللغة العربية أو الإنجليزية حسب لغة المستخدم.
      تجنب الإجابة على أسئلة غير لائقة أو خارج نطاق عمل الشركة.`,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [systemMessage, ...messages],
        max_completion_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenAI error:", errBody);
      return { success: false, error: "فشل الاتصال بخدمة الذكاء الاصطناعي" };
    }

    const data = await response.json();
    console.log("OpenAI raw response:", JSON.stringify(data).substring(0, 500));

    // GPT-5 uses Responses API format: output[0].content[0].text
    // Classic GPT-4 format: choices[0].message.content
    const reply =
      data.output?.[0]?.content?.[0]?.text?.trim() ||
      data.choices?.[0]?.message?.content?.trim() ||
      null;

    if (!reply) {
      console.error("Could not extract reply from:", JSON.stringify(data));
      return { success: false, error: "لم يتم الحصول على رد" };
    }

    return { success: true, reply };
  } catch (error: any) {
    console.error("Chat Action Error:", error);
    return { success: false, error: error.message };
  }
}
