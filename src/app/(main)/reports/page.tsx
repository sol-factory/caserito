import { CashflowsEvolutionChart } from "@/components/entities/reports/CashflowsEvolutionChart";
import CashflowsSummary from "@/components/entities/reports/CashflowsSummary";
import WalletsSummary from "@/components/entities/reports/WalletsSummary";
import { CONFIG } from "@/config/constanst";
import { verifySession } from "@/helpers/auth";
import { getPeriodFilter } from "@/helpers/date";
import {
  getCashflowsEvolutionAggregation,
  getWalletsSummaryAggregation,
  getCashflowsSummary,
  getExchangeAveragesAggregation,
  getWorkplace,
  mergeCashflowsEvolutionWithRates,
  getSalesSummary,
} from "@/helpers/mdb";
import connectDB from "@/lib/connectDB";
import { CashflowModel } from "@/schemas/cashflow";
import ExchangeModel from "@/schemas/exchange";
import { SaleModel } from "@/schemas/sale";
import { redirect } from "next/navigation";

export default async function DashboardPage({ searchParams }) {
  const { period } = await searchParams;

  if (!period) {
    redirect("/reports?period=this_month&since=29837947234");
    return <></>;
  }

  await connectDB();
  const user = await verifySession();

  const period_filter = getPeriodFilter(period);

  const matchStage = {
    ...period_filter,
    ...getWorkplace(user),
    deleted: false,
  };

  const useAvgAquappRate = !period?.includes("year");
  let avg_aquapp_rate;
  if (useAvgAquappRate) {
    avg_aquapp_rate = 1;
  }

  const aquappRatesPipeline = getExchangeAveragesAggregation(period) as any;
  const aquappRates = await ExchangeModel.aggregate(aquappRatesPipeline);

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

  const salesSummaryPipeline = getSalesSummary(period) as any;
  const salesSummary = await SaleModel.aggregate([
    { $match: matchStage },
    ...salesSummaryPipeline,
  ]);

  const finalCashflowsEvolution = mergeCashflowsEvolutionWithRates(
    cashflowsEvolution,
    aquappRates
  );

  const cashflowsSummary = await getCashflowsSummary(cashflowsEvolution);

  function mergeOperationAmount(salesSummary, cashflowsSummary) {
    // Diccionario con amounts de sales
    const dict = new Map(
      salesSummary.map((s) => [
        `${s.category.name}-${s.sub_category.name}`,
        s.amount,
      ])
    );

    // Paso 1: Mapear cashflows con operation_amount
    const merged = cashflowsSummary.map((c) => {
      const key = `${c.category.name}-${c.sub_category.name}`;
      return {
        ...c,
        operation_amount: dict.get(key) ?? 0,
      };
    });

    // Paso 2: Agregar faltantes de sales que no estén en cashflows
    const existingKeys = new Set(
      cashflowsSummary.map((c) => `${c.category.name}-${c.sub_category.name}`)
    );

    for (const s of salesSummary) {
      const key = `${s.category.name}-${s.sub_category.name}`;
      const exists = existingKeys.has(key);
      if (!exists) {
        merged.push({
          kind: s.kind,
          category: s.category,
          sub_category: s.sub_category,
          amount: 0, // no había cashflow
          amount_converted: 0,
          total_amount: 0,
          operation_amount: s.amount,
        });
      }
    }

    return merged;
  }

  const cashflowsWithOp = mergeOperationAmount(salesSummary, cashflowsSummary);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row sm:items-start gap-3">
        <CashflowsSummary
          cashflowsSummary={cashflowsWithOp}
          filter
          title="Flujo de dinero del período"
          period={period}
          aquapp_rate={avg_aquapp_rate}
        />

        <WalletsSummary
          gatheredByWallet={
            cashflowsByWallet?.filter(
              (w) => w._id !== CONFIG.nota_credito_id
            ) || []
          }
        />
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
