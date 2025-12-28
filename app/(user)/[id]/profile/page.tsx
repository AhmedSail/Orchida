import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Profile from "@/components/user/profile";
import { db } from "@/src/db";
import { eq } from "drizzle-orm";
import { users } from "@/src/db/schema";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| البروفايل",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return redirect("/sign-in");
  }
  const user = await db.select().from(users).where(eq(users.id, id));
  return (
    <div>
      <Profile user={user[0]} />
    </div>
  );
};

export default page;
