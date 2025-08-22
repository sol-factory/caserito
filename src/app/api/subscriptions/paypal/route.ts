import { CONFIG } from "@/config/constanst";
import { verifySession } from "@/helpers/auth";
import { getPaypalToken } from "@/helpers/paypal";
import connectDB from "@/lib/connectDB";
import { ErrorModel } from "@/schemas/error";
import { SubscriptionModel } from "@/schemas/subscription";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const subInfo = await request.json();
  await connectDB();
  const user = await verifySession();
  const token = await getPaypalToken();

  const currentSub = !subInfo._id
    ? null
    : await SubscriptionModel.findById(subInfo._id);

  const currentActiveSub = currentSub?.active;

  const payer_email = subInfo.mp_email || user.email;
  let subscription;
  let url = `${CONFIG.paypalBaseApiUrl}/v1/billing/subscriptions`;
  const method = currentSub ? "PUT" : "POST";
  const messages = {
    base_price: subInfo.wspBasePrice,
    amount: subInfo.wspAmount,
    limits: { month: { max: subInfo.messages } },
  };
  const quotes = {
    base_price: subInfo.quoteBasePrice,
    amount: subInfo.quoteAmount,
    limit: { max: subInfo.quotes },
  };
  const files = {
    base_price: subInfo.fileBasePrice,
    amount: subInfo.fileAmount,
    limit: { max: subInfo.files, start_date: new Date() },
  };

  try {
    if (!currentSub) {
      subscription = await SubscriptionModel.create({
        provider: "paypal",
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

    if (!!currentActiveSub) {
      url += `/${currentActiveSub.subscription_id}/revise`;
    }

    const transaction_amount =
      subInfo.amount +
      subInfo.wspAmount +
      subInfo.quoteAmount +
      subInfo.fileAmount;

    const interval_count = 1;
    const quantity = 1;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "PayPal-Request-Id": "SUBSCRIPTION-21092019-001",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: "P-8UC65507AW238874BM6HDF3Y",
        quantity,
        plan: {
          billing_cycles: [
            {
              sequence: 1,
              total_cycles: 0,
              frequency: {
                interval_unit: "MONTH",
                interval_count,
              },
              pricing_scheme: {
                fixed_price: {
                  currency_code: "USD",
                  value: transaction_amount,
                },
              },
            },
          ],
        },
      }),
    });
    const paypal_res = await res.json();

    if (res.status === 201) {
      subscription.subscription_id = paypal_res.id;
      subscription.details = paypal_res;
      await subscription.save();

      return NextResponse.json({
        ok: true,
        message: "Suscripción contratada",
        data: paypal_res.links[0].href,
      });
    } else {
      await ErrorModel.create({
        entity: "paypal-sub",
        body: subInfo,
        user,
      });
      return NextResponse.json({
        ok: false,
        message: paypal_res.message,
      });
    }
  } catch (error) {
    console.log({ error });
    await ErrorModel.create({
      entity: "paypal-sub",
      error_message: error?.message,
      body: subInfo,
      user,
    });
    return NextResponse.json({
      ok: false,
      message: "Hubo un error al contratar la suscripción",
    });
  }
}
