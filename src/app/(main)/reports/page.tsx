import { CashflowsEvolutionChart } from "@/components/entities/reports/CashflowsEvolutionChart";
import CashflowsSummary from "@/components/entities/reports/CashflowsSummary";
import WalletsSummary from "@/components/entities/reports/WalletsSummary";
import { verifySession } from "@/helpers/auth";
import { getPeriodFilter } from "@/helpers/date";
import {
  getCashflowsEvolutionAggregation,
  getWalletsSummaryAggregation,
  getCashflowsSummary,
  getExchangeAveragesAggregation,
  getWorkplace,
  mergeCashflowsEvolutionWithRates,
} from "@/helpers/mdb";
import connectDB from "@/lib/connectDB";
import { CashflowModel } from "@/schemas/cashflow";
import ExchangeModel from "@/schemas/exchange";
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
    ...getWorkplace(user, true),
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
