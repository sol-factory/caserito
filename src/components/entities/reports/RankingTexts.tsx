"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { createQueryString, removeQueryString } from "@/helpers/url";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import ShowMore from "./ShowMore";
import { cn } from "@/lib/utils";
import CashflowSummaryUSDTooltip from "./CashflowSummaryUSDTooltip";

export function RankingTexts({
  items,
  title,
  exchange_rate,
  preText = null,
  afterText = null,
  aclarationComponent = null,
  param = null,
  paramValueField = null,
  className = null,
}) {
  const [showMore, setShowMore] = useState(false);
  const total = items.reduce((prev, curr) => prev + curr.total_amount, 0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramValue = searchParams.get(param);

  if (items.length === 0) return <></>;
  return (
    <Card
      className={cn(
        "outline-none max-h-full w-full lg:max-w-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0",
        className
      )}
    >
      <CardHeader className="pt-3 pb-1">
        <CardTitle className="text-xl -mb-1">{title}</CardTitle>
        {!!preText && (
          <CardDescription className="text-xs font-extralight">
            {preText}{" "}
            <span className={`text-chart-2 font-normal`}>{toMoney(total)}</span>
            {afterText ? ` ${afterText}` : ""}
          </CardDescription>
        )}

        {aclarationComponent}
      </CardHeader>
      <CardContent id="card" className="w-full">
        <div className={`flex flex-col ${param ? "gap-1" : "gap-1"} mt-3`}>
          {items
            .filter((i, index) => (showMore ? true : index <= 5))
            .map((i, index) => {
              const percent = +((i.total_amount / (total || 1)) * 100).toFixed(
                2
              );
              const isSelected = paramValue === i[paramValueField];

              return (
                <div
                  key={index}
                  className={`flex justify-between ${
                    param ? "cursor-pointer hover:bg-accent" : ""
                  } -ml-1 px-1 py-1 w-full rounded ${
                    isSelected ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    if (param) {
                      if (isSelected) {
                        router.push(
                          pathname +
                            "?" +
                            removeQueryString(param, searchParams, pathname)
                        );
                      } else {
                        const query = createQueryString(
                          searchParams,
                          param,
                          i[paramValueField],
                          pathname
                        );
                        const url = pathname + "?" + query;

                        router.push(url);
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {i.blob_path && !i.blob_path.includes("/.") && (
                      <Image
                        width={18}
                        height={20}
                        alt={i.blob_path}
                        src={`${CONFIG.blob_url}/${i.blob_path}`}
                      />
                    )}
                    {i.bg && (
                      <div
                        className={`rounded min-w-2.5 min-h-2.5 sm:min-w-3 sm:min-h-3 ${i.bg}`}
                      ></div>
                    )}
                    <div className="flex flex-col max-w-56 sm:max-w-72">
                      <span className="text-xs md:text-sm">{i.name}</span>
                      {!!i.detail && (
                        <span className="text-[8px] md:text-[9px] text-muted-foreground font-extralight">
                          {i.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end -mr-1">
                    <div className="flex items-center">
                      <CashflowSummaryUSDTooltip
                        id={i._id}
                        c={i}
                        exchange_rate={exchange_rate}
                      />
                      <span className="ml-2 text-sm font-light">
                        {toMoney(i.total_amount, true)}
                      </span>
                    </div>
                    <span className="text-[8px] md:text-[9px] text-muted-foreground font-extralight">
                      {i.total_count} venta{i.total_count > 1 ? "s " : " "}
                      <span className="text-blue-600">{percent}%</span>
                    </span>
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
