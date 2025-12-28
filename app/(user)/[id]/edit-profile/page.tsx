import EditProfilePage from "@/components/user/edit-profile";
import { db } from "@/src";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| تعديل البروفايل",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const user = await db.select().from(users).where(eq(users.id, id));
  return (
    <div>
      <EditProfilePage id={id} user={user[0]} />
    </div>
  );
};

export default page;
