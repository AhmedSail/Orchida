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
  primaryKey,
  index,
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

export const attendanceTypeEnum = pgEnum("attendance_type", [
  "in_person", // وجاهي
  "online", // أونلاين
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

// Enum للفئة المستهدفة للروابط التفاعلية
export const interactiveLinkTargetEnum = pgEnum("interactive_link_target", [
  "student",
  "instructor",
  "both",
]);

// 🏁 Competition/Quiz Enums
export const quizQuestionTypeEnum = pgEnum("quiz_question_type", [
  "mcq", // اختيار من متعدد
  "true_false", // صح أو خطأ
  "short_answer", // إجابة قصيرة
]);

export const quizSessionStatusEnum = pgEnum("quiz_session_status", [
  "waiting", // بانتظار اللاعبين
  "in_progress", // المسابقة بدأت
  "finished", // المسابقة انتهت
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
  whatsapp: varchar("whatsapp", { length: 20 }), // رقم الواتساب
  age: integer("age"), // العمر
  major: varchar("major", { length: 255 }), // التخصص الدراسي
  location: varchar("location", { length: 255 }), // الدولة والمدينة
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
  slug: varchar("slug", { length: 255 }), // الرابط بالإنجليزية
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  duration: text("duration"), // مدة الدورة (بالأيام أو الأسابيع)
  hours: integer("hours"), // عدد الساعات الفعلية للدورة
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 20 }).default("ILS").notNull(), // ILS, USD, JOD

  isActive: boolean("isActive").default(true).notNull(), // نشط أو لا
  isV2: boolean("isV2").default(false).notNull(), // نظام الدورات الجديد (LMS V2)

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
  isHidden: boolean("isHidden").default(false).notNull(), // ✅ حقل جديد لإخفاء الشعبة
  isFree: boolean("isFree").default(false).notNull(), // ✅ شعبة مجانية
  isV2: boolean("isV2").default(false).notNull(), // ✅ تفعيل النظام الجديد للشعبة

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
  attendanceType: attendanceTypeEnum("attendanceType"), // نوع الحضور: وجاهي أو أونلاين

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
  swiftCode: varchar("swiftCode", { length: 100 }),
  bankName: varchar("bankName", { length: 255 }),
  isBlocked: boolean("isBlocked").default(false).notNull(), // ✅ حقل حظر المحتوى
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

  // الطالب صاحب القصة أو العمل (اختياري لو تم إدخال الاسم يدوياً)
  studentId: text("studentId").references(() => users.id),

  studentName: varchar("studentName", { length: 255 }),

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
  youtubeUrl: varchar("youtubeUrl", { length: 500 }),

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
  imageUrls: text("imageUrls"),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  attachmentName: varchar("attachmentName", { length: 255 }),
  orderIndex: integer("orderIndex").notNull(), // ترتيب المحتوى داخل الفصل
  isPublished: boolean("isPublished").default(false).notNull(),
  scheduledAt: timestamp("scheduledAt"), // وقت ظهور المحتوى
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
  imageUrl: varchar("imageUrl", { length: 1024 }), // ✅ إضافة رابط الصورة
  videoUrl: varchar("videoUrl", { length: 1024 }), // ✅ إضافة رابط الفيديو
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
  imageUrl: varchar("imageUrl", { length: 1024 }), // ✅ إضافة رابط الصورة
  videoUrl: varchar("videoUrl", { length: 1024 }), // ✅ إضافة رابط الفيديو
  parentReplyId: text("parentReplyId"), // ✅ للرد على رد (instructor only) - self-reference
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
      table.contentId,
    ),
  }),
);

