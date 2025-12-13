import { db } from "@/src";
import { digitalServices } from "@/src/db/schema";
import { nanoid } from "nanoid";

export async function GET() {
  const data = await db.select().from(digitalServices);
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newService = {
    id: nanoid(),
    name: body.name,
    description: body.description || "",
    icon: body.icon || "",
    isActive: body.isActive ?? true,
  };

  await db.insert(digitalServices).values(newService);

  return Response.json({ message: "تمت إضافة الخدمة", service: newService });
}
