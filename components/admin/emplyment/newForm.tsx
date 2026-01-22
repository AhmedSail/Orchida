"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function JobApplicationForm({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const [formData, setFormData] = useState({
    name: name || "",
    email: email || "",
    phone: "",
    whatsapp: "",
    major: "",
    education: "",
    experienceYears: "",
    gender: "",
    location: "",
    age: "",
    cv: null,
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // هنا تبعت البيانات للـ API أو السيرفر
  };

  return (
    <div className="max-w-lg mx-auto p-6 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">نموذج التقديم الوظيفي</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">الاسم</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">الإيميل</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">الجوال</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">الواتس</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="major">التخصص</Label>
          <Input
            id="major"
            name="major"
            value={formData.major}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="education">المؤهل التعليمي</Label>
          <Input
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="experienceYears">سنوات الخبرة</Label>
          <Input
            id="experienceYears"
            type="number"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select
            onValueChange={(val) => setFormData({ ...formData, gender: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">مكان السكن</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="age">العمر</Label>
          <Input
            id="age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="cv">السيرة الذاتية (CV)</Label>
          <Input
            id="cv"
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full">
          إرسال الطلب
        </Button>
      </form>
    </div>
  );
}
