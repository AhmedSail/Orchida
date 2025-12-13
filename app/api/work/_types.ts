// src/app/api/work/_types.ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { works } from "@/src/db/schema";

export type Work = InferSelectModel<typeof works>;
export type NewWork = InferInsertModel<typeof works>;

export function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

// Minimal body validation for create/update
export function validateNewWork(body: Partial<NewWork>) {
  if (!body.title || !body.category) {
    return "title and category are required";
  }
  return null;
}