// جدول الشركة
export const companies = pgTable("companies", {
  id: text("id").primaryKey(), // معرف الشركة

  name: text("name").notNull(), // اسم الشركة
  phoneToCall: text("phoneToCall"), // رقم الهاتف للتواصل
  phoneToBank: text("phoneToBank"), // رقم الهاتف للاتصال
  email: text("email"), // البريد الإلكتروني
  address: text("address"), // العنوان
  workingHours: text("workingHours"), // ساعات العمل

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
  geminiGenApiKey: text("geminiGenApiKey"), // API Key الخاص بخدمة GeminiGen

  useQueueSystem: boolean("useQueueSystem").default(false).notNull(), // ✅ تفعيل نظام الانتظار والتشعيب اليدوي
  createdAt: timestamp("createdAt").defaultNow().notNull(), // وقت الإنشاء
  updatedAt: timestamp("updatedAt").defaultNow().notNull(), // آخر تحديث
});
// 7. digitalServices
export const digitalServices = pgTable("digitalServices", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }), // الرابط بالإنجليزية
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
  youtubeUrl: varchar("youtubeUrl", { length: 500 }),
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
export const instructorMediaLibrary = pgTable("instructorMediaLibrary", {
  id: uuid("id").defaultRandom().primaryKey(),
  instructorId: text("instructorId")
    .notNull()
    .references(() => users.id),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const instructorMediaLibraryRelations = relations(
  instructorMediaLibrary,
  ({ one }) => ({
    instructor: one(users, {
      fields: [instructorMediaLibrary.instructorId],
      references: [users.id],
    }),
  }),
);
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
  isSlider: boolean("isSlider").default(false).notNull(), // ✅ هل يظهر في السلايدر الرئيسي
  bgColor: varchar("bgColor", { length: 50 }).default("#6e5e9b"), // ✅ لون الخلفية في السلايدر
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
export const session = pgTable(
  "session",
  {
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
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
  }),
);

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
export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const jobApplications = pgTable("jobApplications", {
  id: text("id").primaryKey(),

  // Foreign Keys
  jobId: text("jobId")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // بيانات أساسية
  applicantName: varchar("applicantName", { length: 255 }).notNull(),
  applicantEmail: varchar("applicantEmail", { length: 320 }).notNull(),
  applicantPhone: varchar("applicantPhone", { length: 20 }).notNull(),
  applicantWhatsapp: varchar("applicantWhatsapp", { length: 20 }),

  // بيانات أكاديمية ومهنية
  applicantMajor: varchar("applicantMajor", { length: 255 }), // التخصص
  applicantEducation: varchar("applicantEducation", { length: 255 }), // المؤهل التعليمي
  applicantExperienceYears: integer("applicantExperienceYears"), // سنوات الخبرة

  // بيانات شخصية
  applicantGender: varchar("applicantGender", { length: 20 }), // ذكر / أنثى
  applicantLocation: varchar("applicantLocation", { length: 255 }), // مكان السكن
  applicantAge: integer("applicantAge"),

  // السيرة الذاتية
  applicantCV: text("applicantCV"), // رابط أو نص للسيرة الذاتية

  // حالة الطلب
  status: varchar("status", { length: 50 }).default("pending"), // pending, reviewed, accepted, rejected
  notes: text("notes"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
// علاقات (لو عندك جدول وظائف أو مستخدمين)
export const jobApplicationsRelations = relations(
  jobApplications,
  ({ one }) => ({
    // مثال: ربط بالوظيفة
    job: one(jobs, {
      fields: [jobApplications.jobId],
      references: [jobs.id],
    }),
    user: one(users, {
      fields: [jobApplications.userId],
      references: [users.id],
    }),
  }),
);

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
  attendanceType: attendanceTypeEnum("attendanceType"), // نوع الحضور: وجاهي أو أونلاين
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, interested, registered
  isActive: boolean("isActive").default(true).notNull(),
  nonResponseCount: integer("nonResponseCount").default(0).notNull(),
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
    instructor: one(instructors, {
      fields: [courseSections.instructorId],
      references: [instructors.id],
    }),
    enrollments: many(courseEnrollments),
  }),
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
  }),
);

export const chapterContentRelations = relations(
  chapterContent,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [chapterContent.chapterId],
      references: [courses.id],
    }),
    progress: many(studentProgress),
  }),
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
  }),
);

export const digitalServicesRelations = relations(
  digitalServices,
  ({ many }) => ({
    requests: many(serviceRequests),
  }),
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
  }),
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

// 15. SMS Templates
export const smsTemplates = pgTable("smsTemplates", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // عنوان القالب (للإدارة فقط)
  content: text("content").notNull(), // نص الرسالة
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: text("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const smsTemplatesRelations = relations(smsTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [smsTemplates.createdBy],
    references: [users.id],
  }),
}));

export const instructorRecommendations = pgTable("instructorRecommendations", {
  id: text("id").primaryKey(),
  instructorId: text("instructorId")
    .notNull()
    .references(() => instructors.id), // ربط بالمدرب
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  linkUrl: varchar("linkUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const recommendationToSections = pgTable(
  "recommendationToSections",
  {
    recommendationId: text("recommendationId")
      .notNull()
      .references(() => instructorRecommendations.id, { onDelete: "cascade" }),
    sectionId: text("sectionId")
      .notNull()
      .references(() => courseSections.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.recommendationId, t.sectionId] }),
  }),
);

