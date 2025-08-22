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
  ltv: {
    label: "LTV",
    color: "hsl(var(--chart-2))",
  },
  ad_spent_cum: {
    label: "Meta ADS",
    color: "hsl(var(--chart-5))",
  },
  cac: {
    label: "CAC",
    color: "hsl(var(--chart-3))",
  },
  total_cac: {
    label: "Total CAC",
    color: "hsl(var(--chart-3))",
  },
  arpu: {
    label: "$ promedio",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const SubsEvolutionChart = ({ subs }) => {
  const convertToIsoDate = (value) => {
    const [year, month, day] = value.split("-");

    const isoDate = `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}T00:00:00`;
    return new Date(isoDate);
  };

  return (
    <Card className="w-full outline-none max-h-full rounded-none sm:rounded-xl m-0  h-full sm:h-auto border-0 mt-2">
      <CardHeader className="flex items-center md:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
        <CardTitle className="text-xl pb-1">Evolución en $$</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[170px] w-full"
        >
          <AreaChart data={subs}>
            <defs>
              <linearGradient id="fillLtv" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ltv)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ltv)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTotal_cac" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-total_cac)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total_cac)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCac" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cac)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cac)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAd_spent_cum" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ad_spent_cum)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ad_spent_cum)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillArpu" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-arpu)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-arpu)"
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
            {/* <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" /> */}

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
              dataKey="ad_spent_cum"
              type="natural"
              fill="url(#fillAd_spent_cum)"
              stroke="var(--color-ad_spent_cum)"
              stackId="f"
              yAxisId="left"
            />
            <Area
              dataKey="ltv"
              type="natural"
              fill="url(#fillLtv)"
              stroke="var(--color-ltv)"
              stackId="c"
              yAxisId="left"
            />
            <Area
              dataKey="total_cac"
              type="natural"
              fill="url(#fillTotal_cac)"
              stroke="var(--color-total_cac)"
              stackId="j"
              yAxisId="left"
            />

            <Area
              dataKey="cac"
              type="natural"
              fill="url(#fillCac)"
              stroke="var(--color-cac)"
              stackId="b"
              yAxisId="right"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SubsEvolutionChart;
