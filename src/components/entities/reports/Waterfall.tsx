"use client";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toMoney } from "@/helpers/fmt";
import { Wallet } from "lucide-react";

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, items } = props;

  const item = items.find((i) => i._id === payload.value);
  return (
    <g transform={`translate(${x},${y + 33})`}>
      <image x="-15" y="-35" width="30" height="30" href={item.url} />
    </g>
  );
};

const chartConfig = {
  activities: {
    label: "Movimientos",
  },
  gathered: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))",
  },
  spent: {
    label: "Egresos",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function WaterfallChart({ items }) {
  const maxWidth = {
    1: "max-w-40",
  };
  return (
    <Card className=" outline-none mt-3 w-full sm:max-w-[30rem] rounded-none sm:rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4" strokeWidth={1} />
          <CardTitle>Movimientos por billetera</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={items}>
            <CartesianGrid vertical={false} />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickMargin={10}
              tickCount={4}
              className="font-extralight text-[10px]"
              tickFormatter={(v) => `${toMoney(v / 1000)} mil`}
            /> */}
            <defs>
              <linearGradient id="gathered" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-gathered)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-gathered)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="spent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-spent)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-spent)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="_id"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              height={40}
              tick={(props) => {
                return <CustomXAxisTick {...props} items={items} />;
              }}
              tickFormatter={(value) => {
                return value;
              }}
            />
            <Bar
              dataKey="gathered"
              id="a"
              fill="url(#gathered)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="spent"
              id="b"
              fill="url(#spent)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const item = payload.find((p) => p.payload._id === value);
                    return (
                      <span className="font-semibold">
                        {item?.payload?.name}
                      </span>
                    );
                  }}
                  className="!w-[13rem]"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />

                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {toMoney(+value)}
                      </div>
                      {/* Add this after the last item */}
                      {index === 1 && (
                        <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                          Saldo
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {toMoney(
                              item?.payload?.gathered - item?.payload?.spent
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                />
              }
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
