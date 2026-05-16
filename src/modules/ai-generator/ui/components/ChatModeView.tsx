"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  Zap,
  Gift,
  Paperclip,
  FileText,
  X,
} from "lucide-react";
import { sendChatMessageAction, ChatMessage } from "@/app/actions/ai-chat";
import {
  getChatSettingsAction,
  getChatUsageAction,
  consumeChatMessageAction,
  refundChatMessageAction,
} from "@/app/actions/ai-chat-settings";
import { toast } from "sonner";

interface MessageAttachment {
  name: string;
  type: string;
  url: string;
  file?: File;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: MessageAttachment[];
}

interface ChatModeViewProps {
  userBalance?: number | null;
}

export default function ChatModeView({ userBalance }: ChatModeViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat pricing state
  const [freeLimit, setFreeLimit] = useState(5);
  const [costPerMsg, setCostPerMsg] = useState(2);
  const [usedCount, setUsedCount] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [settings, usage] = await Promise.all([
        getChatSettingsAction(),
        getChatUsageAction(),
      ]);
      setFreeLimit(settings.freeMessages);
      setCostPerMsg(settings.creditsPerMessage);
      setUsedCount(usage.messageCount);
      setSettingsLoaded(true);
    };
    load();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const freeRemaining = Math.max(0, freeLimit - usedCount);
  const isPaidMode = usedCount >= freeLimit;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    const consumeRes = await consumeChatMessageAction();
    if (!consumeRes.success) {
      toast.error(consumeRes.error || "فشل التحقق من الرصيد");
      return;
    }

    setUsedCount((prev) => prev + 1);
    if (!consumeRes.wasFree && consumeRes.creditDeducted) {
      window.dispatchEvent(new Event("balanceUpdated"));
    }

    const newAttachments: MessageAttachment[] = attachments.map((f) => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
      file: f,
    }));

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
      attachments: newAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      const buildContent = async (msg: Message): Promise<string | any[]> => {
        if (!msg.attachments || msg.attachments.length === 0) {
          return msg.content || "مرفق";
        }

        const contentArr: any[] = [];
        if (msg.content) {
          contentArr.push({ type: "text", text: msg.content });
        }

        for (const att of msg.attachments) {
          if (att.type.startsWith("image/") && att.file) {
            const base64 = await fileToBase64(att.file);
            contentArr.push({
              type: "image_url",
              image_url: { url: base64 },
            });
          } else {
            contentArr.push({ type: "text", text: `[ملف مرفق: ${att.name}]` });
          }
        }
        return contentArr;
      };

      const history: ChatMessage[] = [];
      for (const m of messages) {
        history.push({
          role: m.role,
          content: await buildContent(m),
        });
      }
      history.push({ role: "user", content: await buildContent(userMessage) });

      const res = await sendChatMessageAction(history);

      if (res.success && res.reply) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        if (!consumeRes.wasFree) {
          await refundChatMessageAction(res.error || "AI Reply Failed");
          window.dispatchEvent(new Event("balanceUpdated"));
        }
        toast.error(res.error || "فشل الحصول على رد");
      }
    } catch (e: any) {
      if (!consumeRes.wasFree) {
        await refundChatMessageAction(e.message || "Technical Error");
        window.dispatchEvent(new Event("balanceUpdated"));
      }
      toast.error("حدث خطأ تقني");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => setMessages([]);

  const suggestions = [
    "كيف أحسّن استراتيجية التسويق الرقمي لمشروعي؟",
    "ما هي أفضل ممارسات تصميم واجهة المستخدم؟",
    "اشرح لي كيف يعمل الذكاء الاصطناعي بشكل مبسط",
    "ساعدني في كتابة محتوى لوسائل التواصل الاجتماعي",
  ];

  return (
    <div
      className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-250px)] max-w-5xl mx-auto px-4"
      dir="rtl"
    >
      {/* Header Container - Light Studio */}
      <div className="bg-white border border-zinc-200 rounded-3xl md:rounded-[2.5rem] p-4 md:p-6 mb-4 md:mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-60" />
        <div className="flex items-center gap-3 md:gap-4">
          <div className="size-10 md:size-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
            <Bot className="size-5 md:size-6" />
          </div>
          <div>
            <h2 className="font-black text-zinc-900 text-sm md:text-base leading-tight">
              مساعد أوركيدة{" "}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {settingsLoaded && (
            <div
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black border transition-all ${
                isPaidMode
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}
            >
              {isPaidMode ? (
                <>
                  <Zap className="size-2.5 md:size-3" />
                  {costPerMsg} CR
                </>
              ) : (
                <>
                  <Gift className="size-2.5 md:size-3" />
                  {freeRemaining} FREE
                </>
              )}
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="size-9 md:size-10 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <Trash2 className="size-4 md:size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-8 scrollbar-hide pb-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in zoom-in-95 duration-1000">
            <div className="size-16 md:size-24 rounded-3xl md:rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-6 md:mb-8 shadow-sm relative">
              <Sparkles className="size-8 md:size-10 text-primary relative z-10 animate-pulse" />
            </div>
            <p className="text-zinc-500 text-xs md:text-sm font-medium mb-8 md:mb-12 max-w-xs md:max-w-sm leading-relaxed">
              تحدث مع المساعد حول أي موضوع تقني أو إبداعي، وسيقدم لك أفضل الحلول
              المبنية على بيانات ضخمة.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s);
                    textareaRef.current?.focus();
                  }}
                  className="text-right p-5 bg-white border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 shadow-sm group"
                >
                  <MessageSquare className="size-4 mb-3 text-primary/40 group-hover:text-primary transition-colors" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`size-8 md:size-10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-zinc-100 text-zinc-500"
                  : "bg-primary text-white shadow-lg shadow-primary/20"
              }`}
            >
              {msg.role === "user" ? (
                <User className="size-4 md:size-5" />
              ) : (
                <Bot className="size-4 md:size-5" />
              )}
            </div>

            <div
              className={`group relative max-w-[90%] md:max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}
            >
              <div
                className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-zinc-50 border border-zinc-100 text-zinc-800"
                }`}
              >
                {msg.content && (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div
                    className={`flex flex-wrap gap-3 ${msg.content ? "mt-4 pt-4 border-t border-zinc-200" : ""}`}
                  >
                    {msg.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl overflow-hidden border border-zinc-200"
                      >
                        {att.type.startsWith("image/") ? (
                          <img
                            src={att.url}
                            alt={att.name}
                            className="h-32 w-auto object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-4">
                            <FileText className="size-5 text-primary" />
                            <span className="text-xs font-mono text-zinc-500">
                              {att.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p
                className={`text-[9px] font-black uppercase tracking-widest font-mono mt-2 ${msg.role === "user" ? "text-left" : "text-right"} text-zinc-300 px-4`}
              >
                {msg.role === "user" ? "USER_SIGNAL" : "CORE_RESPONSE"}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 md:gap-4 animate-in fade-in duration-300">
            <div className="size-10 md:size-12 rounded-xl md:rounded-[2.5rem] bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Bot className="size-5 md:size-6" />
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl md:rounded-4xl px-6 md:px-8 py-4 md:py-5 flex items-center gap-3 md:gap-4 shadow-sm">
              <div className="flex gap-1.5 md:gap-2">
                <span className="size-1.5 md:size-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 md:size-2 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 md:size-2 bg-primary rounded-full animate-bounce" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] font-mono italic animate-pulse">
                Neural Thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Console */}
      <div className="pt-4 md:pt-8 border-t border-zinc-100 relative z-10">
        <div className="relative bg-zinc-50/50 border border-zinc-200 rounded-3xl md:rounded-[2.5rem] p-2 md:p-3 shadow-inner focus-within:bg-white focus-within:border-primary/40 focus-within:shadow-2xl focus-within:shadow-primary/5 transition-all duration-700">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 md:px-6 py-3 md:py-4 border-b border-zinc-100 mb-2 md:mb-3">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="relative flex items-center gap-2 md:gap-3 bg-white border border-zinc-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 animate-in zoom-in-95 shadow-sm"
                >
                  <div className="size-5 md:size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="size-3 md:size-3.5" />
                  </div>
                  <span className="text-[9px] md:text-[10px] text-zinc-900 font-black truncate max-w-[100px] md:max-w-[150px] uppercase tracking-tight">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="size-5 md:size-6 flex items-center justify-center hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    <X className="size-3 md:size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="size-10 md:size-14 flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 rounded-xl md:rounded-2xl transition-all duration-500 hover:scale-110 active:scale-95"
            >
              <Paperclip className="size-5 md:size-7" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ارسل تعليماتك..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm md:text-base text-zinc-900 placeholder:text-zinc-400 leading-relaxed py-3 md:py-5 scrollbar-hide max-h-[120px] md:max-h-[150px] font-medium"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            ></textarea>

            <button
              onClick={handleSend}
              disabled={
                (!input.trim() && attachments.length === 0) ||
                isLoading ||
                !settingsLoaded
              }
              className="size-12 md:size-16 rounded-xl md:rounded-[1.5rem] bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-2xl shadow-primary/30 group/send"
            >
              {isLoading ? (
                <Loader2 className="size-5 md:size-7 animate-spin" />
              ) : (
                <Send className="size-5 md:size-7 group-hover/send:rotate-[-15deg] transition-transform duration-500" />
              )}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between px-8 mt-6">
          <div className="flex items-center gap-3">
            <div className="size-2 rounded-full bg-primary/20 animate-pulse" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">
              Neural Hub Optimized
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest font-mono">
              Token_Buffer: ACTIVE
            </span>
            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest font-mono">
              Latency: {isLoading ? "..." : "18ms"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
