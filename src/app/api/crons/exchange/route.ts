import { getUSDExchangeRate } from "@/helpers/currency";
import connectDB from "@/lib/connectDB";
import { ErrorModel } from "@/schemas/error";
import ExchangeModel from "@/schemas/exchange";
import { SaleModel } from "@/schemas/sale";

export async function GET(request) {
  await connectDB();

  const now = new Date();
  try {
    console.log("EXCHANGE Cron ejecutado a las:", now.toISOString());

    const usd_exchange_rate = await getUSDExchangeRate(now);

    const day = now.getDate();
    const month = now.getMonth() + 1; // Los meses en JavaScript son 0-indexados
    const year = now.getFullYear();
    await ExchangeModel.findOneAndUpdate(
      {
        "full_day.day": day,
        "full_day.month": month,
        "full_day.year": year,
      },
      {
        to_currency: "ars",
        rate: usd_exchange_rate,
        currency: "usd",
      },
      { upsert: true }
    );

    await SaleModel.updateMany(
      {
        "full_date.day": now.getDate(),
        "full_date.month": month,
        "full_date.year": year,
        pending_rate: true,
      },
      { $set: { aquapp_exchange_rate: usd_exchange_rate, pending_rate: false } }
    );

    return new Response("Cron ejecutado correctamente ✅");
  } catch (error) {
    await ErrorModel.create({
      entity: "Cron USD Exchange",
      error_message: error?.message,
      body: { date: now },
      metadata: error,
    });
    console.error("Error al ejecutar el cron de exchange:", error);
  }
}
