import { login } from "@/actions/user";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, code } = await request.json();
  const result = await login({ email, code });
  console.log({ email, code, result });
  return NextResponse.json(result);
}
