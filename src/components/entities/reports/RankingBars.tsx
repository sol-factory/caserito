"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toMoney } from "@/helpers/fmt";
import Image from "next/image";
import { pluralize, toSlug } from "@/helpers/text";
import { useState } from "react";
import ShowMore from "./ShowMore";
import CashflowSummaryUSDTooltip from "./CashflowSummaryUSDTooltip";

export function RankingBars({
  items,
  title,
  folder = null,
  preText = null,
  afterText = null,
  extraPayments = 0,
  entityName = "venta",
  exchange_rate,
}) {
  const [showMore, setShowMore] = useState(false);
  const total = items.reduce((prev, curr) => prev + curr.total_amount, 0);
  const highestValue = items[0]?.total_amount || 1;

  if (items.length === 0) return <></>;

  let bg = "from-gray-50 to-chart-1";
  if (entityName !== "venta") {
    bg = "from-emerald-50 to-chart-2";
  }

  return (
    <Card className="outline-none max-h-full w-full  rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0">
      <CardHeader className="pt-3 pb-1">
        <CardTitle className="text-xl">{title}</CardTitle>
        {!!preText && (
          <CardDescription className="text-xs font-extralight">
            {preText}{" "}
            <span className="mr-0.5  font-normal text-chart-2">
              {toMoney(total)}
            </span>
            {afterText ? ` ${afterText}` : ""}
            {extraPayments > 0 && (
              <span>
                ,{" "}
                <span className="mr-0.5 text-chart-1 font-normal">
                  {toMoney(total - extraPayments)}
                </span>{" "}
                de ventas y{" "}
                <span className="mr-0.5 text-gray-800 font-normal">
                  {toMoney(extraPayments)}
                </span>
                de pagos extras.
              </span>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent id="card" className="w-full">
        <div className="flex flex-col gap-4 mt-6">
          {items
            .filter((i, index) => (showMore ? true : index <= 5))
            .map((i, index) => {
              const width = Math.round((i.total_amount / highestValue) * 170);
              const percent = +((i.total_amount / (total || 1)) * 100).toFixed(
                2
              );
              return (
                <div
                  key={index}
                  title={i.name}
                  className="relative flex items-center justify-between w-full"
                >
                  <div
                    className={`absolute start-9 rounded-tr rounded-br h-7 bg-gradient-to-r ${bg} px-2 py-1`}
                    style={{ width: `${width}px` }}
                  ></div>
                  <div className="flex items-center justify-center gap-2  z-10">
                    {!!folder && (
                      <div className="flex items-center w-6 h-6">
                        <Image
                          width={23}
                          height={23}
                          alt={`Logo de ${i.name}`}
                          src={
                            i.url ||
                            `https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/${folder}/${toSlug(
                              i.name !== "Efectivo"
                                ? i.name.toLowerCase()
                                : "billetes"
                            )}.png`
                          }
                        />
                      </div>
                    )}
                    {!folder && <span className="text-xs">{i.name}</span>}
                  </div>

                  <div
                    className="flex absolute text-xs md:text-sm font-light -top-0.5 md:-top-1"
                    style={{ left: `${Math.max(width + 50, 67)}px` }}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {toMoney(i.total_amount, true)}
                        </span>
                        <CashflowSummaryUSDTooltip
                          id={i._id}
                          c={i}
                          exchange_rate={exchange_rate}
                        />
                      </div>
                      <span className="-mt-1 text-[8px] sm:text-[9px] text-muted-foreground font-extralight">
                        {i.total_count} {pluralize("venta", i.total_count)}{" "}
                        <span className="text-blue-600">{percent}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <ShowMore showMore={showMore} setShowMore={setShowMore} items={items} />
      </CardContent>
    </Card>
  );
}