export const instructorRecommendationsRelations = relations(
  instructorRecommendations,
  ({ one, many }) => ({
    instructor: one(instructors, {
      fields: [instructorRecommendations.instructorId],
      references: [instructors.id],
    }),
    sectionAssignments: many(recommendationToSections),
  }),
);

export const recommendationToSectionsRelations = relations(
  recommendationToSections,
  ({ one }) => ({
    recommendation: one(instructorRecommendations, {
      fields: [recommendationToSections.recommendationId],
      references: [instructorRecommendations.id],
    }),
    section: one(courseSections, {
      fields: [recommendationToSections.sectionId],
      references: [courseSections.id],
    }),
  }),
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

// 16. interactiveLinks
export const interactiveLinks = pgTable("interactiveLinks", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: text("courseId")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }), // مرتبطة بالكورس مباشرة
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 1024 }).notNull(),
  target: interactiveLinkTargetEnum("target").default("both").notNull(), // طالب، مدرب، أو كلاهما
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const interactiveLinksRelations = relations(
  interactiveLinks,
  ({ one }) => ({
    course: one(courses, {
      fields: [interactiveLinks.courseId],
      references: [courses.id],
    }),
  }),
);
// 17. Quizzes & Competitions
export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("coverImage", { length: 1024 }),
  creatorId: text("creatorId").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quizQuestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quizId")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  type: quizQuestionTypeEnum("type").default("mcq").notNull(),
  mediaUrl: varchar("mediaUrl", { length: 1024 }),
  mediaType: varchar("mediaType", { length: 50 }), // image, video
  timer: integer("timer").default(20).notNull(), // بالثواني
  points: integer("points").default(1000).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizOptions = pgTable("quizOptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("questionId")
    .references(() => quizQuestions.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("isCorrect").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizSessions = pgTable("quizSessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quizId")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  pin: varchar("pin", { length: 6 }).notNull().unique(),
  status: quizSessionStatusEnum("status").default("waiting").notNull(),
  hostId: text("hostId").references(() => users.id, { onDelete: "cascade" }),
  currentQuestionId: uuid("currentQuestionId"),
  questionStartTime: timestamp("questionStartTime"),
  timeLimit: integer("timeLimit").default(0), // Total time limit per participant in minutes. 0 = unlimited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizParticipantStatusEnum = pgEnum("quiz_participant_status", [
  "active",
  "eliminated",
  "finished",
  "left",
]);

export const quizParticipants = pgTable("quizParticipants", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("sessionId")
    .references(() => quizSessions.id, { onDelete: "cascade" })
    .notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  realName: varchar("realName", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  score: integer("score").default(0).notNull(),
  status: quizParticipantStatusEnum("status").default("active").notNull(),
  currentQuestionIndex: integer("currentQuestionIndex").default(0).notNull(),
  startedAt: timestamp("startedAt"), // When they started answering
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizResponses = pgTable("quizResponses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("sessionId")
    .references(() => quizSessions.id, { onDelete: "cascade" })
    .notNull(),
  participantId: uuid("participantId")
    .references(() => quizParticipants.id, { onDelete: "cascade" })
    .notNull(),
  questionId: uuid("questionId")
    .references(() => quizQuestions.id, { onDelete: "cascade" })
    .notNull(),
  optionId: uuid("optionId").references(() => quizOptions.id, {
    onDelete: "cascade",
  }),
  isCorrect: boolean("isCorrect").notNull(),
  pointsEarned: integer("pointsEarned").default(0).notNull(),
  responseTime: integer("responseTime").notNull(), // بميلي ثانية
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations
export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  questions: many(quizQuestions),
  creator: one(users, { fields: [quizzes.creatorId], references: [users.id] }),
}));

export const quizQuestionsRelations = relations(
  quizQuestions,
  ({ one, many }) => ({
    quiz: one(quizzes, {
      fields: [quizQuestions.quizId],
      references: [quizzes.id],
    }),
    options: many(quizOptions),
  }),
);

export const quizOptionsRelations = relations(quizOptions, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizOptions.questionId],
    references: [quizQuestions.id],
  }),
}));

export const quizSessionsRelations = relations(
  quizSessions,
  ({ one, many }) => ({
    quiz: one(quizzes, {
      fields: [quizSessions.quizId],
      references: [quizzes.id],
    }),
    participants: many(quizParticipants),
    responses: many(quizResponses),
  }),
);

