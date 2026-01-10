"use client";

import Image from "next/image";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  User as UserIcon,
  ShieldCheck,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Reply,
  MoreVertical,
  Activity,
  BookOpen,
  PlusCircle,
  Hash,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";

interface Section {
  id: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  status?: string;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  image: string | null;
}

interface ReplyType {
  id: string;
  postId: string;
  userId: string;
  content: string;
  authorName?: string | null;
  roleUser: string | null;
  createdAt?: Date;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  status: string;
  instructorReply?: string | null;
  authorName?: string | null;
  replies?: ReplyType[];
  userImage?: string | null;
  roleUser: string | null;
}

interface ChatFormProps {
  section: Section[];
  userData: UserData[];
  posts: Post[];
}

const ChatForm = ({ section, userData, posts }: ChatFormProps) => {
  const user = userData[0];
  const sec = section[0];

  const [newPost, setNewPost] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyPostId, setReplyPostId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const [activeTab, setActiveTab] = useState<"content" | "forum">("forum");
  const router = useRouter();

  const handleAddPost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await fetch(`/api/chat/sections/${sec.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user.id,
          content: newPost,
          role: user.role,
        }),
      });
      const data = await res.json();
      setLocalPosts([
        {
          ...data.post,
          authorName: user.name,
          userImage: user.image ?? "/default-avatar.png",
          roleUser: user.role,
          replies: [],
        },
        ...localPosts,
      ]);
      setNewPost("");
      Swal.fire({
        title: "تم النشر ✅",
        text: "مشاركتك قيد المراجعة أو تم نشرها بنجاح",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "rounded-[32px]",
          confirmButton: "rounded-2xl px-8 font-bold",
        },
      });
    } catch (err) {
      Swal.fire("خطأ ❌", "حدث خطأ أثناء النشر", "error");
    }
  };

  const handleApprovePost = async (postId: string) => {
    await fetch(`/api/chat/sections/${sec.id}/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    setLocalPosts(
      localPosts.map((p) =>
        p.id === postId ? { ...p, status: "approved" } : p
      )
    );
    Swal.fire({
      title: "✅ تمت الموافقة",
      text: "تم نشر المشاركة للعامة",
      icon: "success",
      customClass: {
        popup: "rounded-[32px]",
        confirmButton: "rounded-2xl px-8 font-bold",
      },
    });
  };

  const handleDeletePost = async (postId: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف المشاركة نهائياً",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
      customClass: {
        popup: "rounded-[32px]",
        confirmButton: "rounded-2xl px-8 font-bold",
        cancelButton: "rounded-2xl px-8 font-bold",
      },
    });

    if (confirm.isConfirmed) {
      await fetch(`/api/chat/sections/${sec.id}/posts/${postId}`, {
        method: "DELETE",
      });
      setLocalPosts(localPosts.filter((p) => p.id !== postId));
      Swal.fire("🗑️ تم الحذف", "تم حذف المشاركة بنجاح", "success");
    }
  };

  const handleEditPost = async (post: Post) => {
    const { value: newContent } = await Swal.fire({
      title: "✏️ تعديل المشاركة",
      input: "textarea",
      inputValue: post.content,
      showCancelButton: true,
      confirmButtonText: "حفظ",
      cancelButtonText: "إلغاء",
      customClass: {
        popup: "rounded-[32px]",
        input: "rounded-2xl border-slate-200",
        confirmButton: "rounded-2xl px-8 font-bold",
        cancelButton: "rounded-2xl px-8 font-bold",
      },
    });

    if (newContent) {
      const res = await fetch(`/api/chat/sections/${sec.id}/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      const data = await res.json();
      setLocalPosts(
        localPosts.map((p) =>
          p.id === post.id ? { ...p, content: data.post.content } : p
        )
      );
      Swal.fire("✅ تم التعديل", "تم التحديث بنجاح", "success");
    }
  };

  const handleAddReply = async (postId: string) => {
    if (!replyContent.trim()) return;
    const res = await fetch(`/api/chat/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        content: replyContent,
      }),
    });
    const data = await res.json();

    setLocalPosts(
      localPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...(p.replies || []),
                { ...data.reply, authorName: user.name, roleUser: user.role },
              ],
            }
          : p
      )
    );
    setReplyContent("");
    setReplyPostId(null);
    Swal.fire({
      title: "✅ تم الإضافة",
      text: "تم نشر الرد بنجاح",
      icon: "success",
      customClass: {
        popup: "rounded-[32px]",
        confirmButton: "rounded-2xl px-8 font-bold",
      },
    });
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Cinematic Header */}
      <div className="relative overflow-hidden p-8 md:p-14 rounded-[48px] bg-indigo-950 border border-indigo-900 shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -top-24 -right-24 size-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-300 tracking-widest font-black uppercase text-xs"
            >
              <Activity className="size-4 animate-pulse" />
              <span>المنتدى الطلابي التفاعلي | أكاديمية أوركيدة</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black text-white leading-tight"
            >
              مرحباً <span className="text-primary">{user.name}</span>
              <br />
              <span className="text-indigo-200/60 text-xl md:text-2xl font-bold mt-2 block">
                شارك مهاراتك، اسأل، وتعاون مع زملائك في {sec.courseTitle}
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:flex items-center gap-8 bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10"
          >
            <div className="text-center px-4">
              <span className="block text-4xl font-black text-white">
                {localPosts.length}
              </span>
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">
                مشاركة نشطة
              </span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg shadow-primary/20">
                <MessageSquare className="size-6" />
              </div>
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">
                بيئة تعلم حيّة
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 p-2 bg-slate-100 dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800">
        <button
          onClick={() =>
            router.push(
              `/${
                user.role === "user"
                  ? "dashboardUser"
                  : user.role || "instructor"
              }/${user.id}/courses/${sec?.id}/content`
            )
          }
          className="px-8 py-4 rounded-3xl flex items-center gap-3 transition-all duration-300 text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-white/5"
        >
          <BookOpen className="size-5" />
          <span className="font-black text-sm">المحتوى التعليمي</span>
        </button>
        <button className="relative px-8 py-4 rounded-3xl flex items-center gap-3 bg-white dark:bg-zinc-800 shadow-xl shadow-black/5">
          <MessageSquare className="size-5 text-indigo-500" />
          <span className="font-black text-sm text-slate-800 dark:text-white">
            المنتدى الطلابي
          </span>
          <motion.div
            layoutId="active-tab"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Posts Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Hash className="size-6 text-indigo-500" />
              آخر النقاشات العامة
            </h2>
            <Badge
              variant="outline"
              className="rounded-full px-5 py-2 font-black border-2 border-indigo-100 text-indigo-600 bg-indigo-50/30"
            >
              {localPosts.length} مشاركة
            </Badge>
          </div>

          <AnimatePresence mode="popLayout">
            {localPosts
              .filter((post) => {
                if (user.role === "instructor") return true;
                if (post.authorId === user.id) return true;
                return post.status === "approved";
              })
              .map((post, idx) => {
                const isInstructor = post.roleUser === "instructor";
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative p-6 md:p-10 rounded-[44px] border-2 transition-all duration-500 group overflow-hidden ${
                      isInstructor
                        ? "bg-linear-to-br from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-zinc-900 border-indigo-100 dark:border-indigo-900/40 shadow-xl shadow-indigo-500/5"
                        : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none"
                    }`}
                  >
                    {/* Status Badge for private/pending posts */}
                    {post.status !== "approved" && (
                      <div className="absolute top-6 left-10 px-4 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-2">
                        <Clock className="size-3" />
                        بانتظار الموافقة
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative p-1.5 rounded-[22px] border-2 transition-transform group-hover:scale-110 ${
                            isInstructor
                              ? "border-indigo-200 bg-white"
                              : "border-slate-100 bg-slate-50"
                          }`}
                        >
                          <Image
                            width={64}
                            height={64}
                            src={post.userImage ?? "/default-avatar.png"}
                            alt={post.authorName ?? "user"}
                            className="rounded-[18px] object-cover size-14"
                            unoptimized
                          />
                          {isInstructor && (
                            <div className="absolute -top-3 -right-3 size-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
                              <ShieldCheck className="size-4" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4
                            className={`text-xl font-black ${
                              isInstructor
                                ? "text-indigo-900 dark:text-indigo-200"
                                : "text-slate-800 dark:text-white"
                            }`}
                          >
                            {post.authorName}
                          </h4>
                          <Badge
                            className={`rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-widest ${
                              isInstructor
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-500 border-none"
                            }`}
                          >
                            {isInstructor ? "مدرب المادة" : "طالب"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {(user.role === "instructor" ||
                          user.id === post.authorId) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPost(post)}
                              className="size-10 rounded-2xl hover:bg-amber-100 text-amber-500 transition-colors"
                            >
                              <Edit3 className="size-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePost(post.id)}
                              className="size-10 rounded-2xl hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <Trash2 className="size-5" />
                            </Button>
                          </>
                        )}
                        {user.role === "instructor" &&
                          post.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleApprovePost(post.id)}
                              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 px-6 shadow-lg shadow-emerald-500/20"
                            >
                              موافقة فورية
                            </Button>
                          )}
                      </div>
                    </div>

                    <div className="mt-8 text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      {post.content}
                    </div>

                    {/* Instructor Reply Section */}
                    {post.instructorReply && (
                      <div className="mt-8 p-8 rounded-[36px] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 relative group/reply-box">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                            <ShieldCheck className="size-3" />
                            توجيه وإرشاد المدرب
                          </div>
                          <p className="text-lg font-bold leading-relaxed">
                            {post.instructorReply}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Replies List */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-10 space-y-6 pt-8 border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-slate-400 mb-6">
                          <Reply className="size-5 scale-x-[-1]" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                            النقاش الجاري ({post.replies.length} ردود)
                          </span>
                        </div>
                        {post.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex gap-5 group/reply"
                          >
                            <div className="size-12 rounded-[18px] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 shadow-sm transition-transform group-hover/reply:scale-110">
                              <UserIcon className="size-6 text-slate-400" />
                            </div>
                            <div className="grow space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-800 dark:text-white">
                                  {reply.authorName}
                                </span>
                                {reply.roleUser === "instructor" && (
                                  <Badge className="text-[8px] bg-indigo-600 text-white rounded-lg px-2 h-4 flex items-center">
                                    مدرب
                                  </Badge>
                                )}
                              </div>
                              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-zinc-800/40 p-4 rounded-[24px]">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="mt-10 flex gap-4 items-end">
                      <div className="grow relative">
                        <Textarea
                          placeholder="أضف ردك أو وجه استفسارك هنا..."
                          value={replyPostId === post.id ? replyContent : ""}
                          onChange={(e) => {
                            setReplyPostId(post.id);
                            setReplyContent(e.target.value);
                          }}
                          className="min-h-[100px] rounded-[28px] bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-4 focus:ring-primary/10 transition-all p-6 text-lg"
                        />
                      </div>
                      <Button
                        onClick={() => handleAddReply(post.id)}
                        disabled={
                          !replyContent.trim() || replyPostId !== post.id
                        }
                        className="size-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-xl shadow-indigo-600/30 transition-all active:scale-90 flex items-center justify-center"
                      >
                        <Send className="size-8" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {/* Sidebar Creation Area */}
        <div className="space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="p-10 rounded-[48px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-8 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 text-primary">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <PlusCircle className="size-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                    ابدأ نقاشاً ملائماً
                  </h3>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  هل لديك فكرة جديدة؟ أو تواجه تحدياً في المادة التعليمية؟
                  شاركنا الآن وسيتفاعل معك مجتمعنا التعليمي.
                </p>
              </div>

              <div className="space-y-5 relative z-10">
                <Textarea
                  placeholder="ما هو موضوعك اليوم؟"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[220px] rounded-[36px] p-8 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xl font-medium shadow-inner focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <Button
                  onClick={handleAddPost}
                  disabled={!newPost.trim()}
                  className="w-full h-16 rounded-[28px] bg-primary hover:bg-primary/95 text-white font-black text-xl shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-3 justify-center group"
                >
                  <Send className="size-6 transition-transform group-hover:translate-x-1" />
                  نشر في الساحة الآن
                </Button>
              </div>
            </div>

            {/* Participation Card */}
            <div className="p-10 rounded-[48px] bg-linear-to-br from-indigo-600 to-indigo-800 text-white shadow-2xl space-y-6 overflow-hidden relative group">
              <div className="absolute -bottom-8 -left-8 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <h4 className="text-2xl font-black flex items-center gap-2">
                  <ShieldCheck className="size-7" />
                  مواثيق المنتدى �
                </h4>
                <p className="text-indigo-200 text-sm mt-2 font-medium">
                  نحن نؤمن ببيئة تعلم آمنة ومحترفة للجميع.
                </p>
              </div>

              <ul className="space-y-4 text-base text-indigo-50 font-medium relative z-10 pt-2">
                <li className="flex items-start gap-4">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="size-4 text-white" />
                  </div>
                  تحية الجميع بتقدير واحترام.
                </li>
                <li className="flex items-start gap-4">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="size-4 text-white" />
                  </div>
                  التركيز على المادة العلمية.
                </li>
                <li className="flex items-start gap-4">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="size-4 text-white" />
                  </div>
                  الإبقاء على الحوار بناءً ومفيداً.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatForm;
