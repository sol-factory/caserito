import connectDB from "@/lib/connectDB";
import { ErrorModel } from "@/schemas/error";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  await connectDB();

  await ErrorModel.create({ entity: "ui", body });

  return NextResponse.json(body);
}