export const quizParticipantsRelations = relations(
  quizParticipants,
  ({ one, many }) => ({
    session: one(quizSessions, {
      fields: [quizParticipants.sessionId],
      references: [quizSessions.id],
    }),
    responses: many(quizResponses),
  }),
);

export const quizResponsesRelations = relations(quizResponses, ({ one }) => ({
  session: one(quizSessions, {
    fields: [quizResponses.sessionId],
    references: [quizSessions.id],
  }),
  participant: one(quizParticipants, {
    fields: [quizResponses.participantId],
    references: [quizParticipants.id],
  }),
  question: one(quizQuestions, {
    fields: [quizResponses.questionId],
    references: [quizQuestions.id],
  }),
}));
// 17. Trending Products
export const trendingProducts = pgTable("trendingProducts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  link: varchar("link", { length: 1024 }),
  source: varchar("source", { length: 50 }).default("AliExpress"),
  isActive: boolean("isActive").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 18. AI Prompts
export const aiPrompts = pgTable("aiPrompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: text("sectionId")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const aiPromptsRelations = relations(aiPrompts, ({ one }) => ({
  section: one(courseSections, {
    fields: [aiPrompts.sectionId],
    references: [courseSections.id],
  }),
}));

// ==========================================
// 19. AI Credits System
// ==========================================
export const userCredits = pgTable("userCredits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").default(50).notNull(), // رصيد البداية (50 نقطة مجانية مثلاً)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const creditTransactions = pgTable("creditTransactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // الرقم سيكون بالسالب عند الاستهلاك (مثلاً -5) وبالموجب عند الشحن (مثلاً +100)
  description: varchar("description", { length: 255 }), // شرح الحركة، مثلاً: "Video Generation with Grok", "Purchased 100 credits"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [creditTransactions.userId],
      references: [users.id],
    }),
  }),
);

// ==========================================
// 20. AI Generation History
// ==========================================
export const aiGenerations = pgTable(
  "aiGenerations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskUuid: varchar("taskUuid", { length: 128 }), // UUID من GeminiGen API
    type: varchar("type", { length: 10 }).notNull(), // "video" | "image"
    provider: varchar("provider", { length: 50 }), // "Veo", "Grok", etc.
    model: varchar("model", { length: 100 }),
    prompt: text("prompt"),
    status: varchar("status", { length: 20 }).default("pending"), // "pending" | "completed" | "failed"
    resultUrl: text("resultUrl"), // رابط الفيديو أو الصورة الناتجة
    resultsJson: text("resultsJson"), // ✅ حقل جديد لتخزين مصفوفة الروابط بصيغة JSON
    thumbnailUrl: text("thumbnailUrl"),
    resolution: varchar("resolution", { length: 20 }),
    duration: integer("duration"), // بالثواني (للفيديوهات)
    creditCost: integer("creditCost").default(0),
    isRefunded: boolean("isRefunded").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("ai_gen_user_id_idx").on(table.userId),
    createdAtIdx: index("ai_gen_created_at_idx").on(table.createdAt),
  }),
);

export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  user: one(users, {
    fields: [aiGenerations.userId],
    references: [users.id],
  }),
}));

