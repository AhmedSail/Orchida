import ControlUsers from "@/components/users/ControlUsers";
import { db } from "@/src";
import { session, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | صلاحيات المستخدمين",
};
const page = async () => {
  // ✅ جلب جميع المستخدمين
  const allUsers = await db.select().from(users);

  // ✅ جلب جميع الجلسات
  const sessionsList = await db.select().from(session);

  return (
    <div>
      <ControlUsers allUsers={allUsers} sessions={sessionsList} />
    </div>
  );
};

export default page;
