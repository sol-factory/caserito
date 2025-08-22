import { createEvent } from "@/actions/user";
import { getContactByLeadId } from "@/helpers/kommo";
import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }) {
  const { origin, desc } = await params;
  const ua: any = await userAgent(request);
  const { browser, device, os, engine } = ua;

  const splitted_origin = origin.split("-");
  const origin_source = splitted_origin[0];
  const lead_id = splitted_origin[1];

  const redirectUrls = {
    tutoriales: "https://youtu.be/LsMtF3x8OZw",
    whatsapp: "https://youtu.be/xe1Q-0HPYKg",
  };

  const redirect_url = redirectUrls[desc] || `https://www.aquapp.lat`;
  try {
    let whatsapp, contact, instagram;
    if (!!lead_id && origin_source === "wsp") {
      contact = await getContactByLeadId(lead_id);
      whatsapp = contact?.phone;
    }

    if (!!lead_id && origin_source === "ig") {
      instagram = lead_id;
    }

    const data = {
      browser: { ...browser },
      device: { ...device },
      os: { ...os },
      engine: { ...engine },
      whatsapp,
      instagram,
      lead_id,
      origin: origin_source,
      name: `Click en enlace ${desc.toUpperCase()} - ${origin_source}`,
    };

    const result = await createEvent({ data }, null);
  } catch (error) {
    console.log({ error });
  } finally {
    return NextResponse.redirect(new URL(redirect_url));
  }
}
