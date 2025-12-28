"use client";
import Image from "next/image";
import { Link } from "next-view-transitions";
import React, { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import emailjs from "emailjs-com";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Metadata } from "next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| من نحن",
};
type Links = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  whatsappUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
};
const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  message: z.string().min(5, "الرسالة قصيرة جداً"),
});

const ContactPage = ({ result }: { result: Links }) => {
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
      await emailjs.send(
        "service_ofqdhcu",
        "template_c3vgke8",
        {
          from_name: values.name,
          from_email: values.email,
          message: values.message,
        },
        "LOnH5LrFYmESJ1IkD"
      );
      setIsSent(true);
      form.reset();
      setTimeout(() => setIsSent(false), 3000);
    } catch (error) {
      console.error("EmailJS Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center"
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative w-full h-[300px] sm:h-[700px]" // ارتفاع مختلف للموبايل واللاب
      >
        <div
          className={`relative w-full ${isMobile ? "h-[230px]" : "h-[830px]"}`}
        >
          <Image
            src="/contact/contactHero.jpeg"
            alt="ContactImg"
            fill
            priority
            quality={100}
            className="object-cover object-top"
            unoptimized
          />

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black ${
              isMobile ? "opacity-0" : "opacity-20"
            }`}
          />
        </div>

        <div className={`absolute  bg-black opacity-${isMobile ? 0 : 20}`} />

        <div
          className={` font-bold absolute text-white ${
            isMobile ? "bottom-36 text-lg" : "bottom-0  text-2xl"
          } left-1/2 -translate-x-1/2`}
        >
          <span>اتــــــــــــــــصــــــــل بنــــــــا</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className={`flex flex-col items-center justify-center ${
          isMobile ? "" : "min-h-screen p-6"
        } w-full max-w-7xl`}
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold mb-12 text-center"
        >
          اتــــــــــــــــصــــــــل بنــــــــا
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          {/* Form Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="shadow-lg rounded-lg p-8 w-full bg-white"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-right" dir="rtl">
                      <FormLabel>اسمك</FormLabel>
                      <FormControl>
                        <Input placeholder="اكتب اسمك" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem dir="rtl">
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@mail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem dir="rtl">
                      <FormLabel>رسالتك</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="اكتب رسالتك هنا..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    disabled={loading || isSent}
                    className="w-full bg-primary text-white font-semibold py-3 rounded-md hover:bg-primary/80 transition duration-200 flex items-center justify-center"
                  >
                    {loading
                      ? "جاري الإرسال..."
                      : isSent
                      ? "✅ تم الإرسال"
                      : "إرسال الرسالة"}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>

          {/* Social Links Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col items-center space-y-6"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-semibold"
            >
              تجدنــــــــا على{" "}
            </motion.h2>
            <motion.span variants={itemVariants} className="text-lg">
              لا تتردد في التواصل معنا
            </motion.span>
            <motion.div
              variants={containerVariants}
              className="flex justify-center space-x-6 max-sm:space-x-3"
            >
              {[
                {
                  icon: <FaFacebook size={25} />,
                  link: result.facebookUrl,
                },
                {
                  icon: <FaInstagram size={25} />,
                  link: result.instagramUrl,
                },
                {
                  icon: <FaTwitter size={25} />,
                  link: result.twitterUrl,
                },
                {
                  icon: <FaWhatsapp size={25} />,
                  link: result.whatsappUrl,
                },
                {
                  icon: <FaLinkedinIn size={25} />,
                  link: result.linkedinUrl,
                },
                {
                  icon: <FaTiktok size={25} />,
                  link: result.tiktokUrl,
                },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  variants={itemVariants}
                  href={social.link ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary p-4 rounded-full border-2 border-primary hover:bg-primary hover:text-white shadow-primary hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactPage;
