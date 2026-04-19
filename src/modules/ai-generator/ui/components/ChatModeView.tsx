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
  Zap
} from "lucide-react";
import { sendChatMessageAction, ChatMessage } from "@/app/actions/ai-chat";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatModeView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: "user", content: trimmed });

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
        toast.error(res.error || "فشل الحصول على رد");
      }
    } catch (e) {
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

  const handleClear = () => {
    setMessages([]);
  };

  const suggestions = [
    "كيف أحسّن استراتيجية التسويق الرقمي لمشروعي؟",
    "ما هي أفضل ممارسات تصميم واجهة المستخدم؟",
    "اشرح لي كيف يعمل الذكاء الاصطناعي بشكل مبسط",
    "ساعدني في كتابة محتوى لوسائل التواصل الاجتماعي",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto px-4" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-zinc-900 text-sm">مساعد أوركيدة الذكي</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400">GPT-5 • Online</span>
            </div>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            مسح المحادثة
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar">
        
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-zinc-800 mb-2">كيف يمكنني مساعدتك؟</h3>
            <p className="text-zinc-400 text-sm font-medium mb-8 max-w-sm">
              مساعد أوركيدة الذكي جاهز للإجابة على أسئلتك في التسويق، التصميم، البرمجة، والمزيد.
            </p>
            
            {/* Suggestion Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-right p-4 bg-white border border-zinc-100 rounded-2xl text-sm font-medium text-zinc-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 mb-2 text-primary/60" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === "user" 
                ? "bg-primary text-white" 
                : "bg-gradient-to-br from-purple-500 to-primary text-white"
            }`}>
              {msg.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div className={`group relative max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-white border border-zinc-100 text-zinc-800 shadow-sm rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
              
              {/* Actions */}
              <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {msg.timestamp.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-primary text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-zinc-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-zinc-400 font-medium">يكتب...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="py-4 border-t border-zinc-100">
        <div className="flex gap-3 items-end bg-white border border-zinc-200 rounded-3xl p-3 shadow-sm focus-within:border-primary/30 focus-within:shadow-md transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-zinc-800 placeholder:text-zinc-400 leading-relaxed py-1 px-2 max-h-[200px] overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Zap className="w-3 h-3 text-zinc-300" />
          <span className="text-[10px] text-zinc-400 font-medium">مدعوم بـ GPT-5 من OpenAI</span>
        </div>
      </div>
    </div>
  );
}