// ==========================================
// 21. Dynamic Service Pricing
// ==========================================
export const aiServicePricing = pgTable("aiServicePricing", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceType: varchar("serviceType", { length: 20 }).notNull(), // "video" | "image"
  provider: varchar("provider", { length: 50 }).notNull(), // "Veo", "Grok", "Imagen", etc.
  quality: varchar("quality", { length: 50 }).notNull(), // "720p", "1080p", "Standard", etc.
  duration: integer("duration"), // Duration in seconds (for videos)
  credits: integer("credits").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
// ==========================================
// 22. Chat Settings & Usage
// ==========================================
export const chatSettings = pgTable("chatSettings", {
  id: text("id")
    .primaryKey()
    .$default(() => "global"),
  freeMessages: integer("freeMessages").default(5).notNull(),
  creditsPerMessage: integer("creditsPerMessage").default(2).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const chatUsage = pgTable("chatUsage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  messageCount: integer("messageCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const chatUsageRelations = relations(chatUsage, ({ one }) => ({
  user: one(users, {
    fields: [chatUsage.userId],
    references: [users.id],
  }),
}));

// ==========================================
// 23. AI Prompts Library
// ==========================================
export const aiPromptsLibrary = pgTable("aiPromptsLibrary", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // "image" | "video"
  title: text("title"),
  promptText: text("promptText").notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==========================================
// 24. Learning Management System (LMS) V2
// ==========================================

// 1. هيكلية الدروس (Curriculum Lessons)
// هذا الجدول يخزن العناوين وترتيب الدروس داخل الدورة
export const curriculumLessons = pgTable("curriculumLessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: text("courseId").references(() => courses.id, {
    onDelete: "cascade",
  }), // الدروس أصبحت مرتبطة بالكورس مباشرة
  sectionId: text("sectionId").references(() => courseSections.id, {
    onDelete: "cascade",
  }), // بقاء الحقل اختيارياً للتوافق أو التخصيص
  mainTitle: varchar("mainTitle", { length: 255 }).notNull(), // العنوان الأساسي (إجباري)
  subTitle: varchar("subTitle", { length: 255 }), // العنوان الفرعي (اختياري)
  order: integer("order").notNull().default(1), // ترتيب الدرس في الدورة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 2. باني المحتوى الديناميكي (Curriculum Fields)
// هذا الجدول يسمح للمدرب بإضافة "حقول" متنوعة داخل الدرس الواحد (نص، فيديو، صورة، إلخ)
export const curriculumFields = pgTable("curriculumFields", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lessonId")
    .notNull()
    .references(() => curriculumLessons.id, { onDelete: "cascade" }),
  fieldType: varchar("fieldType", { length: 50 }).notNull(), // text, video, image, file, link
  content: text("content").notNull(), // النص أو رابط الميديا
  order: integer("order").notNull().default(1), // ترتيب الحقل داخل الدرس
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 3. صلاحيات المدربين على الدورات (Instructor Course Access)
// لضمان أن المدرب يرى فقط الدورات المسندة إليه
export const instructorCourseAccess = pgTable(
  "instructorCourseAccess",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    instructorId: text("instructorId")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    courseId: text("courseId")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    unq: unique().on(table.instructorId, table.courseId),
  }),
);

// 4. تتبع تقدم الطالب (Student Lesson Progress)
// يستخدم في نظام الأونلاين لفتح الدروس تتابعيًا
export const lessonProgress = pgTable(
  "lessonProgress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("studentId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lessonId")
      .notNull()
      .references(() => curriculumLessons.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).default("completed"), // completed
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => ({
    unq: unique().on(table.studentId, table.lessonId),
  }),
);

// 5. تفعيل الدروس في الشعب الوجاهية (Section Lesson Availability)
// يستخدم في النظام الوجاهي ليقوم المدرب بتفعيل درس محدد لطلاب شعبة معينة
export const sectionLessonAvailability = pgTable(
  "sectionLessonAvailability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionId: text("sectionId")
      .notNull()
      .references(() => courseSections.id, { onDelete: "cascade" }),
    lessonId: uuid("lessonId")
      .notNull()
      .references(() => curriculumLessons.id, { onDelete: "cascade" }),
    isEnabled: boolean("isEnabled").default(false).notNull(),
    enabledAt: timestamp("enabledAt"),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    unq: unique().on(table.sectionId, table.lessonId),
  }),
);

// 6. إخفاء الدروس العامة عن شعب معينة (Section Hidden Lessons)
// يستخدم لإخفاء درس عام نهائياً من منهج شعبة محددة
export const sectionHiddenLessons = pgTable(
  "sectionHiddenLessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionId: text("sectionId")
      .notNull()
      .references(() => courseSections.id, { onDelete: "cascade" }),
    lessonId: uuid("lessonId")
      .notNull()
      .references(() => curriculumLessons.id, { onDelete: "cascade" }),
    hiddenAt: timestamp("hiddenAt").defaultNow().notNull(),
  },
  (table) => ({
    unq: unique().on(table.sectionId, table.lessonId),
  }),
);

// العلاقات (Relations)
export const curriculumLessonsRelations = relations(
  curriculumLessons,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [curriculumLessons.courseId],
      references: [courses.id],
    }),
    section: one(courseSections, {
      fields: [curriculumLessons.sectionId],
      references: [courseSections.id],
    }),
    fields: many(curriculumFields),
    availability: many(sectionLessonAvailability),
    progress: many(lessonProgress),
  }),
);

