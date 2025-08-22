import { getFullDate } from "@/helpers/date";
import connectDB from "@/lib/connectDB";
import CompanyModel from "@/schemas/company";
import NotificationModel from "@/schemas/notification";
import { SubscriptionModel } from "@/schemas/subscription";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  await connectDB();
  await NotificationModel.create({ body, params: request });

  if (
    body.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" ||
    body.event_type === "BILLING.SUBSCRIPTION.UPDATED"
  ) {
    const paypal_sub = body.resource;
    const activated = paypal_sub.status === "ACTIVE";
    const canceled = paypal_sub.status === "CANCELED";
    const subFilter = {
      subscription_id: paypal_sub.id,
    };
    const sub = await SubscriptionModel.findOneAndUpdate(
      {
        subscription_id: paypal_sub.id,
      },
      {
        $set: {
          details: { ...paypal_sub, init_point: paypal_sub?.links[0]?.href },
          active: activated,
          status: paypal_sub.status,
        },
      },
      { new: true }
    );

    if (!sub?.full_creation_date?.day && activated) {
      await SubscriptionModel.findOneAndUpdate(subFilter, {
        $set: {
          full_creation_date: getFullDate(new Date()),
          "messages.limits.minute.max": 10,
          "messages.limits.hour.max": 30,
          "messages.limits.day.max": 100,
        },
      });
    }
    if (!sub?.full_cancellation_date?.day && canceled) {
      await SubscriptionModel.findOneAndUpdate(subFilter, {
        $set: { full_cancellation_date: getFullDate(new Date()) },
      });
    }

    await CompanyModel.findByIdAndUpdate(sub.company_id, {
      $set: { "subscription.active": paypal_sub.status === "ACTIVE" },
    });
  }

  await NotificationModel.create({
    origin: "paypal",
    name: body.summary,
    type: body.event_type,
    entity: body.resource_type,
    entity_id: body.resource.id,
    entity_data: body.resource,
    body,
  });

  return NextResponse.json({ ok: true, message: "RECEIVED" });
}
