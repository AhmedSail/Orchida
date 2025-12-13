export default function Loading() {
  return (
    <div className="p-6">
      {/* صورة رئيسية */}
      <div className="w-full h-64 bg-gray-300 rounded-lg animate-pulse mb-6"></div>

      {/* كاردز */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg shadow bg-white">
            {/* صورة الكارد */}
            <div className="w-full h-32 bg-gray-300 rounded-md animate-pulse mb-4"></div>

            {/* عنوان */}
            <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse mb-2"></div>

            {/* نص */}
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
