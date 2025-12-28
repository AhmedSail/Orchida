"use client";

import { Link } from "next-view-transitions";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <h1 className="text-7xl font-extrabold text-primary mb-4 ">404</h1>

      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
        الصفحة غير موجودة
      </h2>

      <p className="text-gray-600 max-w-md mb-6">
        يبدو أنك وصلت إلى صفحة غير موجودة أو تم نقلها. تأكد من الرابط أو عد إلى
        الصفحة الرئيسية.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  );
};

export default NotFound;
