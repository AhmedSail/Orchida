"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { FaMedal } from "react-icons/fa"; // ✅ أيقونة ميدالية

const StudentWorksHome = ({
  studentStories,
}: {
  studentStories: {
    id: string;
    title: string;
    description: string | null;
    type: "story" | "image" | "video";
    mediaUrl: string | null;
    studentName: string | null;
  }[];
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  return (
    <section className="mt-10 container mx-auto px-4" dir="rtl">
      <div>
        <motion.h2
          className="text-xl lg:text-3xl text-primary font-bold mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          قصص نجاح الطلاب
        </motion.h2>
        <h1 className="text-center mb-5 text-gray-600">
          حابب تحصل على وسام اوركيدة؟ شارك في دوراتنا لعرض قصة نجاحك
        </h1>
      </div>

      {studentStories.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد قصص نجاح حالياً
          </h3>
          <p className="text-gray-500">
            كن أول من يشارك قصة نجاحه ويحصل على وسام أوركيدة!
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studentStories.map((story, i) => (
            <motion.div
              key={story.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <Card className="shadow-md h-full flex flex-col relative">
                {/* ✅ شارة الميدالية */}
                <div className="absolute top-2 left-2 bg-primary text-white p-2 rounded-full shadow-lg flex items-center justify-center">
                  <FaMedal className="w-5 h-5 text-yellow-300" />
                </div>

                <CardContent className="p-4 flex flex-col">
                  <div className="flex justify-start gap-2 items-center">
                    <h1 className="text-primary">العنوان:</h1>
                    <h3 className="font-bold text-lg">{story.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    👤 {story.studentName}
                  </p>

                  {story.type === "image" && story.mediaUrl && (
                    <>
                      <div className="w-full h-64 flex items-center justify-center">
                        <Image
                          src={story.mediaUrl}
                          alt={story.title}
                          className="rounded object-cover w-full h-full"
                          width={400}
                          height={300}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </div>
                      {story.description && (
                        <p className="mt-2 text-gray-700">
                          {story.description}
                        </p>
                      )}
                    </>
                  )}

                  {story.type === "video" && story.mediaUrl && (
                    <>
                      <div className="w-full h-64 flex items-center justify-center">
                        <video
                          src={story.mediaUrl}
                          controls
                          className="rounded object-cover w-full h-full"
                        />
                      </div>
                      {story.description && (
                        <p className="mt-2 text-gray-700">
                          {story.description}
                        </p>
                      )}
                    </>
                  )}

                  {story.type === "story" && (
                    <p className="mt-2 text-gray-700">{story.description}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StudentWorksHome;
