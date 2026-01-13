import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  boolean,
  pgEnum,
  integer,
  unique,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

// 1. Enums Definitions
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "coordinator",
  "attractor",
  "instructor",
  "content_creator",
  "guest",
]);

export const sectionStatusEnum = pgEnum("section_status", [
  "pending_approval", // مقترحة من المنسق وتنتظر موافقة الإدارة
  "approved", // تمت الموافقة من الإدارة
  "open", // التسجيل مفتوح
  "in_progress", // الدورة قيد التنفيذ
  "completed", // الدورة انتهت
  "closed", // التسجيل مغلق
  "cancelled", // التسجيل ملغى
]);
export const courseTypeEnum = pgEnum("course_type", [
  "in_center",
  "online",
  "hybrid",
  "external",
]);

export const confirmationStatusEnum = pgEnum("confirmation_status", [
  "pending",
  "confirmed",
  "rejected",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const contentContentTypeEnum = pgEnum("content_type", [
  "video",
  "text",
  "image",
  "attachment",
  "quiz",
]);

export const serviceRequestStatusEnum = pgEnum("service_request_status", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "replied",
  "closed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "enrollment",
  "payment",
  "course_update",
  "service_update",
  "system",
]);

// Enum لنوع العمل
export const workTypeEnum = pgEnum("workType", ["story", "image", "video"]);
export const workStatusEnum = pgEnum("workStatus", ["pending", "approved"]);
// Enum للحضور والغياب
export const attendanceStatusEnum = pgEnum("attendanceStatus", [
  "present", // حاضر
  "absent", // غائب
  "excused", // غياب بعذر
]);
// 2. Tables Definitions

// 1. users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

// 2. courses
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  duration: text("duration"), // مدة الدورة (بالأيام أو الأسابيع)
  hours: integer("hours"), // عدد الساعات الفعلية للدورة
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 20 }).default("ILS").notNull(), // ILS, USD, JOD

  isActive: boolean("isActive").default(true).notNull(), // نشط أو لا

  topics: text("topics"),
  objectives: text("objectives"), // أهداف الدورة
  targetAudience: varchar("targetAudience", { length: 255 }), // الفئة المستهدفة

  proposedBy: text("proposedBy").references(() => users.id),
  approvedBy: text("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const instructors = pgTable("instructors", {
  id: text("id").primaryKey(), // معرف المدرب
  name: varchar("name", { length: 100 }).notNull(), // اسم المدرب
  email: varchar("email", { length: 150 }).unique().notNull(), // البريد الإلكتروني
  phone: varchar("phone", { length: 20 }).notNull(), // رقم الهاتف
  specialty: varchar("specialty", { length: 100 }).notNull(), // التخصص (مثلاً: برمجة، إدارة)
  bio: text("bio").notNull(), // نبذة عن المدرب
  experienceYears: text("experienceYears").notNull(), // عدد سنوات الخبرة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
// 3. courseSections
export const courseSections = pgTable("courseSections", {
  id: text("id").primaryKey(),
  courseId: text("courseId")
    .notNull()
    .references(() => courses.id),
  sectionNumber: integer("sectionNumber").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  maxCapacity: integer("maxCapacity").default(40).notNull(),
  currentEnrollment: integer("currentEnrollment").default(0).notNull(),
  status: sectionStatusEnum("status").notNull(),

  instructorId: text("instructorId").references(() => instructors.id),
  coordinatorId: text("coordinatorId").references(() => users.id),
  location: varchar("location", { length: 255 }),
  courseType: courseTypeEnum("courseType"),
  notes: text("notes"),

  approvedBy: text("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
// جدول اللقاءات (meetings)
export const meetings = pgTable("meetings", {
  id: text("id").primaryKey(), // رقم اللقاء (ID)

  courseId: text("courseId")
    .notNull()
    .references(() => courses.id), // اسم الدورة

  sectionId: text("sectionId")
    .notNull()
    .references(() => courseSections.id), // رقم الشعبة

  instructorId: text("instructorId")
    .notNull()
    .references(() => instructors.id), // المدرب المسؤول

  date: timestamp("date").notNull(), // تاريخ اللقاء
  startTime: varchar("startTime", { length: 10 }).notNull(), // وقت البداية (مثلاً 10:00)
  endTime: varchar("endTime", { length: 10 }).notNull(), // وقت النهاية (مثلاً 12:00)
  meetingNumber: integer("meetingNumber").notNull(),
  location: varchar("location", { length: 255 }), // المكان (قاعة أو رابط Zoom/Google Meet)
  studentsCount: integer("studentsCount").default(0).notNull(), // عدد الطلاب
  notes: text("notes"), // ملاحظات إضافية
  archived: boolean("archived").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
// 4. courseEnrollments
export const courseEnrollments = pgTable("courseEnrollments", {
  id: text("id").primaryKey(),
  sectionId: text("sectionId")
    .notNull()
    .references(() => courseSections.id),
  studentId: text("studentId").references(() => users.id),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  studentEmail: varchar("studentEmail", { length: 320 }).notNull(),
  studentPhone: varchar("studentPhone", { length: 20 }),

  // بيانات إضافية عن الطالب
  studentAge: integer("studentAge"), // العمر
  studentMajor: varchar("studentMajor", { length: 255 }), // التخصص الجامعي
  studentCountry: varchar("studentCountry", { length: 255 }), // الدولة

  registrationNumber: varchar("registrationNumber", { length: 50 }).unique(),
  confirmationStatus: confirmationStatusEnum("confirmationStatus").notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").notNull(),
  isCancelled: boolean("isCancelled").default(false).notNull(),
  isInIntroductorySession: boolean("isInIntroductorySession")
    .default(false)
    .notNull(),

  // رابط صورة إشعار الدفع
  paymentReceiptUrl: varchar("paymentReceiptUrl", { length: 500 }),
  isReceiptUploaded: boolean("isReceiptUploaded").default(false).notNull(),
  IBAN: varchar("IBAN", { length: 500 }),
  notes: text("notes"),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
// جدول الحضور والغياب
export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(), // معرف السجل

  meetingId: text("meetingId")
    .notNull()
    .references(() => meetings.id), // اللقاء المرتبط

  enrollmentId: text("enrollmentId")
    .notNull()
    .references(() => courseEnrollments.id), // الطالب المسجل في الشعبة

  status: attendanceStatusEnum("status").notNull(),

  // القيم الممكنة: "present" (حاضر) / "absent" (غائب) / "late" (متأخر) / "excused" (غياب بعذر)

  markedBy: text("markedBy").references(() => users.id), // الدكتور أو المنسق اللي سجل الحضور
  notes: text("notes"), // ملاحظات إضافية (اختياري)

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const studentWorks = pgTable("studentWorks", {
  id: text("id").primaryKey(),

  // المسؤول (Coordinator أو Admin) اللي رفع العمل
  createdBy: text("createdBy")
    .notNull()
    .references(() => users.id),

  // الطالب صاحب القصة أو العمل
  studentId: text("studentId")
    .notNull()
    .references(() => users.id),

  // ربط بالكورس والشعبة
  courseId: text("courseId")
    .notNull()
    .references(() => courses.id),
  sectionId: text("sectionId")
    .notNull()
    .references(() => courseSections.id),

  // نوع العمل: قصة / صورة / فيديو
  type: workTypeEnum("type").notNull(),

  // عنوان ووصف
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // رابط الصورة أو الفيديو (إذا النوع مش قصة)
  mediaUrl: varchar("mediaUrl", { length: 500 }),

  // حالة العمل: pending أو approved
  status: workStatusEnum("status").default("approved").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 5. chapterContent
export const courseModules = pgTable("courseModules", {
  id: text("id").primaryKey(),
  courseId: text("courseId")
    .notNull()
    .references(() => courses.id), // الوحدة مرتبطة بالكورس
  sectionId: text("sectionId").references(() => courseSections.id), // ممكن تربطها بالشعبة إذا لزم
  intructorId: text("intructorId").references(() => instructors.id), // ممكن تربطها بالشعبة إذا لزم
  title: varchar("title", { length: 255 }).notNull(), // اسم الوحدة (مثلاً: البرمجة)
  description: text("description"), // وصف الوحدة
  orderIndex: integer("orderIndex").notNull(), // ترتيب الوحدة داخل الكورس
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const courseChapters = pgTable("courseChapters", {
  id: text("id").primaryKey(),
  moduleId: text("moduleId")
    .notNull()
    .references(() => courseModules.id), // الفصل مرتبط بالوحدة
  title: varchar("title", { length: 255 }).notNull(), // اسم الفصل (مثلاً: HTML)
  description: text("description"), // وصف الفصل
  orderIndex: integer("orderIndex").notNull(), // ترتيب الفصل داخل الوحدة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const chapterContent = pgTable("chapterContent", {
  id: text("id").primaryKey(),
  chapterId: text("chapterId")
    .notNull()
    .references(() => courseChapters.id), // المحتوى مرتبط بالفصل
  contentType: contentContentTypeEnum("contentType").notNull(), // نوع المحتوى (نص، فيديو، صورة، ملف)
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 500 }),
  textContent: text("textContent"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  attachmentName: varchar("attachmentName", { length: 255 }),
  orderIndex: integer("orderIndex").notNull(), // ترتيب المحتوى داخل الفصل
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const sectionForumPosts = pgTable("sectionForumPosts", {
  id: text("id").primaryKey(),
  sectionId: text("sectionId")
    .notNull()
    .references(() => courseSections.id), // ربط بالشعبة
  authorId: text("authorId")
    .notNull()
    .references(() => users.id), // 👈 سواء طالب أو مدرب
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | approved | rejected
  instructorReply: text("instructorReply"), // رد المدرب على مشاركة طالب
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const sectionForumReplies = pgTable("sectionForumReplies", {
  id: text("id").primaryKey(),
  postId: text("postId")
    .notNull()
    .references(() => sectionForumPosts.id), // ربط بالمشاركة
  userId: text("userId")
    .notNull()
    .references(() => users.id), // الطالب أو المدرب اللي رد
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(), // ✅ إضافة وقت آخر تعديل
});
// 6. studentProgress
export const studentProgress = pgTable(
  "studentProgress",
  {
    id: text("id").primaryKey(),
    enrollmentId: text("enrollmentId")
      .notNull()
      .references(() => courseEnrollments.id),
    contentId: text("contentId")
      .notNull()
      .references(() => chapterContent.id),
    isCompleted: boolean("isCompleted").default(false).notNull(),
    completedAt: timestamp("completedAt"),
    progress: integer("progress"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueEnrollmentContent: unique("unique_enrollment_content").on(
      table.enrollmentId,
      table.contentId
    ),
  })
);

// جدول الشركة
export const companies = pgTable("companies", {
  id: text("id").primaryKey(), // معرف الشركة

  name: text("name").notNull(), // اسم الشركة
  phone: text("phone"), // رقم الهاتف

  accountNumber: text("accountNumber"), // رقم الحساب البنكي
  ibanShekel: text("ibanShekel"), // رقم IBAN بالشيكل
  ibanDinar: text("ibanDinar"), // رقم IBAN بالدينار
  ibanDollar: text("ibanDollar"), // رقم IBAN بالدولار

  videoUrl: text("videoUrl"), // رابط الفيديو التعريفي للشركة
  managerMessage: text("managerMessage"), // كلمة المدير

  // ✅ روابط السوشيال ميديا
  facebookUrl: text("facebookUrl").default("#"), // رابط الفيسبوك
  instagramUrl: text("instagramUrl").default("#"), // رابط إنستغرام
  twitterUrl: text("twitterUrl").default("#"), // رابط تويتر (X)
  whatsappUrl: text("whatsappUrl").default("#"), // رابط واتساب
  linkedinUrl: text("linkedinUrl").default("#"), // رابط لينكدإن
  tiktokUrl: text("tiktokUrl").default("#"), // رابط تيك توك

  createdAt: timestamp("createdAt").defaultNow().notNull(), // وقت الإنشاء
  updatedAt: timestamp("updatedAt").defaultNow().notNull(), // آخر تحديث
});
// 7. digitalServices
export const digitalServices = pgTable("digitalServices", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  smallImage: varchar("smallImage", { length: 255 }), // Added small image for service page
  largeImage: varchar("largeImage", { length: 255 }), // Added large image for service page
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const works = pgTable("works", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  projectUrl: varchar("projectUrl", { length: 500 }),
  priceRange: varchar("priceRange", { length: 100 }),
  tags: text("tags"),
  duration: varchar("duration", { length: 100 }),
  toolsUsed: text("toolsUsed"),
  isActive: boolean("isActive").default(true).notNull(),

  imageUrl: varchar("imageUrl", { length: 500 }),
  type: varchar("type", { length: 50 }).notNull(),
  // ✅ ربط العمل بالخدمة
  serviceId: text("serviceId")
    .notNull()
    .references(() => digitalServices.id, { onDelete: "cascade" }),

  uploaderId: text("uploaderId").notNull(),
  uploadDate: timestamp("uploadDate").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const mediaFiles = pgTable("mediaFiles", {
  id: serial("id").primaryKey(),
  workId: text("workId")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 1024 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  publicId: varchar("publicId", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  size: integer("size"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
// 8. serviceRequests
export const serviceRequests = pgTable("serviceRequests", {
  id: text("id").primaryKey(),
  serviceId: text("serviceId")
    .notNull()
    .references(() => digitalServices.id),
  clientId: text("clientId")
    .notNull()
    .references(() => users.id),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  duration: varchar("duration", { length: 255 }).notNull(),
  status: serviceRequestStatusEnum("status").notNull(),
  assignedTo: text("assignedTo").references(() => users.id),
  contractUrl: varchar("contractUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const eventTypeEnum = pgEnum("event_type", [
  "news",
  "announcement",
  "article",
  "event",
  "update",
  "blog",
  "pressRelease",
  "promotion",
  "alert",
]);
// 9. news
export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  summary: text("summary"),
  imageUrl: varchar("imageUrl", { length: 500 }), // رابط الصورة الكامل
  imagePublicId: varchar("imagePublicId", { length: 255 }), // ✅ public_id من Cloudinary
  publishedAt: timestamp("publishedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  // الحقل الجديد لتحديد نوع الحدث
  eventType: eventTypeEnum("eventType").default("news").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 10. contactMessages
export const contactMessages = pgTable("contactMessages", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: contactMessageStatusEnum("status").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export const sliders = pgTable("sliders", {
  id: text("id").primaryKey(), // معرف السلايدر
  title: varchar("title", { length: 255 }).notNull(), // عنوان السلايدر
  imageUrl: text("imageUrl").notNull(), // رابط الصورة
  description: text("description").default(""), // الوصف اختياري
  isActive: boolean("isActive").default(true).notNull(), // حالة التفعيل
  order: integer("order").default(1).notNull(), // ترتيب العرض (رقم صحيح)
  createdAt: timestamp("createdAt").defaultNow().notNull(), // وقت الإنشاء
  updatedAt: timestamp("updatedAt").defaultNow().notNull(), // آخر تحديث
});

// 11. notifications
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 12. session
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// 13. account
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("users_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 14. verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ✅ جدول المهتمين (Leads) للتسجيل السريع بدون تسجيل دخول
export const courseLeads = pgTable("courseLeads", {
  id: text("id").primaryKey(),
  courseId: text("courseId")
    .notNull()
    .references(() => courses.id),
  sectionId: text("sectionId").references(() => courseSections.id),
  studentId: text("studentId").references(() => users.id),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  studentPhone: varchar("studentPhone", { length: 20 }).notNull(),
  studentEmail: varchar("studentEmail", { length: 320 }),
  studentAge: integer("studentAge"),
  studentMajor: varchar("studentMajor", { length: 255 }),
  studentCountry: varchar("studentCountry", { length: 255 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, interested, registered
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const courseLeadsRelations = relations(courseLeads, ({ one }) => ({
  course: one(courses, {
    fields: [courseLeads.courseId],
    references: [courses.id],
  }),
  section: one(courseSections, {
    fields: [courseLeads.sectionId],
    references: [courseSections.id],
  }),
  student: one(users, {
    fields: [courseLeads.studentId],
    references: [users.id],
  }),
}));

// 3. Relations Definitions

export const usersRelations = relations(users, ({ one, many }) => ({
  proposedCourses: many(courses, { relationName: "proposedBy" }),
  approvedCourses: many(courses, { relationName: "approvedBy" }),
  enrollments: many(courseEnrollments),
  clientRequests: many(serviceRequests, { relationName: "client" }),
  assignedRequests: many(serviceRequests, { relationName: "assignedTo" }),
  news: many(news),
  notifications: many(notifications),
  sessions: many(session),
  accounts: many(account),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  proposedBy: one(users, {
    fields: [courses.proposedBy],
    references: [users.id],
    relationName: "proposedBy",
  }),
  approvedBy: one(users, {
    fields: [courses.approvedBy],
    references: [users.id],
    relationName: "approvedBy",
  }),
  sections: many(courseSections),
  content: many(chapterContent),
}));

export const courseSectionsRelations = relations(
  courseSections,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseSections.courseId],
      references: [courses.id],
    }),
    enrollments: many(courseEnrollments),
  })
);

export const courseEnrollmentsRelations = relations(
  courseEnrollments,
  ({ one, many }) => ({
    section: one(courseSections, {
      fields: [courseEnrollments.sectionId],
      references: [courseSections.id],
    }),
    student: one(users, {
      fields: [courseEnrollments.studentId],
      references: [users.id],
    }),
    progress: many(studentProgress),
  })
);

export const chapterContentRelations = relations(
  chapterContent,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [chapterContent.chapterId],
      references: [courses.id],
    }),
    progress: many(studentProgress),
  })
);

// علاقة الأعمال
export const worksRelations = relations(works, ({ one, many }) => ({
  // كل عمل له ميديا متعددة
  media: many(mediaFiles),

  // لو بدك تربط العمل بالمستخدم اللي رفعه
  uploader: one(users, {
    fields: [works.uploaderId],
    references: [users.id],
    relationName: "uploader",
  }),
}));

// علاقة الميديا
export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  // كل ملف ميديا مرتبط بعمل واحد
  work: one(works, {
    fields: [mediaFiles.workId],
    references: [works.id],
  }),
}));

export const studentProgressRelations = relations(
  studentProgress,
  ({ one }) => ({
    enrollment: one(courseEnrollments, {
      fields: [studentProgress.enrollmentId],
      references: [courseEnrollments.id],
    }),
    content: one(chapterContent, {
      fields: [studentProgress.contentId],
      references: [chapterContent.id],
    }),
  })
);

export const digitalServicesRelations = relations(
  digitalServices,
  ({ many }) => ({
    requests: many(serviceRequests),
  })
);

export const serviceRequestsRelations = relations(
  serviceRequests,
  ({ one }) => ({
    service: one(digitalServices, {
      fields: [serviceRequests.serviceId],
      references: [digitalServices.id],
    }),
    client: one(users, {
      fields: [serviceRequests.clientId],
      references: [users.id],
      relationName: "client",
    }),
    assignedTo: one(users, {
      fields: [serviceRequests.assignedTo],
      references: [users.id],
      relationName: "assignedTo",
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));
