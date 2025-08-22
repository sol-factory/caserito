import CompanyModel from "@/schemas/company";
import { ErrorModel } from "@/schemas/error";
import { InvoiceModel } from "@/schemas/invoice";
import StoreModel from "@/schemas/store";
import {
  SubscriptionModel,
  SubscriptionPaymentModel,
} from "@/schemas/subscription";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { getFullDate } from "./date";

export const registerPaymentReceived = async (id: number) => {
  let entity, entity_data;

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000, idempotencyKey: "abc" },
  });

  if (!!id) {
    // Step 3: Initialize the API object
    const payment = new Payment(client);
    entity = "payment";
    try {
      entity_data = await payment.get({ id });
      const sub = await SubscriptionModel.findById(
        entity_data.external_reference
      );
      await SubscriptionPaymentModel.updateOne(
        { payment_id: entity_data.id },
        {
          provider: "mp",
          store_id: sub.store_id,
          payment_id: entity_data.id,
          subscription_id: entity_data.external_reference, // el que obtuviste del metadata del pago
          amount: entity_data.transaction_amount,
          status: entity_data.status,
          details: entity_data,
          currency: entity_data.currency_id,
        },
        { upsert: true }
      );
      if (entity_data.status === "approved") {
        // const invoice = await InvoiceModel.findOne({
        //   mp_payment_id: entity_data.id,
        // });
        // Reactivamos la facturación cuando pase el desarrollo a AEC.
        // if (!invoice && !!sub?.store_id) {
        //   const store = await StoreModel.findById(sub.store_id, "address");
        //   const company = await CompanyModel.findByIdAndUpdate(
        //     sub.company_id,
        //     {
        //       $set: { last_billing_date: new Date() },
        //     },
        //     { new: true, timestamps: false }
        //   );
        //   const body = {
        //     client: {
        //       company_id: sub.company_id,
        //       store_id: sub.store_id,
        //       address: store.address,
        //       name: company.name,
        //     },
        //     amount: entity_data.transaction_amount,
        //     full_invoice_date: getFullDate(),
        //     mp_payment_id: entity_data.id,
        //   };
        //   // CAMBIAR LA URL CUANDO VOLVAMOS A SUBIR LA APP EN FLY.IO
        //   await fetch(
        //     `https://invoice-app-quiet-glitter-9644.fly.dev/arca/invoice/mig`,
        //     {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify(body),
        //     }
        //   );
        // }
      }
      return { entity, entity_data };
    } catch (error) {
      console.log({ error });
      ErrorModel.create({
        origin: "registering-mp-payment",
        entity,
        error_type: error.name || "UnknownError",
        error_message: error.message,
      });
    }
  } else {
    return null;
  }
};
