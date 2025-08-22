"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toMoney } from "@/helpers/fmt";
import { createQueryString } from "@/helpers/url";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "react-aria-components";
import CashflowSummaryUSDTooltip from "./CashflowSummaryUSDTooltip";

const CashflowsSummary = ({
  cashflowsSummary,
  title = "Flujo de dinero del día",
  aclaration = "",
  filter = false,
  period,
  aquapp_rate,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomes = cashflowsSummary.filter((c) => c.category.name === "Cobro");
  const total_income = incomes.reduce(
    (acc, curr) => acc + curr.total_amount,
    0
  );
  const spents = cashflowsSummary.filter((c) => c.category.name === "Gasto");
  const total_spent = spents.reduce((acc, curr) => acc + curr.total_amount, 0);
  const investments = cashflowsSummary.filter(
    (c) => c.category.name === "Inversión"
  );

  const total_invested = investments.reduce(
    (acc, curr) => acc + curr.total_amount,
    0
  );

  const selectedSubCategory = searchParams.get("subCategory");

  const cashouts = cashflowsSummary.filter((c) => c.category.name === "Retiro");
  const total_cashouts = cashouts.reduce(
    (acc, curr) => acc + curr.total_amount,
    0
  );

  const operativeBalance = total_income + total_spent;
  const globalBalance = operativeBalance + total_invested;

  const handleSubCategoryClick = (subCategory) => {
    const isSelected = selectedSubCategory === subCategory;
    if (!isSelected) {
      router.push(
        `/cashflows?${createQueryString("", ["subCategory", "period", "view"], [subCategory, period || "this_month", "concept"], "/cashflows")}`
      );
    }
  };

  const filterClasses = filter ? "group-hover:underline" : "";

  return (
    <Card className="outline-none w-full min-w-[20rem] sm:max-w-[26rem] rounded-none sm:rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className=" flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Cobros</span>
          </div>
          <span className="font-normal text-chart-2">
            {toMoney(total_income)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {incomes
            .sort((a, b) => b.total_amount - a.total_amount)
            .map((c) => (
              <div key={c.sub_category.name}>
                <div className=" flex justify-between items-center text-xs font-light">
                  <div className="flex items-center gap-1.5">
                    <span>{c.sub_category.name}</span>{" "}
                    <span className="font-extralight text-muted-foreground text-[10px]">
                      (
                      <span className="text-blue-600">
                        {((c.total_amount / total_income) * 100).toFixed(2)}%
                      </span>
                      )
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CashflowSummaryUSDTooltip
                      c={c}
                      id={c.id}
                      entityName="movimiento"
                      exchange_rate={c.avg_rate || aquapp_rate}
                    />
                    <span>{toMoney(c.total_amount, true)}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className=" flex justify-between items-center text-sm mt-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Gastos</span>
          </div>
          <span className="font-normal text-chart-3">
            {toMoney(total_spent)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {spents.map((c) => (
            <div
              key={c.sub_category.name}
              className={`group ${filter ? "cursor-pointer" : ""}`}
              onClick={() => handleSubCategoryClick(c.sub_category.name)}
            >
              <div className=" flex justify-between items-center text-xs font-light">
                <div className="flex items-center gap-1.5">
                  <span className={filterClasses}>{c.sub_category.name}</span>{" "}
                  <span className="font-extralight text-muted-foreground text-[10px]">
                    (<span>{c.total_count}</span>)
                    <span className="text-blue-600 ml-1">
                      {((c.total_amount / total_spent) * 100).toFixed(2)}%
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CashflowSummaryUSDTooltip
                    c={c}
                    id={c.sub_category.name}
                    entityName="movimiento"
                    exchange_rate={c.avg_rate || aquapp_rate}
                  />
                  <span className={filterClasses}>
                    {toMoney(c.total_amount, true)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Separator />
        </div>
        <div className=" flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Resultado financiero</span>
          </div>
          <span
            className={`font-normal ${operativeBalance > 0 ? "text-chart-2" : operativeBalance < 0 ? "text-chart-3" : "text-chart-1"}`}
          >
            {toMoney(operativeBalance)}
          </span>
        </div>
        <div className=" flex justify-between items-center text-sm mt-8">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Inversiones</span>
          </div>
          <span className="font-normal text-chart-3">
            {toMoney(total_invested)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {investments.map((c) => (
            <div
              key={c.sub_category.name}
              className={`group ${filter ? "cursor-pointer" : ""}`}
              onClick={() => handleSubCategoryClick(c.sub_category.name)}
            >
              <div className=" flex justify-between items-center text-xs font-light">
                <div className="flex items-center gap-1.5">
                  <span className={filterClasses}>{c.sub_category.name}</span>{" "}
                  <span className="font-extralight text-muted-foreground text-[10px]">
                    (<span>{c.total_count}</span>)
                    <span className="text-blue-600 ml-1">
                      {((c.total_amount / total_invested) * 100).toFixed(2)}%
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CashflowSummaryUSDTooltip
                    c={c}
                    id={c.id}
                    entityName="inversión"
                    exchange_rate={c.avg_rate || aquapp_rate}
                  />
                  <span>{toMoney(c.total_amount, true)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <Separator />
        </div>
        <div className=" flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Saldo financiero</span>
          </div>
          <span
            className={`font-normal ${globalBalance > 0 ? "text-chart-2" : globalBalance < 0 ? "text-chart-3" : "text-chart-1"}`}
          >
            {toMoney(globalBalance)}
          </span>
        </div>
        <div className=" flex justify-between items-center text-sm mt-8">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Retiros</span>
          </div>
          <span className="font-normal text-chart-3">
            {toMoney(total_cashouts)}
          </span>
        </div>
        <div className="mt-2">
          <Separator />
        </div>
        <div className=" flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Flujo neto de dinero</span>
          </div>
          <span
            className={`font-normal ${globalBalance + total_cashouts > 0 ? "text-chart-2" : globalBalance + total_cashouts < 0 ? "text-chart-3" : "text-chart-1"}`}
          >
            {toMoney(globalBalance + total_cashouts)}
          </span>
        </div>
      </CardContent>
      {aclaration && (
        <CardFooter className="">
          <span className="text-muted-foreground font-extralight text-xs ">
            <u>Aclaración</u>: {aclaration}
          </span>
        </CardFooter>
      )}
    </Card>
  );
};

export default CashflowsSummary;
