"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import { authClient } from "../../../../../lib/auth-client";
import { EmblaCarousel } from "@/components/EmblaCarousel";
import Slider from "@/components/SliderCode"; // استدعاء الكومبوننت الجديد
import LatestNewsUser from "../components/lastEvents";
import ServicesFound from "@/components/servicesFound";

const HomeView = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50  mx-auto">
      {/* الكاروسيل الثاني (Slider) */}
      <div>
        <Slider />
      </div>
      <div className="p-6">
        <ServicesFound />
      </div>
      <div className="p-6">
        <LatestNewsUser />
      </div>

      {/* معلومات المستخدم + زر تسجيل الخروج */}
      <div className="flex flex-col items-center justify-center flex-1 gap-4 p-6">
        <p className="text-lg font-semibold text-gray-800">
          Logged in as{" "}
          <span className="text-blue-600">{session.user.name}</span>
        </p>
        <Button
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/sign-in");
                },
              },
            });
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md shadow"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
