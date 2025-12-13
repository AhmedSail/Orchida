import { ServiceRequests } from "@/src/modules/home/ui/view/home-view";
import { News } from "../news/LatestNews";

interface HomePageProps {
  todayRequests: ServiceRequests[];
  activeServices: ServiceRequests[];
  endedServices: ServiceRequests[];
  allServices: ServiceRequests[];
}
export default function AttractorHomePage({
  todayRequests,
  activeServices,
  endedServices,
  allServices,
}: HomePageProps) {
  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">
          مرحبًا بكم في لوحة المستقطب
        </p>
      </header>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
        <div className="rounded-lg p-4 shadow-sm shadow-primary">
          <h2 className="text-lg font-medium mb-2">الطلبات اليوم</h2>
          <p className="text-2xl font-bold text-primary">
            {todayRequests.length}
          </p>
        </div>

        <div className="rounded-lg p-4 shadow-sm shadow-primary">
          <h2 className="text-lg font-medium mb-2">الخدمات المتاحة</h2>
          <p className="text-2xl font-bold text-primary">
            {allServices.length}
          </p>
        </div>

        <div className="rounded-lg p-4 shadow-sm shadow-primary">
          <h2 className="text-lg font-medium mb-2">خدمات قيد التنفيذ</h2>
          <p className="text-2xl font-bold text-primary">
            {activeServices.length}
          </p>
        </div>

        <div className="rounded-lg p-4 shadow-sm shadow-primary">
          <h2 className="text-lg font-medium mb-2">الخدمات المنتهية</h2>
          <p className="text-2xl font-bold text-primary">
            {endedServices.length}
          </p>
        </div>

        <div className="rounded-lg p-4 shadow-sm shadow-primary">
          <h2 className="text-lg font-medium mb-2">مجموع الخدمات</h2>
          <p className="text-2xl font-bold text-primary">
            {allServices.length}
          </p>
        </div>
      </div>
      <div>
        {/* ✅ جدول طلبات اليوم */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-primary">
            📌 طلبات اليوم
          </h2>

          {todayRequests.length === 0 ? (
            <p className="text-gray-500">لا توجد طلبات اليوم</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full text-right border-collapse">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3">اسم الزبون</th>
                    <th className="p-3">البريد</th>
                    <th className="p-3">الهاتف</th>
                    <th className="p-3">الخدمة</th>
                    <th className="p-3">الوصف</th>
                    <th className="p-3">الميزانية</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>

                <tbody>
                  {todayRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 font-semibold">{req.clientName}</td>
                      <td className="p-3">{req.clientEmail}</td>
                      <td className="p-3">{req.clientPhone || "—"}</td>
                      <td className="p-3">{req.name}</td>
                      <td className="p-3 max-w-xs truncate">
                        {req.description || "—"}
                      </td>
                      <td className="p-3">{req.budget || "—"}</td>
                      <td className="p-3">
                        {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="p-3">
                        {req.status === "in_progress" && (
                          <span className="text-blue-600 font-bold">
                            قيد التنفيذ
                          </span>
                        )}
                        {req.status === "completed" && (
                          <span className="text-green-600 font-bold">
                            منتهي
                          </span>
                        )}
                        {req.status === "pending" && (
                          <span className="text-yellow-600 font-bold">
                            قيد المراجعة
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
