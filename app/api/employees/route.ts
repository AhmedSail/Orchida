import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/src";
import { employees } from "@/src/db/schema";

export async function GET() {
  const allEmployees = await db.select().from(employees);
  return Response.json(allEmployees);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newEmployee = {
    id: nanoid(),
    name: body.name,
    specialty: body.specialty,
    email: body.email || null,
    phone: body.phone || null,
  };

  await db.insert(employees).values(newEmployee);

  return Response.json({
    message: "تم إضافة الموظف بنجاح",
    employee: newEmployee,
  });
}
