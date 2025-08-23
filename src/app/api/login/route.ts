import { createEvent, login } from "@/actions/user";
import { NextResponse, userAgent } from "next/server";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { ErrorModel } from "@/schemas/error";

export async function POST(request: Request) {
  const { email, code } = await request.json();

  const result = await login({ email, code });
  return NextResponse.json(result);
}
