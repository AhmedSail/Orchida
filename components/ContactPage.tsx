"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Mail, Clock, Send, CreditCard } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type CompanyData = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  whatsappUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
  phoneToCall: string | null;
  phoneToBank: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  accountNumber: string | null;
  ibanShekel: string | null;
  ibanDinar: string | null;
  ibanDollar: string | null;
};

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  message: z.string().min(5, "الرسالة قصيرة جداً"),
});

const ContactPage = ({ result }: { result: CompanyData }) => {
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsSent(true);
      form.reset();
      setTimeout(() => setIsSent(false), 3000);
    } catch (error) {
      console.error("Contact Form Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image
          src="/contact/contactHero.jpeg"
          alt="Contact Hero"
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            تواصل معنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl"
          >
            نحن هنا للإجابة على جميع استفساراتك. لا تتردد في مراسلتنا في أي وقت.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 -mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info & Socials Sidebar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Contact Info Card */}
            <motion.div
              variants={itemVariants}
              className="bg-primary text-white p-8 rounded-2xl shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-6">معلومات الاتصال</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">العنوان</h4>
                    <p className="text-gray-200 text-sm">
                      {result.address || "فلسطين، غزة، مول الرحاب"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">الهاتف</h4>
                    <p className="text-gray-200 text-sm" dir="ltr">
                      {result.phoneToCall || "+970 59 123 4567"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">البريد الإلكتروني</h4>
                    <p className="text-gray-200 text-sm">
                      {result.email || "admin@orchida-ods.com"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">ساعات العمل</h4>
                    <p className="text-gray-200 text-sm">
                      {result.workingHours || "السبت - الخميس: 9:00 ص - 5:00 م"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Media Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                تابعنا على منصات التواصل
              </h3>
              <div className="flex justify-center flex-wrap gap-4">
                {[
                  {
                    icon: <FaFacebook size={20} />,
                    link: result.facebookUrl,
                    bg: "hover:bg-[#1877F2]",
                    color: "text-[#1877F2]",
                  },
                  {
                    icon: <FaInstagram size={20} />,
                    link: result.instagramUrl,
                    bg: "hover:bg-[#E4405F]",
                    color: "text-[#E4405F]",
                  },
                  {
                    icon: <FaTwitter size={20} />,
                    link: result.twitterUrl,
                    bg: "hover:bg-[#1DA1F2]",
                    color: "text-[#1DA1F2]",
                  },
                  {
                    icon: <FaWhatsapp size={20} />,
                    link: result.whatsappUrl,
                    bg: "hover:bg-[#25D366]",
                    color: "text-[#25D366]",
                  },
                  {
                    icon: <FaLinkedinIn size={20} />,
                    link: result.linkedinUrl,
                    bg: "hover:bg-[#0A66C2]",
                    color: "text-[#0A66C2]",
                  },
                  {
                    icon: <FaTiktok size={20} />,
                    link: result.tiktokUrl,
                    bg: "hover:bg-[#000000]",
                    color: "text-[#000000]",
                  },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.link ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`nav-social-btn p-3 rounded-full border border-gray-100 shadow-sm transition-all duration-300 ${social.color} hover:text-white ${social.bg}`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 h-full"
            >
              <div className="mb-10 text-center">
                <span className="text-primary font-bold tracking-wider text-sm bg-primary/10 px-4 py-2 rounded-full mb-3 inline-block">
                  راسلنا
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  هل لديك استفسار؟
                </h2>
                <p className="text-gray-500 mt-2">
                  املأ النموذج أدناه وسيتم التواصل معك في أقرب وقت ممكن.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            الاسم الكامل
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="أدخل اسمك هنا"
                              {...field}
                              className="bg-gray-50 border-gray-200 h-12 focus:bg-white transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            البريد الإلكتروني
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@mail.com"
                              {...field}
                              className="bg-gray-50 border-gray-200 h-12 focus:bg-white transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">الرسالة</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="اكتب تفاصيل رسالتك هنا..."
                            {...field}
                            className="bg-gray-50 border-gray-200 resize-none focus:bg-white transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loading || isSent}
                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الإرسال...
                      </div>
                    ) : isSent ? (
                      "تم الإرسال بنجاح ✅"
                    ) : (
                      <span className="flex items-center gap-2">
                        إرسال الرسالة
                        <Send size={20} className="rotate-180" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
