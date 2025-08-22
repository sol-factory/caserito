import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const bodyText = await request.text();
  const parsedBody = Object.fromEntries(new URLSearchParams(bodyText)); // Convertir a objeto JS

  await connectDB();

  // await NotificationModel.create({
  //   origin: "kommo",
  //   entity: "LEAD",
  //   body,
  // });

  return NextResponse.json({ ok: true, message: "RECEIVED" });
}