export const curriculumFieldsRelations = relations(
  curriculumFields,
  ({ one }) => ({
    lesson: one(curriculumLessons, {
      fields: [curriculumFields.lessonId],
      references: [curriculumLessons.id],
    }),
  }),
);

export const instructorCourseAccessRelations = relations(
  instructorCourseAccess,
  ({ one }) => ({
    instructor: one(instructors, {
      fields: [instructorCourseAccess.instructorId],
      references: [instructors.id],
    }),
    course: one(courses, {
      fields: [instructorCourseAccess.courseId],
      references: [courses.id],
    }),
  }),
);

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  student: one(users, {
    fields: [lessonProgress.studentId],
    references: [users.id],
  }),
  lesson: one(curriculumLessons, {
    fields: [lessonProgress.lessonId],
    references: [curriculumLessons.id],
  }),
}));

export const sectionLessonAvailabilityRelations = relations(
  sectionLessonAvailability,
  ({ one }) => ({
    section: one(courseSections, {
      fields: [sectionLessonAvailability.sectionId],
      references: [courseSections.id],
    }),
    lesson: one(curriculumLessons, {
      fields: [sectionLessonAvailability.lessonId],
      references: [curriculumLessons.id],
    }),
  }),
);

// ==========================================
// 25. Lead Statuses (حالات المهتمين)
// جدول لإدارة حالات المهتمين ديناميكياً
// ==========================================
export const leadStatuses = pgTable("leadStatuses", {
  id: text("id").primaryKey(),
  value: varchar("value", { length: 100 }).notNull().unique(), // المفتاح البرمجي مثل "new", "contacted"
  label: varchar("label", { length: 255 }).notNull(), // الاسم العربي للعرض
  color: varchar("color", { length: 100 }).notNull().default("gray"), // اللون: blue, red, green, etc.
  orderIndex: integer("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ==========================================
// 26. Course Applications (نظام الطابور الجديد)
// ==========================================
export const courseApplications = pgTable(
  "courseApplications",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("courseId")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),

    // الحالة مرتبطة بجدول leadStatuses
    statusValue: varchar("statusValue", { length: 100 })
      .notNull()
      .references(() => leadStatuses.value, { onDelete: "restrict" })
      .default("new"),

    attendanceType: attendanceTypeEnum("attendanceType").default("in_person"),
    studentNotes: text("studentNotes"),
    adminNotes: text("adminNotes"),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    courseIdIdx: index("course_app_course_id_idx").on(table.courseId),
    userIdIdx: index("course_app_user_id_idx").on(table.userId),
    createdAtIdx: index("course_app_created_at_idx").on(table.createdAt),
  }),
);

export const courseApplicationsRelations = relations(
  courseApplications,
  ({ one }) => ({
    user: one(users, {
      fields: [courseApplications.userId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [courseApplications.courseId],
      references: [courses.id],
    }),
    status: one(leadStatuses, {
      fields: [courseApplications.statusValue],
      references: [leadStatuses.value],
    }),
  }),
);

// ==========================================
// 27. Free Lessons (الدروس المجانية)
// ==========================================
export const freeLessonCategories = pgTable("freeLessonCategories", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  order: integer("order").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const freeLessons = pgTable("freeLessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("categoryId").references(() => freeLessonCategories.id, { onDelete: "set null" }), // ربط بالتصنيف
  mainTitle: varchar("mainTitle", { length: 255 }).notNull(), // العنوان الأساسي
  subTitle: varchar("subTitle", { length: 255 }), // العنوان الفرعي
  description: text("description"),
  order: integer("order").default(1).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const freeLessonFields = pgTable("freeLessonFields", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lessonId")
    .notNull()
    .references(() => freeLessons.id, { onDelete: "cascade" }),
  fieldType: varchar("fieldType", { length: 50 }).notNull(), // text, video, image, file, link
  content: text("content").notNull(),
  order: integer("order").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const freeLessonsRelations = relations(freeLessons, ({ one, many }) => ({
  category: one(freeLessonCategories, {
    fields: [freeLessons.categoryId],
    references: [freeLessonCategories.id],
  }),
  fields: many(freeLessonFields),
}));

export const freeLessonCategoriesRelations = relations(freeLessonCategories, ({ many }) => ({
  lessons: many(freeLessons),
}));

export const freeLessonFieldsRelations = relations(
  freeLessonFields,
  ({ one }) => ({
    lesson: one(freeLessons, {
      fields: [freeLessonFields.lessonId],
      references: [freeLessons.id],
    }),
  }),
);
