import { createEvent, login } from "@/actions/user";
import { NextResponse, userAgent } from "next/server";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { ErrorModel } from "@/schemas/error";

export async function POST(request: Request) {
  const { email, code } = await request.json();
  const ua = userAgent(request);

  const headersList = await headers();
  const geo = {
    country: headersList.get("x-vercel-ip-country"),
    city: headersList.get("x-vercel-ip-city"),
    flag: headersList.get("x-vercel-ip-flag"),
    timezone: headersList.get("x-vercel-ip-timezone"),
  };
  const uaParser = new UAParser(ua.ua);
  const { browser, device, os, engine } = uaParser.getResult();
  try {
    await createEvent(
      {
        data: {
          browser: { ...browser },
          device: { ...device },
          os: { ...os },
          engine: { ...engine },
          origin: "aquapp",
          name: "Login",
        },
      },
      { email, geo }
    );
  } catch (error) {
    await ErrorModel.create({
      entity: "login",
      body: { email, code },
    });
  }
  const result = await login({ email, code, geo });
  return NextResponse.json(result);
}
