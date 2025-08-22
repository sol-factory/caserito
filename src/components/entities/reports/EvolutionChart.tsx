"use client";

import RadioOptions from "@/components/custom-ui/CheckOptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getWeekDateRange } from "@/helpers/date";
import { createQueryString } from "@/helpers/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  count: {
    label: "Empresas",
    color: "hsl(var(--chart-2))",
  },
  sales: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
  services: {
    label: "Servicios",
    color: "hsl(var(--chart-4))",
  },
  classifications: {
    label: "Clasificaciones",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const EvolutionChart = ({ companies, weeklyGroup }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const convertToIsoDate = (value) => {
    const [year, month, day] = value.split("-");

    const isoDate = `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}T00:00:00`;
    return new Date(isoDate);
  };

  return (
    <Card className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0">
      <CardHeader className="flex items-center md:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
        <CardTitle className="text-xl pb-1">Potenciales clientes</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[170px] w-full"
        >
          <AreaChart data={companies}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sales)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sales)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillServices" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-services)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-services)"
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
                let date;

                if (weeklyGroup) {
                  const { start } = getWeekDateRange(
                    value.split("-")[0],
                    value.split("-")[1]
                  );
                  date = start;
                } else {
                  date = convertToIsoDate(value);
                }

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
                    let date;

                    if (weeklyGroup) {
                      const { start } = getWeekDateRange(
                        value.split("-")[0],
                        value.split("-")[1]
                      );
                      date = start;
                    } else {
                      date = convertToIsoDate(value);
                    }
                    return date.toLocaleDateString("es-AR", {
                      weekday: weeklyGroup ? "short" : undefined,
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillCount)"
              stroke="var(--color-count)"
              stackId="a"
            />
            <Area
              dataKey="services"
              type="natural"
              fill="url(#fillServices)"
              stroke="var(--color-services)"
              stackId="b"
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="url(#fillSales)"
              stroke="var(--color-sales)"
              stackId="d"
              activeDot={{
                onClick: (e, a: any) => {
                  const date = a.payload;
                  // try {
                  //   const since = +new Date(
                  //     date.year,
                  //     date.month - 1,
                  //     date.day
                  //   );
                  //   const to = +new Date(date.year, date.month - 1, date.day);
                  //   const params = createQueryString(
                  //     searchParams,
                  //     ["since", "to"],
                  //     [String(since), String(to)],
                  //     pathname
                  //   );
                  //   router.push(pathname + "?" + params);
                  // } catch (error) {
                  //   console.log({ error });
                  // }
                },
              }}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EvolutionChart;
