"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  activated_cum: {
    label: "Active",
    color: "hsl(var(--chart-2))",
  },
  canceled_cum: {
    label: "Canceled",
    color: "hsl(var(--chart-3))",
  },
  ltv_vs_cac: {
    label: "LTV/CAC",
    color: "hsl(var(--chart-1))",
  },
  adjusted_ltv_vs_cac: {
    label: "Adj. LTV/CAC",
    color: "hsl(var(--chart-5))",
  },
  avg_churn: {
    label: "Churn %",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig;

const SubsIndicatorsEvolutionChart = ({ subs }) => {
  const convertToIsoDate = (value) => {
    const [year, month, day] = value.split("-");

    const isoDate = `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}T00:00:00`;
    return new Date(isoDate);
  };

  return (
    <Card className="outline-none w-full max-h-full rounded-none sm:rounded-xl m-0  h-full sm:h-auto border-0 mt-2">
      <CardHeader className="flex items-center md:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
        <CardTitle className="text-xl pb-1">Evolución indicadores</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[170px] w-full"
        >
          <AreaChart data={subs}>
            <defs>
              <linearGradient
                id="fillActivated_cum"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-activated_cum)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-activated_cum)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillCanceled__cum"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-canceled__cum)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-canceled__cum)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLtv_vs_cac" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ltv_vs_cac)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ltv_vs_cac)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillAdjusted_ltv_vs_cac"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-adjusted_ltv_vs_cac)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-adjusted_ltv_vs_cac)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAvg_churn" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-avg_churn)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-avg_churn)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = convertToIsoDate(value);

                return date.toLocaleDateString("es-AR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-60"
                  labelFormatter={(value) => {
                    const date = convertToIsoDate(value);

                    return date.toLocaleDateString("es-AR", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="activated_cum"
              type="natural"
              fill="url(#fillActivated_cum)"
              stroke="var(--color-activated_cum)"
              stackId="e"
              yAxisId="left"
            />
            <Area
              dataKey="canceled_cum"
              type="natural"
              fill="url(#fillCanceled_cum)"
              stroke="var(--color-canceled_cum)"
              stackId="f"
              yAxisId="right"
            />
            <Area
              dataKey="ltv_vs_cac"
              type="natural"
              fill="url(#fillLtv_vs_cac)"
              stroke="var(--color-ltv_vs_cac)"
              stackId="a"
              yAxisId="right"
            />
            <Area
              dataKey="adjusted_ltv_vs_cac"
              type="natural"
              fill="url(#fillAdjusted_ltv_vs_cac)"
              stroke="var(--color-adjusted_ltv_vs_cac)"
              stackId="b"
              yAxisId="right"
            />
            <Area
              dataKey="avg_churn"
              type="natural"
              fill="url(#fillAvg_churn)"
              stroke="var(--color-avg_churn)"
              stackId="d"
              yAxisId="right"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SubsIndicatorsEvolutionChart;
