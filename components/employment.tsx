"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Building2, Calendar, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Job {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: Date;
}

const Employment = ({ jobs }: { jobs: Job[] }) => {
  if (jobs.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Briefcase size={16} />
            <span>فرص وظيفية</span>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            نحاول دائماً استقطاب الكفاءات والمواهب المتميزة لنبني معاً مستقبلاً
            رقمياً رائعاً. اكتشف الفرص المتاحة وكن جزءاً من النجاح.
          </p>
        </motion.div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 ${
                job.isActive
                  ? "border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-4 items-start w-full md:w-auto">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      job.isActive
                        ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Briefcase size={28} />
                  </div>
                  <div className="space-y-1 grow">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3
                        className={`text-lg font-bold transition-colors ${
                          job.isActive
                            ? "text-gray-900 group-hover:text-primary"
                            : "text-gray-500"
                        }`}
                      >
                        {job.title}
                      </h3>
                      {job.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                          متاح الآن
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          مغلق
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={14} />
                        <span>{job.department || "عام"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>
                          {new Date(job.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-end gap-2 md:pl-4">
                  <Button
                    asChild={job.isActive}
                    disabled={!job.isActive}
                    size="lg"
                    className={`w-full md:w-auto rounded-xl px-6 h-10 text-sm font-medium transition-all duration-300 ${
                      job.isActive
                        ? "bg-gray-900 hover:bg-primary text-white shadow-lg shadow-gray-200 hover:shadow-primary/20 hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed"
                    }`}
                  >
                    {job.isActive ? (
                      <Link
                        href={`/jobs/${job.id}/apply`}
                        className="flex items-center justify-center gap-2"
                      >
                        <span>تقدم الآن</span>
                        <ArrowLeft
                          size={16}
                          className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform"
                        />
                      </Link>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        التقديم متوقف
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Description Expandable or Short snippet */}
              <div className="mt-4 md:mt-2 md:mr-20 text-sm text-gray-600 line-clamp-2 md:line-clamp-1 max-w-2xl">
                {job.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Employment;
