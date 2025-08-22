import connectDB from "@/lib/connectDB";
import NotificationModel from "@/schemas/notification";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import { ErrorModel } from "@/schemas/error";
import {
  SubscriptionModel,
  SubscriptionPaymentModel,
} from "@/schemas/subscription";
import CompanyModel from "@/schemas/company";
import { getFullDate } from "@/helpers/date";
import { registerPaymentReceived } from "@/helpers/mp";

export async function POST(request: Request) {
  const body = await request.json();
  await connectDB();

  // Step 2: Initialize the client object
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000, idempotencyKey: "abc" },
  });

  let entity, entity_data;

  if (body.entity === "preapproval") {
    entity = "preapproval";
    const preapproval = new PreApproval(client);
    entity_data = await preapproval.get({ id: body.data.id });
    const subFilter = { subscription_id: entity_data.id };
    const sub = await SubscriptionModel.findOneAndUpdate(
      subFilter,
      {
        $set: {
          active: entity_data.status === "authorized",
          details: entity_data,
          status: entity_data.status,
        },
      },
      { new: true }
    );
    if (!sub?.full_creation_date?.day && entity_data.status === "authorized") {
      await SubscriptionModel.findOneAndUpdate(subFilter, {
        $set: {
          full_creation_date: getFullDate(new Date()),
          "messages.limits.minute.max": 10,
          "messages.limits.hour.max": 30,
          "messages.limits.day.max": 100,
        },
      });
    }
    if (
      !sub?.full_cancellation_date?.day &&
      entity_data.status === "cancelled"
    ) {
      await SubscriptionModel.findOneAndUpdate(subFilter, {
        $set: { full_cancellation_date: getFullDate(new Date()) },
      });
    }
    if (!!sub) {
      await CompanyModel.findByIdAndUpdate(
        sub.company_id,
        {
          $set: { "subscription.active": entity_data.status === "authorized" },
        },
        { timestamps: false }
      );
    }

    await NotificationModel.create({
      origin: "mp",
      name: body.action,
      type: body.type,
      entity,
      entity_id: body.data.id,
      entity_data,
      body,
    });
  }

  if (body.entity === "payment" && !!body.data.id) {
    const result = await registerPaymentReceived(+body.data.id);

    entity = result.entity;
    entity_data = result.entity_data;
    console.log({ result });
  }

  await NotificationModel.create({
    origin: "mp",
    name: body.action,
    type: body.type,
    entity,
    entity_id: body.data.id,
    entity_data,
    body,
  });

  return NextResponse.json({ ok: true, message: "RECEIVED" });
}
