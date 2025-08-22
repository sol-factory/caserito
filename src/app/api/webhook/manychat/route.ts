import connectDB from "@/lib/connectDB";
import NotificationModel from "@/schemas/notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json(); // Convertir a objeto JS

  await connectDB();

  await NotificationModel.create({
    origin: "manychat",
    entity: "LEAD",
    body,
  });

  return NextResponse.json({ ok: true, message: "RECEIVED" });
}
