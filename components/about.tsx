"use client";
import Image from "next/image";
import React from "react";
import {
  Building2,
  CalendarDays,
  GraduationCap,
  Laptop,
  Users,
  Lightbulb,
  Target,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

type CompanyFormValues = {
  name: string;
  phone: string;
  accountNumber?: string;
  ibanShekel?: string;
  ibanDinar?: string;
  ibanDollar?: string;
  videoUrl?: string;
  managerMessage?: string;
};

const AboutPage = ({ company }: { company: Partial<CompanyFormValues> }) => {
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: <CalendarDays size={32} />,
      title: "تأسست عام 2019",
      description: "بداية رحلة الطموح والابتكار في عالم التقنية.",
    },
    {
      icon: <Building2 size={32} />,
      title: "حلول رقمية متكاملة",
      description: "نقدم أحدث التقنيات لتطوير أعمالك ومشاريعك.",
    },
    {
      icon: <Laptop size={32} />,
      title: "بيئة عمل حديثة",
      description: "مساحات عمل مجهزة بأحدث الأدوات التقنية.",
    },
    {
      icon: <Users size={32} />,
      title: "استشارات تقنية",
      description: "فريق من الخبراء جاهز لمساعدتك في التحول الرقمي.",
    },
    {
      icon: <GraduationCap size={32} />,
      title: "دورات احترافية",
      description: "برامج تدريبية متخصصة لرفع الكفاءة والمهارات.",
    },
    {
      icon: <Lightbulb size={32} />,
      title: "إبداع وابتكار",
      description: "نسعى دائماً لتقديم أفكار خارج الصندوق.",
    },
    {
      icon: <Target size={32} />,
      title: "تطوير مستمر",
      description: "نواكب التطور التكنولوجي لضمان جودة خدماتنا.",
    },
    {
      icon: <Rocket size={32} />,
      title: "نمو متسارع",
      description: "نساعد الأفراد والشركات على تحقيق أهدافهم بسرعة.",
    },
  ];

  return (
    <div className="min-h-screen font-sans" dir="rtl">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <Image
          src="/about/aboutHero2.png"
          alt="About Hero"
          fill
          priority
          quality={100}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          >
            من نحن
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl text-gray-100 drop-shadow-md"
          >
            نحن شريكك التقني نحو مستقبل رقمي واعد، نجمع بين الخبرة والابتكار
            لنقدم لك الأفضل.
          </motion.p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-16 -mt-20 relative z-10">
        {/* Intro Section with Image */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900 border-r-4 border-primary pr-4">
                قصتنا ورؤيتنا
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg text-justify">
                تأسست شركتنا عام 2019 برؤية واضحة تهدف إلى تمكين الأفراد
                والشركات من خلال التكنولوجيا. نحن نؤمن بأن التحول الرقمي ليس
                مجرد خيار، بل هو ضرورة للنمو والاستدامة. نسعى جاهدين لتوفير بيئة
                تعليمية وعملية متكاملة، حيث يلتقي الشغف بالخبرة لصنع مستقبل
                أفضل.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex flex-col items-center p-4 bg-primary/5 rounded-xl min-w-[100px]">
                  <span className="text-3xl font-bold text-primary">+5</span>
                  <span className="text-sm text-gray-600">سنوات خبرة</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-primary/5 rounded-xl min-w-[100px]">
                  <span className="text-3xl font-bold text-primary">+500</span>
                  <span className="text-sm text-gray-600">مشروع ناجح</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <div className="relative w-full max-w-[500px] h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                <Image
                  src="/about/aboutImg.jpeg"
                  alt="Our Story"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Manager Message */}
        {company.managerMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-primary text-white rounded-3xl p-8 md:p-12 mb-16 text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <h2 className="text-2xl md:text-3xl font-bold mb-8 relative z-10 flex items-center justify-center gap-2">
              <span className="text-4xl">❝</span> كلمة المدير{" "}
              <span className="text-4xl">❞</span>
            </h2>
            <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto opacity-90 relative z-10 italic">
              {company.managerMessage}
            </p>
            <div className="mt-6 font-semibold relative z-10">
              - المدير العام
            </div>
          </motion.div>
        )}

        {/* Video Section */}
        {company.videoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                تعرف علينا أكثر
              </h2>
              <p className="text-gray-500 mt-2">جولة سريعة داخل أروقة شركتنا</p>
            </div>

            <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <iframe
                src={company.videoUrl}
                title="Company Intro Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
