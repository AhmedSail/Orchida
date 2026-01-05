"use client";
import { users } from "@/src/db/schema";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

export type User = InferSelectModel<typeof users>;

const Profile = ({ user }: { user: User }) => {
  return (
    <div className="container mx-auto">
      <h2 className="text-3xl mt-10 text-primary text-right font-semibold mb-4">
        الملف الشخصي
      </h2>

      <Card className="mx-auto p-6" dir="rtl">
        <CardContent className="space-y-6">
          {/* صورة البروفايل */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-gray-100">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-gray-500 text-sm">No Image</span>
              )}
            </div>
          </div>

          {/* الاسم */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">الاسم</Label>
            <Input
              type="text"
              value={user.name ?? ""}
              readOnly
              className="bg-gray-100"
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">البريد الإلكتروني</Label>
            <Input
              type="email"
              value={user.email ?? ""}
              readOnly
              className="bg-gray-100"
            />
          </div>

          {/* رقم الهاتف */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">رقم الهاتف</Label>
            <Input
              type="tel"
              value={user.phone ?? ""}
              readOnly
              className="bg-gray-100 text-right"
            />
          </div>

          {/* زر إعادة تعيين كلمة المرور */}
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href={`/${user.id}/edit-profile`}>
                تعديل البيانات الشخصية
              </Link>
            </Button>

            <Button asChild className="w-full" variant="secondary">
              <Link href={`/${user.id}/change-password`}>
                تغيير كلمة المرور
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
