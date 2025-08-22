"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toMoney } from "@/helpers/fmt";

type Props = {
  data: any[];
  monthlyGroup?: boolean;
  handleActiveDotClick?: (payload: any, route: string) => void;
  activeDoyClassName?: string;
  chartConfig?: any;
};

export const CashflowsEvolutionChart = ({
  data,
  monthlyGroup = false,
  handleActiveDotClick = () => {},
  activeDoyClassName = "",
  chartConfig = {},
}: Props) => {
  return (
    <Card className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0">
      <CardHeader className="flex items-center md:items-start gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 items-center text-center sm:text-left">
          <CardTitle className="text-xl pb-1">
            Evolución de ingresos y egresos
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[170px] w-full"
        >
          <AreaChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="fillTotal_gathered"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-total_gathered)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total_gathered)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTotal_spent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-total_spent)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total_spent)"
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
              minTickGap={20}
              tickFormatter={(value) => {
                const d = new Date(value);
                return monthlyGroup
                  ? d.toLocaleDateString("es-AR", { month: "short" })
                  : d.toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                    });
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-60"
                  formatter={(value: any, name, item) => {
                    const config = chartConfig[name] || {};
                    const label = config?.label || name;
                    const payload = item.payload || {};
                    const count = payload[config.countKey] || 0;
                    const usdField = `usd_${name}`;
                    const usdAmount = Math.abs(payload[usdField] || 0);

                    return (
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-[0.1rem]"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span>
                            {label}
                            {count > 0 && (
                              <span className="font-extralight ml-1 text-muted-foreground">
                                ({count})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>{toMoney(value)}</span>
                          {usdAmount > 0 && (
                            <span className="text-[0.5rem] font-light text-muted-foreground">
                              Incluye 🇺🇸{" "}
                              <span className="text-green-600">
                                {toMoney(usdAmount, false, false, "u$s")}
                              </span>{" "}
                              a{" "}
                              <span className="text-blue-600">
                                {toMoney(payload.avg_rate)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }}
                  labelFormatter={(_, items) => {
                    const date = items?.[0]?.payload?.date;
                    date?.setHours(10);

                    if (monthlyGroup) {
                      // Solo el mes, con nombre largo
                      return `Resumen de ${date.toLocaleDateString("es-AR", { month: "long" })}`;
                    }

                    // Para agrupación semanal o diaria
                    return `Resumen del ${date.toLocaleDateString("es-AR", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}`;
                  }}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="total_gathered"
              type="monotone"
              fill="url(#fillTotal_gathered)"
              stroke="var(--color-total_gathered)"
              stackId="a"
              activeDot={{
                onClick: (e, a: any) =>
                  handleActiveDotClick(a.payload, "/washes"),
                className: activeDoyClassName,
              }}
            />
            <Area
              dataKey="total_spent"
              type="monotone"
              fill="url(#fillTotal_spent)"
              stroke="var(--color-total_spent)"
              stackId="b"
              activeDot={{
                onClick: (e, a: any) =>
                  handleActiveDotClick(a.payload, "/cashflows"),
                className: activeDoyClassName,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
