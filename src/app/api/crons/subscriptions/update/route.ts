// O donde esté tu lógica
import connectDB from "@/lib/connectDB";
import { SubscriptionModel } from "@/schemas/subscription";
import { CONFIG } from "@/config/constanst";
import { getNextLockDate } from "@/helpers/date";

export async function GET() {
  await connectDB();

  const today = new Date();
  const subs = await SubscriptionModel.find({
    provider: "mp",
    active: true,
    lockedUntil: { $lt: today },
    status: "authorized",
    // automatic: true,
  });

  let updatedCount = 0;

  for (const sub of subs) {
    const config = CONFIG.subscriptions;
    const currentPrices = config.prices("AR", new Date(), 0);
    if (!currentPrices) continue;

    const {
      aquapp: aquappBase,
      whatsapp_base,
      quotes_base,
      files_base,
    } = currentPrices;

    const oldWspBase = sub.messages?.base_price;
    const oldQuoteBase = sub.quotes?.base_price;
    const oldFileBase = sub.files?.base_price;

    const finalFrequency = sub.frequency === 12 ? 10 : 1;
    const newAquappBase = aquappBase * finalFrequency || 0;
    const newWspBase = whatsapp_base * finalFrequency || 0;
    const newQuoteBase = quotes_base * finalFrequency || 0;
    const newFileBase = files_base * finalFrequency || 0;

    // Si los precios no cambiaron, skip
    console.log({
      name: sub.company_name,
      oldWspBase,
      newWspBase,
      oldQuoteBase,
      newQuoteBase,
    });
    if (
      oldWspBase === newWspBase &&
      oldQuoteBase === newQuoteBase &&
      oldFileBase === newFileBase
    )
      continue;

    // Calculamos nuevo monto
    const wspQty =
      sub.messages?.limits?.month?.max > config.whatsapp.free_limit
        ? sub.messages?.limits?.month?.max
        : 0;
    const quoteQty =
      sub.quotes?.limit?.max > config.quote.free_limit
        ? sub.quotes?.limit?.max
        : 0;
    const fileQty =
      sub.files?.limit?.max > config.file.free_limit
        ? sub.files?.limit?.max
        : 0;

    const newWspAmount = newWspBase * wspQty;
    const newQuotesAmount = newQuoteBase * quoteQty;
    const newFilesAmount = newFileBase * fileQty;
    const total =
      newAquappBase + newWspAmount + newQuotesAmount + newFilesAmount;

    const body = {
      auto_recurring: {
        transaction_amount: total,
        currency_id: "ARS",
      },
    };
    console.log({ body });

    // Actualizar en MP
    const mpRes = await fetch(
      `https://api.mercadopago.com/preapproval/${sub.subscription_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    );

    const mpResponse = await mpRes.json();
    console.log({ mpResponse });

    if ([200, 201].includes(mpRes.status)) {
      // Guardar en Mongo
      sub.messages.base_price = newWspBase;
      sub.messages.amount = newWspAmount;
      sub.quotes.base_price = newQuoteBase;
      sub.quotes.amount = newQuotesAmount;
      sub.files.base_price = newFileBase;
      sub.files.amount = newFilesAmount;
      sub.amount = newAquappBase;
      sub.lockedUntil = getNextLockDate(today);
      sub.last_price_update = today;
      sub.details = mpResponse;
      await sub.save({ timestamps: false });
      updatedCount++;
    } else {
      console.error("Error updating in MP", mpResponse);
      // Podés loggear en ErrorModel también si querés
    }
  }

  return new Response(JSON.stringify({ ok: true, updated: updatedCount }), {
    status: 200,
  });
}
