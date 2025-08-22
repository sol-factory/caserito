import connectDB from "@/lib/connectDB";
import { ErrorModel } from "@/schemas/error";
import NotificationModel from "@/schemas/notification";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import {
  SubscriptionModel,
  SubscriptionPaymentModel,
} from "@/schemas/subscription";
import CompanyModel from "@/schemas/company";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
const payment = new Payment(client);
const preapproval = new PreApproval(client);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const idFromQuery = url.searchParams.get("id");
  const topic = url.searchParams.get("topic");
  console.log({ topic, idFromQuery });
  if (topic === "payment") {
    const paymentInfo = await payment.get({ id: idFromQuery });
    try {
      console.log({ paymentInfo });
      await connectDB();
      const preapproval_id = paymentInfo.metadata.preapproval_id;
      await NotificationModel.create({
        origin: "mp",
        name: "Pago manual recibido",
        type: topic,
        entity: "Subscription",
        entity_id: preapproval_id,
        body: paymentInfo,
      });
      if (paymentInfo.status === "approved") {
        const sub = await SubscriptionModel.findOne({
          subscription_id: preapproval_id,
        });
        await SubscriptionPaymentModel.updateOne(
          { payment_id: paymentInfo.id },
          {
            provider: "mp",
            store_id: sub.store_id,
            payment_id: paymentInfo.id,
            subscription_id: paymentInfo.external_reference, // el que obtuviste del metadata del pago
            amount: paymentInfo.transaction_amount,
            status: paymentInfo.status,
            is_manual: true,
            details: paymentInfo,
            currency: paymentInfo.currency_id,
          },
          { upsert: true }
        );
        const result = await preapproval.update({
          id: preapproval_id, // el que obtuviste del metadata del pago
          body: { status: "authorized" },
        });

        console.log("Preapproval updated:", result);
        if (result) {
          await SubscriptionModel.updateOne(
            { subscription_id: preapproval_id },
            {
              status: "authorized",
              active: true,
            }
          );
          await CompanyModel.updateOne(
            { _id: sub.company_id },
            { $set: { "subscription.active": true } }
          );
        }
      }
    } catch (error) {
      console.log({ error });
      await ErrorModel.create({
        entity: "mp-payment-info-error",
        error_message: error?.message,
        body: paymentInfo,
        metadata: error,
      });
      return NextResponse.json({
        ok: false,
        message: "Hubo un error al recibir el pago manual",
      });
    }
  }
  return NextResponse.json({
    ok: true,
    message: "Received",
  });
}
