import NewNewsForm from "@/components/news/newNewsForm";
import React from "react";

const page = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">إضافة خبر جديد</h1>
      <NewNewsForm />
    </div>
  );
};

export default page;
