"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { cn } from "@/helpers/ui";
import {
  ArrowUp,
  Building,
  Building2,
  CircleDollarSign,
  HandCoins,
  MapPin,
  User,
} from "lucide-react";
import Image from "next/image";
import CashflowSummaryUSDTooltip from "./CashflowSummaryUSDTooltip";

const ICONS = {
  cashflows: <ArrowUp className="w-4 h-4 text-green-600" strokeWidth={1.5} />,
  sales: <CircleDollarSign className="w-4 h-4" strokeWidth={1.5} />,
  debts: <HandCoins className="w-4 h-4 text-red-600" strokeWidth={1.2} />,
  stores: <MapPin className="w-4 h-4 text-blue-600" strokeWidth={1.2} />,
  companies: <Building2 className="w-4 h-4 text-blue-600" strokeWidth={1.2} />,
  person: <User className="w-4 h-4 text-blue-600" strokeWidth={1.7} />,
  company: <Building className="w-4 h-4 text-teal-600" strokeWidth={1.7} />,
};

export function TotalAmount({
  title,
  data,
  blob_name = null,
  alwaysShow = false,
  colInMobile = false,
  bg = "",
  icon = null,
  onClick = null,
  aquappRate = null,
  className = "",
  textClassName = "",
  aclaration = "",
}) {
  if (!data.total_amount && !data.usd_total_amount && !alwaysShow) return <></>;

  return (
    <Card
      className={cn(
        "outline-none max-h-full w-fit max-w-60 rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0",
        className
      )}
      onClick={onClick}
    >
      <CardHeader
        className={`flex ${colInMobile ? "flex-col" : "flex-row"} sm:flex-row items-start justify-between w-full py-2 px-3 sm:px-3`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {icon && ICONS[icon]}
          {blob_name && (
            <div className="flex items-center w-4 h-4">
              <Image
                src={`${CONFIG.blob_url}/${blob_name}.png?h=as`}
                width={18}
                height={18}
                alt="Image"
              />
            </div>
          )}
          {bg && (
            <div
              className={`rounded min-w-2.5 min-h-2.5 sm:min-w-3 sm:min-h-3 ${bg}`}
            ></div>
          )}
          <div className="flex flex-col">
            <div className="flex text-sm items-center gap-1.5 mr-5">
              <span className={textClassName}>{title}</span>
              {data.total_count > 0 && (
                <span className="text-sm font-extralight text-muted-foreground">
                  ({data.total_count})
                </span>
              )}
            </div>
            {aclaration && (
              <span className="font-extralight text-[0.7rem] text-muted-foreground">
                {aclaration}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm sm:text-sm font-light !mt-0 text-nowrap">
          <CashflowSummaryUSDTooltip
            id={title}
            c={data}
            exchange_rate={aquappRate}
          />
          <span>{toMoney(data.total_amount, true)}</span>
        </div>
      </CardHeader>
    </Card>
  );
}
