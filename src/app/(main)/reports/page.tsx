import { CashflowsEvolutionChart } from "@/components/entities/reports/CashflowsEvolutionChart";
import CashflowsSummary from "@/components/entities/reports/CashflowsSummary";
import DebtReport from "@/components/entities/reports/DebtReport";
import { RankingBars } from "@/components/entities/reports/RankingBars";
import { RankingTexts } from "@/components/entities/reports/RankingTexts";
import { SalesEvolutionChart } from "@/components/entities/reports/SalesEvolutionChart";
import { TotalAmount } from "@/components/entities/reports/TotalAmount";
import WalletsSummary from "@/components/entities/reports/WalletsSummary";
import WorkersWage from "@/components/entities/reports/WorkersWage";
import { verifySession } from "@/helpers/auth";
import { getPeriodFilter } from "@/helpers/date";
import {
  getCashflowsEvolutionAggregation,
  getWalletsSummaryAggregation,
  getCashflowsSummary,
  getExchangeAveragesAggregation,
  getSalesEvolutionAggregation,
  getSalesSummaryFromEvolution,
  getWorkplace,
  mergeCashflowsEvolutionWithRates,
  mergeSalesEvolutionWithRates,
  getAvgExchangeRateForPeriod,
  getClientTypeReport,
  getStoresSummaryFromEvolution,
  companySalesEvolutionByDate,
  toObjectId,
  enrichSalariesWithWorkerData,
} from "@/helpers/mdb";
import connectDB from "@/lib/connectDB";
import { CashflowModel } from "@/schemas/cashflow";
import ExchangeModel from "@/schemas/exchange";
import { MemberModel } from "@/schemas/member";
import { SaleModel } from "@/schemas/sale";
import StoreModel from "@/schemas/store";
import { redirect } from "next/navigation";

