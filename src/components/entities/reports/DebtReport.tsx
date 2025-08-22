"use client";

import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { cn } from "@/helpers/ui";
import { createQueryString, removeQueryString } from "@/helpers/url";
import { ArrowUp, CircleDollarSign, HandCoins } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import CashflowSummaryUSDTooltip from "./CashflowSummaryUSDTooltip";

const DebtReport = ({
  title = "Resumen de ventas del período",
  sales,
  gatherings,
  discounts,
  tips,
  debts,
  className = "",
  period = null,
  aquapp_rate,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const canGoToDebtsView =
    (debts.amount > 0 || debts.usd_amount > 0) && !!period;
  return (
    <Card
      className={cn("rounded-none sm:rounded-xl py-4 px-4 w-full", className)}
    >
      <CardTitle className="flex text-xl items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span>{title}</span>
        </div>
      </CardTitle>
      <CardContent className="pb-2 mt-6 px-0">
        <div className=" flex items-center justify-between font-light text-sm mb-4">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4" strokeWidth={1.3} />
            <div className="flex items-center gap-1">
              <span>Ventas</span>
              {sales.total_count > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.7rem] mt-[2px]">
                  ({sales.total_count})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 !mt-0">
            <CashflowSummaryUSDTooltip
              id={"sales"}
              c={sales}
              entityName="venta"
              exchange_rate={
                aquapp_rate || sales.usd_amount_converted / sales.usd_amount
              }
            />
            <span>{toMoney(sales.total_amount, true)}</span>
          </div>
        </div>
        <div className=" flex items-center justify-between font-light text-sm mt-0.5">
          <div className="flex items-center gap-2">
            <Image
              src={`${CONFIG.blob_url}/discount.png?h=as`}
              width={19}
              height={19}
              className="w-4 h-4"
              alt="Image"
            />
            <div className="flex items-center gap-1">
              <span>Con descuentos</span>
              {discounts.total_count > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.7rem] mt-[2px]">
                  ({discounts.total_count})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 !mt-0">
            <CashflowSummaryUSDTooltip
              id={"discounts"}
              c={discounts}
              entityName="descuento"
              exchange_rate={
                aquapp_rate ||
                discounts.usd_amount_converted / discounts.usd_amount
              }
            />
            <span>{toMoney(discounts.total_amount)}</span>
          </div>
        </div>
        <div className=" flex justify-between font-light text-sm mt-0.5">
          <div className="flex gap-2">
            <ArrowUp
              className="text-chart-2 w-4 h-4 mt-0.5"
              strokeWidth={1.5}
            />
            <div className="flex items-center gap-1">
              <span>Con cobros</span>

              {gatherings?.total_count > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.7rem] mt-[2px]">
                  ({gatherings.total_count})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 !mt-0">
            <CashflowSummaryUSDTooltip
              id={"gatherings"}
              c={gatherings}
              entityName="venta con cobros"
              dontPluralize
              exchange_rate={
                aquapp_rate ||
                gatherings.usd_amount_converted / gatherings.usd_amount
              }
            />
            <span>{toMoney(gatherings.total_amount || 0)}</span>
          </div>
        </div>
        <div className=" flex items-center justify-between font-light text-sm mt-0.5">
          <div className="flex items-center gap-2">
            <Image
              src={`${CONFIG.blob_url}/money.png?h=as`}
              width={19}
              height={19}
              className="w-4 h-4"
              alt="Image"
            />
            <div className="flex items-center gap-1">
              <span>Con pagos extra</span>
              {tips.total_count > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.7rem] mt-[2px]">
                  ({tips.total_count})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 !mt-0">
            <CashflowSummaryUSDTooltip
              id={"tips"}
              c={tips}
              entityName="propina"
              exchange_rate={
                aquapp_rate || tips.usd_amount_converted / tips.usd_amount
              }
            />
            <span>{toMoney(tips.total_amount)}</span>
          </div>
        </div>
        <div
          onClick={() => {
            if ((debts.amount <= 0 && debts.usd_amount <= 0) || !period) return;

            removeQueryString("since", searchParams, "/washes");
            removeQueryString("to", searchParams, "/washes");
            const queryString = createQueryString(
              "",
              ["view", "period"],
              ["debts", period],
              "/washes"
            );
            router.push(`/washes?${queryString}`);
          }}
          className={`flex ${canGoToDebtsView ? "group cursor-pointer" : ""} items-center justify-between font-light text-sm mt-0.5`}
        >
          <div className="group-hover:underline flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-red-600" strokeWidth={1.3} />
            <div className="flex items-center gap-1">
              <span>Con deudas</span>
              {debts.total_count > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.7rem] mt-[2px]">
                  ({debts.total_count})
                </span>
              )}
            </div>
          </div>
          <div className="group-hover:underline flex items-center gap-1 ">
            <CashflowSummaryUSDTooltip
              id={"debts"}
              c={debts}
              entityName="deuda"
              exchange_rate={
                aquapp_rate || debts.usd_amount_converted / debts.usd_amount
              }
            />
            <span>{toMoney(debts.total_amount)}</span>
          </div>
        </div>
      </CardContent>
      {/* {aclaration && (
        <CardFooter className="pb-0  px-0">
          <span className="mt-3 text-muted-foreground font-extralight text-xs ">
            <u>Aclaración</u>: {aclaration}
          </span>
        </CardFooter>
      )} */}
    </Card>
  );
};

export default DebtReport;
