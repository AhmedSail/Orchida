import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { leadStatuses } from "@/src/db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const statuses = await db.query.leadStatuses.findMany({
      orderBy: [asc(leadStatuses.orderIndex)],
    });
    return NextResponse.json(statuses);
  } catch (error: any) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.label || !body.value) {
      return NextResponse.json({ message: "Label and Value are required" }, { status: 400 });
    }

    const newStatus = {
      id: uuidv4(),
      label: body.label,
      value: body.value,
      color: body.color || "gray",
      orderIndex: body.orderIndex || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(leadStatuses).values(newStatus);
    return NextResponse.json(newStatus);
  } catch (error: any) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}