export default async function DashboardPage({ searchParams }) {
  const { period, store_id } = await searchParams;

  if (!period) {
    redirect("/reports?period=this_month&since=29837947234");
    return <></>;
  }

  await connectDB();
  const user = await verifySession();

  const period_filter = getPeriodFilter(period);

  const matchStage = {
    ...period_filter,
    ...getWorkplace(user, true),
    deleted: false,
  };

  const useAvgAquappRate = !period?.includes("year");
  let avg_aquapp_rate;
  if (useAvgAquappRate) {
    avg_aquapp_rate = 1;
  }

  const salesEvolutionPipeline = getSalesEvolutionAggregation(period) as any;
  const salesEvolution = await SaleModel.aggregate([
    { $match: matchStage },
    ...salesEvolutionPipeline,
  ]);

  const aquappRatesPipeline = getExchangeAveragesAggregation(period) as any;
  const aquappRates = await ExchangeModel.aggregate(aquappRatesPipeline);
  let finalSalesEvolution = mergeSalesEvolutionWithRates(
    salesEvolution,
    aquappRates,
    1
  );

  if (!!store_id) {
    finalSalesEvolution = finalSalesEvolution.filter(
      (s) => s.store_id?.toString() === store_id.toString()
    );
    matchStage["store_id"] = toObjectId(store_id);
  }

  const companySalesEvolution =
    companySalesEvolutionByDate(finalSalesEvolution);

  const salesByServicePipeline = [
    { $unwind: "$services" },
    {
      $addFields: {
        quantity: { $ifNull: ["$services.quantity", 1] },
        price: { $ifNull: ["$services.price", 0] },
        service_value: { $multiply: ["$services.price", "$services.quantity"] },
        service_value_converted: {
          $cond: [
            { $eq: ["$services.currency", "usd"] },
            {
              $multiply: [
                "$services.price",
                "$services.quantity",
                avg_aquapp_rate,
              ],
            },
            { $multiply: ["$services.price", "$services.quantity"] },
          ],
        },
        service_amount_converted: {
          $cond: [
            { $ne: ["$services.currency", "usd"] },
            { $divide: ["$services.price", avg_aquapp_rate] },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: { $toString: "$services._id" },
        name: { $first: "$services.name" },
        detail: { $first: "$services.detail" },
        currency: { $first: "$services.currency" },
        count: {
          $sum: { $cond: [{ $ne: ["$services.currency", "usd"] }, 1, 0] },
        },
        usd_count: {
          $sum: { $cond: [{ $eq: ["$services.currency", "usd"] }, 1, 0] },
        },
        amount: {
          $sum: {
            $cond: [
              { $ne: ["$services.currency", "usd"] },
              "$service_value",
              0,
            ],
          },
        },
        usd_amount: {
          $sum: {
            $cond: [
              { $eq: ["$services.currency", "usd"] },
              "$service_value",
              0,
            ],
          },
        },
        amount_converted: {
          $sum: {
            $cond: [
              { $ne: ["$services.currency", "usd"] },
              { $divide: ["$service_value", avg_aquapp_rate] },
              0,
            ],
          },
        },
        usd_amount_converted: {
          $sum: {
            $cond: [
              { $eq: ["$services.currency", "usd"] },
              { $multiply: ["$service_value", avg_aquapp_rate] },
              0,
            ],
          },
        },
        total_count: { $sum: 1 },
      },
    },
    {
      $addFields: {
        total_amount: { $add: ["$amount", "$usd_amount_converted"] },
        usd_total_amount: { $add: ["$usd_amount", "$amount_converted"] },
      },
    },
    { $sort: { total_amount: -1 } },
  ] as any;

  const salesByBrandPipeline = [
    {
      $group: {
        _id: { $ifNull: ["$vehicle.brand", "Sin marca"] },
        name: { $first: { $ifNull: ["$vehicle.brand", "Sin marca"] } },
        amount: { $sum: "$netAmount" },
        usd_amount: { $sum: "$netUsd" },
        amount_converted: { $sum: "$netAmount_converted" },
        usd_amount_converted: { $sum: "$netUsd_converted" },
        count: { $sum: "$count" },
        usd_count: { $sum: "$usd_count" },
        total_count: { $sum: "$total_count" },
        total_amount: { $sum: "$total_amount" },
        usd_total_amount: { $sum: "$usd_total_amount" },
      },
    },
    {
      $sort: { total_amount: -1 },
    },
  ] as any;

  const salesByVehicleKindPipeline = [
    {
      $group: {
        _id: { $ifNull: ["$vehicle.kind", "Sin tipo"] },
        name: { $first: { $ifNull: ["$vehicle.kind", "Sin tipo"] } },
        kind_classification_id: { $first: "$vehicle.kind_classification_id" },
        amount: { $sum: "$netAmount" },
        amount_converted: { $sum: "$netAmount_converted" },
        usd_amount: { $sum: "$netUsd" },
        usd_amount_converted: { $sum: "$netUsd_converted" },
        count: { $sum: "$count" },
        usd_count: { $sum: "$usd_count" },
        total_count: { $sum: "$total_count" },
        total_amount: { $sum: "$total_amount" },
        usd_total_amount: { $sum: "$usd_total_amount" },
      },
    },
    {
      $addFields: {
        blob_path: {
          $cond: [
            { $ifNull: ["$kind_classification_id", false] },
            { $concat: ["vehicles/", "$kind_classification_id", ".png"] },
            null,
          ],
        },
      },
    },
    {
      $sort: { total_amount: -1 },
    },
  ] as any;

  const salesByClientTypePipeline = [
    {
      $addFields: {
        client_type: { $ifNull: ["$client.kind", "person"] },
      },
    },
    {
      $group: {
        _id: "$client_type",
        name: {
          $first: {
            $cond: [
              { $eq: ["$client_type", "company"] },
              "Ventas a empresas",
              "Ventas a personas",
            ],
          },
        },
        type: { $first: "$client_type" },
        amount: { $sum: "$netAmount" },
        amount_converted: { $sum: "$netAmount_converted" },
        usd_amount: { $sum: "$netUsd" },
        usd_amount_converted: { $sum: "$netUsd_converted" },
        count: { $sum: "$count" },
        usd_count: { $sum: "$usd_count" },
        total_count: { $sum: "$total_count" },
        total_amount: { $sum: "$total_amount" },
        usd_total_amount: { $sum: "$usd_total_amount" },
      },
    },
    {
      $sort: { total_amount: -1 },
    },
  ] as any;

  const salariesPipeline = [
    { $unwind: "$workers" },
    { $match: { "workers.member_id": { $ne: null } } },
    {
      $project: {
        worker_id: { $toString: "$workers.member_id" },
        name: {
          $ifNull: ["$workers.member_name", "$workers.member_email"],
        },
        image_url: "$workers.image_url",
        percentage: "$workers.percentage_to_pay",
        netAmount: 1,
        netUsd: 1,
        exchange_rate: 1,
        netAmount_converted: 1,
        netUsd_converted: 1,
      },
    },
    {
      $addFields: {
        value: {
          $round: [
            { $multiply: ["$netAmount", { $divide: ["$percentage", 100] }] },
            0,
          ],
        },
        usd: {
          $round: [
            { $multiply: ["$netUsd", { $divide: ["$percentage", 100] }] },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        value_converted: {
          $divide: ["$value", "$exchange_rate"],
        },
        usd_converted: {
          $multiply: ["$usd", "$exchange_rate"],
        },
      },
    },
    {
      $group: {
        _id: "$worker_id",
        name: { $first: "$name" },
        image_url: { $first: "$image_url" },
        amount: { $sum: "$value" },
        usd_amount: { $sum: "$usd" },
        amount_converted: { $sum: "$value_converted" },
        usd_amount_converted: { $sum: "$usd_converted" },
        count: {
          $sum: {
            $cond: [{ $gt: ["$value", 0] }, 1, 0],
          },
        },
        usd_count: {
          $sum: {
            $cond: [{ $gt: ["$usd", 0] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        total_amount: { $add: ["$amount", "$usd_amount_converted"] },
        payment_scheme: {
          fixed_salary: 0, // 🔁 Opcional: podés traerlo con $lookup si querés
          sales_percentage: null,
          payment_type: {
            _id: "percent_of_sales",
            name: "Porcentaje sobre ventas",
          },
        },
      },
    },
  ] as any;

  const firstFieldsToAdd = {
    grossAmount: { $ifNull: ["$amount", 0] },
    grossUsd: { $ifNull: ["$usd_amount", 0] },
    discount: { $ifNull: ["$discounts_amount", 0] },
    usdDiscount: { $ifNull: ["$usd_discounts_amount", 0] },
    netAmount: { $subtract: ["$amount", "$discounts_amount"] },
    netUsd: { $subtract: ["$usd_amount", "$usd_discounts_amount"] },
  };

  const secondaryFieldsToAdd = {
    amount_converted: {
      $cond: [
        { $gt: ["$amount", 0] },
        { $divide: ["$amount", avg_aquapp_rate] },
        0,
      ],
    },
    usd_amount_converted: {
      $cond: [
        { $gt: ["$usd_amount", 0] },
        { $multiply: ["$usd_amount", avg_aquapp_rate] },
        0,
      ],
    },
    netAmount_converted: {
      $cond: [
        { $gt: ["$netAmount", 0] },
        { $divide: ["$netAmount", avg_aquapp_rate] },
        0,
      ],
    },
    netUsd_converted: {
      $cond: [
        { $gt: ["$netUsd", 0] },
        { $multiply: ["$netUsd", avg_aquapp_rate] },
        0,
      ],
    },
    total_amount: {
      $add: [
        { $cond: [{ $gt: ["$netAmount", 0] }, "$netAmount", 0] },
        {
          $cond: [
            { $gt: ["$netUsd", 0] },
            { $multiply: ["$netUsd", avg_aquapp_rate] },
            0,
          ],
        },
      ],
    },
    usd_total_amount: {
      $add: [
        { $cond: [{ $gt: ["$netUsd", 0] }, "$netUsd", 0] },
        {
          $cond: [
            { $gt: ["$netAmount", 0] },
            { $divide: ["$netAmount", avg_aquapp_rate] },
            0,
          ],
        },
      ],
    },
    count: { $cond: [{ $gt: ["$netAmount", 0] }, 1, 0] },
    usd_count: { $cond: [{ $gt: ["$netUsd", 0] }, 1, 0] },
    total_count: {
      $cond: [
        {
          $or: [
            { $cond: [{ $gt: ["$netAmount", 0] }, 1, 0] },
            { $cond: [{ $gt: ["$netUsd", 0] }, 1, 0] },
          ],
        },
        1,
        0,
      ],
    },
  };

  const facetStage = {
    salesByService: salesByServicePipeline,
    salesByBrand: salesByBrandPipeline,
    salesByVehicleKind: salesByVehicleKindPipeline,
    salesByClientType: salesByClientTypePipeline,
  };

  const monthlyPeriod = period?.includes("month") || period?.includes("custom");

  if (monthlyPeriod) {
    facetStage["salaries"] = salariesPipeline;
  }

  const [reports] = await SaleModel.aggregate([
    { $match: matchStage },
    { $addFields: firstFieldsToAdd },
    { $addFields: secondaryFieldsToAdd },
    {
      $facet: facetStage,
    },
  ]);

  const walletsSummaryPipeline = (await getWalletsSummaryAggregation(
    matchStage
  )) as any;

  const cashflowsByWallet = await CashflowModel.aggregate(
    walletsSummaryPipeline
  );

  const cashflowsEvolutionPipeline = getCashflowsEvolutionAggregation(
    period
  ) as any;
  const cashflowsEvolution = await CashflowModel.aggregate([
    { $match: matchStage },
    ...cashflowsEvolutionPipeline,
  ]);

  const finalCashflowsEvolution = mergeCashflowsEvolutionWithRates(
    cashflowsEvolution,
    aquappRates
  );

  const cashflowsSummary = await getCashflowsSummary(cashflowsEvolution);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row sm:items-start gap-3">
        <CashflowsSummary
          cashflowsSummary={cashflowsSummary}
          filter
          title="Flujo de dinero del período"
          period={period}
          aquapp_rate={avg_aquapp_rate}
        />

        <WalletsSummary gatheredByWallet={cashflowsByWallet} />
      </div>
      <CashflowsEvolutionChart
        data={finalCashflowsEvolution}
        chartConfig={{
          total_gathered: {
            label: "Cobros",
            color: "hsl(var(--chart-2))",
            countKey: "total_gatherings",
          },
          total_spent: {
            label: "Gastos",
            color: "hsl(var(--chart-3))",
            countKey: "total_spents",
          },
        }}
        monthlyGroup={period?.includes("year")}
      />
    </div>
  );
}
