import { pgTable, text, varchar, timestamp, decimal, boolean, pgEnum, integer, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Enums Definitions
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "training_coordinator",
  "project_acquirer",
  "specialist_technician",
]);

export const courseStatusEnum = pgEnum("course_status", [
  "draft",
  "pending_approval",
  "approved",
  "active",
  "archived",
]);

export const sectionStatusEnum = pgEnum("section_status", [
  "open",
  "closed",
  "in_progress",
  "completed",
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
  role: userRoleEnum("role"),
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
  duration: integer("duration"),
  price: decimal("price", { precision: 10, scale: 2 }),
  status: courseStatusEnum("status").notNull(),
  proposedBy: text("proposedBy").references(() => users.id),
  approvedBy: text("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 3. courseSections
export const courseSections = pgTable("courseSections", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id),
  sectionNumber: integer("sectionNumber").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  maxCapacity: integer("maxCapacity"),
  currentEnrollment: integer("currentEnrollment").default(0).notNull(),
  status: sectionStatusEnum("status").notNull(),
  isClosed: boolean("isClosed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 4. courseEnrollments
export const courseEnrollments = pgTable("courseEnrollments", {
  id: text("id").primaryKey(),
  sectionId: text("sectionId").notNull().references(() => courseSections.id),
  studentId: text("studentId").references(() => users.id),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  studentEmail: varchar("studentEmail", { length: 320 }).notNull(),
  studentPhone: varchar("studentPhone", { length: 20 }),
  registrationNumber: varchar("registrationNumber", { length: 50 }).unique(),
  confirmationStatus: confirmationStatusEnum("confirmationStatus").notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").notNull(),
  username: varchar("username", { length: 255 }),
  password: varchar("password", { length: 255 }),
  smsNotificationSent: boolean("smsNotificationSent").default(false).notNull(),
  isInIntroductorySession: boolean("isInIntroductorySession").default(false).notNull(),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 5. courseContent
export const courseContent = pgTable("courseContent", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: contentContentTypeEnum("contentType").notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }),
  textContent: text("textContent"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  attachmentName: varchar("attachmentName", { length: 255 }),
  orderIndex: integer("orderIndex").notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 6. studentProgress
export const studentProgress = pgTable("studentProgress", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollmentId").notNull().references(() => courseEnrollments.id),
  contentId: text("contentId").notNull().references(() => courseContent.id),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  progress: integer("progress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
},
  (table) => ({
    uniqueEnrollmentContent: unique("unique_enrollment_content").on(table.enrollmentId, table.contentId),
  })
);

// 7. digitalServices
export const digitalServices = pgTable("digitalServices", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 8. serviceRequests
export const serviceRequests = pgTable("serviceRequests", {
  id: text("id").primaryKey(),
  serviceId: text("serviceId").notNull().references(() => digitalServices.id),
  clientId: text("clientId").notNull().references(() => users.id),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  status: serviceRequestStatusEnum("status").notNull(),
  assignedTo: text("assignedTo").references(() => users.id),
  contractUrl: varchar("contractUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 9. news
export const news = pgTable("news", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  summary: text("summary"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  publishedAt: timestamp("publishedAt"),
  createdBy: text("createdBy").references(() => users.id),
  isActive: boolean("isActive").default(true).notNull(),
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

// 11. notifications
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
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
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

// 13. account
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("users_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// 14. verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

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
  content: many(courseContent),
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

export const courseContentRelations = relations(
  courseContent,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseContent.courseId],
      references: [courses.id],
    }),
    progress: many(studentProgress),
  })
);

export const studentProgressRelations = relations(
  studentProgress,
  ({ one }) => ({
    enrollment: one(courseEnrollments, {
      fields: [studentProgress.enrollmentId],
      references: [courseEnrollments.id],
    }),
    content: one(courseContent, {
      fields: [studentProgress.contentId],
      references: [courseContent.id],
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

export const newsRelations = relations(news, ({ one }) => ({
  createdBy: one(users, {
    fields: [news.createdBy],
    references: [users.id],
  }),
}));

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
