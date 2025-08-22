import { getMetaAdSpendForCurrentMonth } from "@/helpers/meta";
import connectDB from "@/lib/connectDB";
import CompanyModel from "@/schemas/company";
import StatsModel from "@/schemas/stats";
import { SubscriptionModel } from "@/schemas/subscription";
import { addDays } from "date-fns";

export async function GET(request) {
  const now = new Date();
  console.log("STATS Cron ejecutado a las:", now.toISOString());

  const meta_ads_spent = await getMetaAdSpendForCurrentMonth();

  await connectDB();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const canceled = await SubscriptionModel.countDocuments({
    "full_cancellation_date.month": month,
    "full_cancellation_date.year": year,
  });
  const nextDay = addDays(now, 1);
  const isLastDayOfMonth = nextDay.getDate() === 1;
  const period = await StatsModel.findOne({ month, year });
  const activated = await SubscriptionModel.countDocuments({
    active: true,
    "full_creation_date.month": month,
    "full_creation_date.year": year,
  });

  const correct_ad_amount = month === 6 && year === 2025 ? 11.86 : 0; // Que quedó en gasto de la otra cuenta publicitaria

  const updatedStat = await StatsModel.findOneAndUpdate(
    { month, year },
    {
      $set: {
        "marketing.ad_spent": meta_ads_spent * 1.0425 + correct_ad_amount, //Porque arroja un poco menos que lo que figura en las facturas
        "product.companies_created": await CompanyModel.countDocuments({
          deleted: false,
          "full_creation_date.month": month,
          "full_creation_date.year": year,
        }),
        "product.companies_activated": await CompanyModel.countDocuments({
          deleted: false,
          "full_creation_date.month": month,
          "full_creation_date.year": year,
          "statistics.sales": { $gt: 0 },
        }),
        "subscriptions.created": await SubscriptionModel.countDocuments({
          status: "pending",
          "full_creation_date.month": month,
          "full_creation_date.year": year,
        }),
        "subscriptions.activated": activated,
        "subscriptions.canceled": await SubscriptionModel.countDocuments({
          "full_cancellation_date.month": month,
          "full_cancellation_date.year": year,
        }),
        "subscriptions.churn_rate": +(
          canceled / period.subscriptions.total_at_start
        ).toFixed(6),
        "subscriptions.total_at_end":
          period.subscriptions.total_at_start + activated,
      },
    },
    { new: true }
  );

  if (isLastDayOfMonth) {
    // Si es el último día del mes, reiniciar los contadores para el próximo mes
    await StatsModel.updateOne(
      {
        month: nextDay.getMonth() + 1,
        year: nextDay.getFullYear(),
      },
      {
        $set: {
          "subscriptions.activated": 0, // Reiniciar para el próximo mes
          "subscriptions.canceled": 0, // Reiniciar para el próximo mes
          "subscriptions.created": 0, // Reiniciar para el próximo mes
          "subscriptions.total_at_start":
            updatedStat.subscriptions.total_at_end,
          "subscriptions.total_at_end": updatedStat.subscriptions.total_at_end, // Reiniciar para el próximo mes
          "subscriptions.churn_rate": 0, // Reiniciar para el próximo mes
          "marketing.ad_spent": 0, // Reiniciar para el próximo mes
        },
      }
    );
  }

  return new Response("Cron ejecutado correctamente ✅");
}
