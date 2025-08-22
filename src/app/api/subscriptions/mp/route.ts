import { verifySession } from "@/helpers/auth";
import { getNextLockDate } from "@/helpers/date";
import connectDB from "@/lib/connectDB";
import { ErrorModel } from "@/schemas/error";
import { SubscriptionModel } from "@/schemas/subscription";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const subInfo = await request.json();
  await connectDB();
  const user = await verifySession();

  const currentSub = !subInfo._id
    ? null
    : await SubscriptionModel.findById(subInfo._id);

  try {
    const messages = {
      base_price: subInfo.wspBasePrice,
      amount: subInfo.wspAmount,
      limits: { month: { max: subInfo.messages, start_date: new Date() } },
    };
    const quotes = {
      base_price: subInfo.quoteBasePrice,
      amount: subInfo.quoteAmount,
      limit: { max: subInfo.quotes, start_date: new Date() },
    };
    const files = {
      base_price: subInfo.fileBasePrice,
      amount: subInfo.fileAmount,
      limit: { max: subInfo.files, start_date: new Date() },
    };
    const payer_email = subInfo.mp_email || user.email;
    let subscription;
    if (!currentSub) {
      subscription = await SubscriptionModel.create({
        provider: "mp",
        company_id: user.company._id,
        company_name: user.company.name,
        payer_email,
        amount: subInfo.amount,
        messages,
        quotes,
        files,
        store_id: subInfo.quotes > 0 ? user.store._id : null,
        active: false,
        status: "created",
        payment_status: "pending",
      });
    } else {
      subscription = await SubscriptionModel.findByIdAndUpdate(subInfo._id, {
        $set: {
          amount: subInfo.amount,
          "messages.base_price": messages.base_price,
          "messages.amount": messages.amount,
          "messages.limits.month.max": messages.limits.month.max,
          "quotes.base_price": quotes.base_price,
          "quotes.amount": quotes.amount,
          "quotes.limit.max": quotes.limit.max,
          "files.base_price": files.base_price,
          "files.amount": files.amount,
          "files.limit.max": files.limit.max,
        },
      });
    }

    let method = currentSub ? "PUT" : "POST";

    const transaction_amount =
      subInfo.amount +
      subInfo.wspAmount +
      subInfo.quoteAmount +
      subInfo.fileAmount;

    const reason = `1 sucursal Aquapp (${subInfo.messages} mensajes, ${subInfo.quotes} PDFs, ${subInfo.files} adjuntos)`;

    const frequency = 1;

    const back_url = "https://www.aquapp.lat/subscription";

    const auto_recurring = {
      frequency,
      frequency_type: "months",
      transaction_amount,
      currency_id: "ARS",
    };

    let url = "https://api.mercadopago.com/preapproval";
    if (currentSub) {
      url += `/${currentSub.subscription_id}`;
      method = "PUT";
      delete auto_recurring.frequency;
      delete auto_recurring.frequency_type;
    }

    const body = currentSub
      ? { reason, auto_recurring }
      : {
          reason,
          auto_recurring,
          external_reference: subscription._id,
          payer_email,
          back_url,
          status: "pending",
        };
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const response = await res.json();
    console.log({ response, res });

    if ([200, 201].includes(res.status)) {
      subscription.lockedUntil = getNextLockDate(new Date());
      subscription.subscription_id = response.id;
      subscription.details = response;
      await subscription.save();

      return NextResponse.json({
        ok: true,
        message: "Redirigiendo a Mercado Pago...",
        data: response.init_point,
      });
    } else {
      await ErrorModel.create({
        entity: "mp-sub",
        body,
        user,
        metadata: response,
      });
      return NextResponse.json({
        ok: false,
        message: response.message,
      });
    }
  } catch (error) {
    console.log({ error });
    await ErrorModel.create({
      entity: "mp-sub-error",
      error_message: error?.message,
      body: subInfo,
      user,
      metadata: error,
    });
    return NextResponse.json({
      ok: false,
      message: "Hubo un error al contratar la suscripción",
    });
  }
}
