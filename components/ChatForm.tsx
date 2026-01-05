"use client";
import Image from "next/image";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

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

interface Reply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  authorName?: string | null;
  roleUser: string | null;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  status: string;
  instructorReply?: string | null;
  authorName?: string | null;
  replies?: Reply[];
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
  const [localPosts, setLocalPosts] = useState<Post[]>(posts); // 👈 نستخدم نسخة محلية للتحديث الفوري

  // ✅ إضافة مشاركة جديدة (Realtime)
  const handleAddPost = async () => {
    if (!newPost.trim()) return;
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
      ...localPosts,
      {
        ...data.post,
        authorName: user.name,
        userImage: user.image ?? "/default-avatar.png",
        roleUser: user.role,
      },
    ]); // تحديث الـ state مباشرة
    setNewPost("");
    Swal.fire("✅ تم الإضافة", "تم نشر المشاركة بنجاح", "success");
  };
  // ✅ موافقة المدرب على المشاركة
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
    Swal.fire("✅ تمت الموافقة", "تم نشر المشاركة للعامة", "success");
  };
  // ✅ حذف مشاركة مع SweetAlert (Realtime)
  const handleDeletePost = async (postId: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف المشاركة نهائياً",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      await fetch(`/api/chat/sections/${sec.id}/posts/${postId}`, {
        method: "DELETE",
      });
      setLocalPosts(localPosts.filter((p) => p.id !== postId)); // تحديث الـ state
      Swal.fire("🗑️ تم الحذف", "تم حذف المشاركة بنجاح", "success");
    }
  };

  // ✅ تعديل مشاركة مع SweetAlert (Realtime)
  const handleEditPost = async (post: Post) => {
    const { value: newContent } = await Swal.fire({
      title: "✏️ تعديل المشاركة",
      input: "textarea",
      inputValue: post.content,
      inputPlaceholder: "اكتب النص الجديد هنا...",
      showCancelButton: true,
      confirmButtonText: "حفظ",
      cancelButtonText: "إلغاء",
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
      Swal.fire("✅ تم التعديل", "تم تحديث المشاركة بنجاح", "success");
    }
  };

  // ✅ إضافة رد (Realtime)
  const handleAddReply = async () => {
    if (!replyContent.trim() || !replyPostId) return;
    const res = await fetch(`/api/chat/posts/${replyPostId}/replies`, {
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
        p.id === replyPostId
          ? { ...p, replies: [...(p.replies || []), data.reply] }
          : p
      )
    );
    setReplyContent("");
    setReplyPostId(null);
    Swal.fire("✅ تم الإضافة", "تم نشر الرد بنجاح", "success");
  };
  const [activeTab, setActiveTab] = useState<"content" | "forum">("forum");
  const router = useRouter();
  return (
    <div className="p-6">
      <h1 className="text-lg md:text-2xl mb-4">
        مرحبا {user.name} 👋 أهلاً بك في محتوى {sec.courseTitle} - الشعبة{" "}
        {sec.sectionNumber}
      </h1>
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 ${
            activeTab === "content" ? "border-b-2 border-primary font-bold" : ""
          }`}
          onClick={() =>
            router.push(
              `/${user.role === "user" ? "dashboardUser" : `${user.role}`}/${
                user.id
              }/courses/${sec?.id}/content`
            )
          }
        >
          📚 المحتوى
        </button>
        <button
          className={`pb-2 ${
            activeTab === "forum" ? "border-b-2 border-primary font-bold" : ""
          }`}
          onClick={() =>
            router.push(
              `/${user.role === "user" ? "dashboardUser" : `${user.role}`}/${
                user.id
              }/courses/${sec?.id}/chat`
            )
          }
        >
          💬 المنتدى الطلابي
        </button>
      </div>
      {/* المشاركات */}
      <h2 className="text-xl font-semibold mb-4">📌 المشاركات</h2>
      <div className="space-y-4">
        {localPosts
          .filter((post) => {
            // المدرب يشوف الكل
            if (user.role === "instructor") return true;
            // الطالب يشوف مشاركاته الخاصة حتى لو pending
            if (post.authorId === user.id) return true;
            // باقي الطلاب يشوفوا فقط المشاركات المعتمدة
            return post.status === "approved";
          })
          .map((post) => (
            <div key={post.id} className="p-4 border rounded-lg bg-gray-50">
              {/* زر موافقة يظهر للمدرب فقط إذا البوست pending */}

              {/* باقي الكود كما هو */}
              <div className="flex justify-between items-center">
                <div className="flex justify-start gap-2 items-center">
                  <Image
                    width={40}
                    height={30}
                    src={post.userImage ?? "/default-avatar.png"}
                    alt={post.authorName ?? "user"}
                    className="rounded-full h-10 w-10 object-cover"
                    unoptimized
                  />
                  <p className="text-primary font-bold text-sm">
                    {post.authorName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ({post.roleUser === "user" ? "طالب" : "مدرب"})
                  </p>
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-2">
                  {(user.role === "instructor" ||
                    user.id === post.authorId) && (
                    <>
                      <button
                        onClick={() => handleEditPost(post)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        🗑️ حذف
                      </button>
                      {user.role === "instructor" &&
                        (post.status === "pending" ||
                          post.status === "pendingForSelf") && (
                          <button
                            onClick={() => handleApprovePost(post.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            ✅ موافقة
                          </button>
                        )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-2 gap-2">
                <p>التعليق :</p>
                <p>{post.content}</p>
              </div>

              {post.instructorReply && (
                <p className="text-sm text-red-600">
                  رد المدرب: {post.instructorReply}
                </p>
              )}

              {/* الردود */}
              {post.replies && post.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l">
                  <p className="font-semibold">💬 الردود:</p>
                  {post.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex justify-start gap-2 items-center"
                    >
                      <p>➡️</p>
                      <p className="text-primary font-bold text-sm">
                        {reply.authorName}
                      </p>
                      <p className="text-gray-500 text-sm">
                        ({reply.roleUser === "user" ? "طالب" : "مدرب"})
                      </p>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* فورم الرد */}
              <div className="mt-2">
                <textarea
                  value={replyPostId === post.id ? replyContent : ""}
                  onChange={(e) => {
                    setReplyPostId(post.id);
                    setReplyContent(e.target.value);
                  }}
                  className="w-full border rounded p-2"
                  placeholder="اكتب ردك هنا..."
                />
                <button
                  onClick={handleAddReply}
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                >
                  إضافة رد
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* فورم إضافة مشاركة جديدة */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">➕ أضف مشاركة جديدة</h3>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="w-full border rounded p-2 mt-2"
          placeholder="اكتب مشاركتك هنا..."
        />
        <Button onClick={handleAddPost} className="mt-2 px-4 py-2  rounded">
          نشر المشاركة
        </Button>
      </div>
    </div>
  );
};

export default ChatForm;
