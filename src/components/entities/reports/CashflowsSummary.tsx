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
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

const lower = (s) => String(s || "").toLowerCase();

const isInvestmentName = (name) => {
  const n = lower(name);
  return (
    n === "inversión" ||
    n === "inversion" ||
    n === "reinversion" ||
    n === "reinvención" ||
    n === "maquinaria"
  );
};

const isCashoutName = (name) => lower(name) === "retiro";

/** Agrupa gastos por categoría y subcategoría */
function groupSpentsByCategory(spents) {
  const catMap = new Map();

  for (const r of spents) {
    const catId = r.category?._id || r.category?.name || "default";
    const catName = r.category?.name || "Sin categoría";
    let cat = catMap.get(catId);
    if (!cat) {
      cat = {
        category: { _id: r.category?._id, name: catName },
        total_amount: 0,
        total_count: 0,
        operation_amount: 0,
        _subs: new Map(),
      };
      catMap.set(catId, cat);
    }

    cat.total_amount += r.total_amount || 0;
    cat.total_count += r.total_count || 0;
    cat.operation_amount += r.operation_amount || 0;

    const subId = r.sub_category?._id || r.sub_category?.name || "default";
    const subName = r.sub_category?.name || "Sin subcategoría";
    let sub = cat._subs.get(subId);
    if (!sub) {
      sub = {
        sub_category: { _id: r.sub_category?._id, name: subName },
        total_amount: 0,
        total_count: 0,
        operation_amount: 0,
      };
      cat._subs.set(subId, sub);
    }
    sub.total_amount += r.total_amount || 0;
    sub.total_count += r.total_count || 0;
    sub.operation_amount += r.operation_amount || 0;
  }

  const grouped = Array.from(catMap.values()).map((cat) => ({
    category: cat.category,
    total_amount: cat.total_amount,
    total_count: cat.total_count,
    operation_amount: cat.operation_amount,
    subcategories: Array.from(cat._subs.values()).sort(
      (a: any, b: any) => a.total_amount - b.total_amount // más gasto (más negativo) primero
    ),
  }));

  // Ordenar categorías por monto (más negativo primero)
  grouped.sort((a, b) => a.total_amount - b.total_amount);
  return grouped;
}

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
  const [showCategories, setShowCategories] = useState([]);

  // Clasificación por signo y por nombre de categoría (para no mezclar inversiones/retiros dentro de “Gastos”)
  const incomes = (cashflowsSummary || []).filter(
    (c) => (c.total_amount || 0) > 0
  );

  const onlyNegatives = (cashflowsSummary || []).filter(
    (c) => (c.total_amount || 0) < 0
  );

  const investments = onlyNegatives.filter((c) =>
    isInvestmentName(c.category?.name)
  );
  const cashouts = onlyNegatives.filter((c) => isCashoutName(c.category?.name));

  // Gastos operativos = negativos excluyendo inversiones y retiros
  const spents = onlyNegatives.filter(
    (c) =>
      !isInvestmentName(c.category?.name) && !isCashoutName(c.category?.name)
  );

  const total_income = incomes.reduce(
    (acc, curr) => acc + (curr.total_amount || 0),
    0
  );
  const total_spent = spents.reduce(
    (acc, curr) => acc + (curr.total_amount || 0),
    0
  );
  const total_invested = investments.reduce(
    (acc, curr) => acc + (curr.total_amount || 0),
    0
  );
  const total_cashouts = cashouts.reduce(
    (acc, curr) => acc + (curr.total_amount || 0),
    0
  );

  const operativeBalance = total_income + total_spent; // spents es negativo
  const globalBalance = operativeBalance + total_invested; // investments es negativo

  const selectedSubCategory = searchParams.get("subCategory");
  const selectedCategory = searchParams.get("category");
  const handleSubCategoryClick = (subCategory, category) => {
    const isSelected =
      selectedSubCategory === subCategory && category === selectedCategory;
    if (!isSelected) {
      router.push(
        `/cashflows?${createQueryString(
          "",
          ["category", "subCategory", "period", "view"],
          [category, subCategory, period || "this_month", "concept"],
          "/cashflows"
        )}`
      );
    }
  };

  const filterClasses = filter ? "group-hover:underline" : "";

  // Agrupar gastos por categoría y subcategoría
  const spentsGrouped = groupSpentsByCategory(spents);

  return (
    <Card className="outline-none w-full min-w-[20rem] sm:max-w-[40rem] rounded-none sm:rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* === INGRESOS === */}
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
            .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0))
            .map((c) => (
              <div
                key={`${c.category?.name}-${c.sub_category?.name}-inc`}
                className={`group ${filter ? "cursor-pointer" : ""} ml-6`}
                onClick={() =>
                  handleSubCategoryClick(c.sub_category?.name, c.category?.name)
                }
              >
                <div className=" flex justify-between items-center text-xs font-light group-hover:underline">
                  <div className="flex items-center gap-1.5">
                    <span>{c.sub_category?.name || "Sin subcategoría"}</span>{" "}
                    <span className="font-extralight text-muted-foreground text-[10px]">
                      (
                      <span className="text-blue-600">
                        {total_income
                          ? (
                              ((c.total_amount || 0) / total_income) *
                              100
                            ).toFixed(2)
                          : "0.00"}
                        %
                      </span>
                      )
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CashflowSummaryUSDTooltip
                      c={c}
                      id={`${c.category?.name}-${c.sub_category?.name}-inc`}
                      entityName="movimiento"
                      exchange_rate={c.avg_rate || aquapp_rate}
                    />
                    <span>{toMoney(c.total_amount, true)}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* === GASTOS agrupados por categoría -> subcategorías === */}
        <div className=" flex justify-between items-center text-sm mt-3">
          <div className="flex items-center gap-1">
            <span className="font-bold">Gastos</span>
          </div>
          <span className="font-normal text-chart-3">
            {toMoney(total_spent)}
          </span>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          {spentsGrouped.map((cat) => (
            <div key={cat.category?._id || cat.category?.name || "cat"}>
              {/* Cabecera de categoría */}
              <div className=" flex justify-between items-start text-xs font-medium mt-1">
                <div className="flex items-start gap-1.5 mt-0.5">
                  {showCategories.includes(cat.category.name) ? (
                    <Eye
                      className="w-3 h-3 hover:text-blue-600 cursor-pointer mt-0.5"
                      strokeWidth={1}
                      onClick={() =>
                        setShowCategories([
                          showCategories.filter((c) => c !== cat.category.name),
                        ])
                      }
                    />
                  ) : (
                    <EyeClosed
                      className="w-3 h-3 hover:text-blue-600 cursor-pointer mt-0.5"
                      strokeWidth={1}
                      onClick={() =>
                        setShowCategories(
                          showCategories.concat([cat.category.name])
                        )
                      }
                    />
                  )}
                  <span className="uppercase tracking-wide font-bold select-none">
                    {cat.category?.name || "Sin categoría"}
                  </span>
                  {cat.total_count ? (
                    <span className="font-extralight text-muted-foreground text-[10px]">
                      (<span>{cat.total_count}</span>)
                    </span>
                  ) : null}
                  <span className="font-light ml-1 text-[10px]">
                    {total_spent
                      ? (((cat.total_amount || 0) / total_spent) * 100).toFixed(
                          2
                        )
                      : "0.00"}
                    %
                  </span>
                </div>
                <div className="flex flex-col text-end">
                  {Math.abs(cat.operation_amount) !==
                    Math.abs(cat.total_amount) && (
                    <span className="text-chart-5">
                      {toMoney(cat.operation_amount, true)}
                    </span>
                  )}
                  <span className="text-chart-3">
                    {toMoney(cat.total_amount, true)}
                  </span>
                </div>
              </div>

              {/* Subcategorías dentro de la categoría */}
              {showCategories.includes(cat.category.name) && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {cat.subcategories.map((s: any) => (
                    <div
                      key={
                        (s.sub_category?._id || s.sub_category?.name || "sub") +
                        "-" +
                        (cat.category?._id || cat.category?.name)
                      }
                      className={`group ${filter ? "cursor-pointer" : ""} ml-6`}
                      onClick={() =>
                        handleSubCategoryClick(
                          s.sub_category?.name,
                          cat.category?.name
                        )
                      }
                    >
                      <div className=" flex justify-between items-center text-xs font-light">
                        <div className="flex items-center gap-1.5">
                          <span className={filterClasses}>
                            {s.sub_category?.name || "Sin subcategoría"}
                          </span>{" "}
                          <span className="font-extralight text-muted-foreground text-[10px]">
                            (<span>{s.total_count || 0}</span>)
                            <span className="text-blue-600 ml-1">
                              {total_spent
                                ? (
                                    ((s.total_amount || 0) / total_spent) *
                                    100
                                  ).toFixed(2)
                                : "0.00"}
                              %
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={filterClasses}>
                            {toMoney(s.total_amount, true)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2">
          <Separator />
        </div>

        {/* === Resultado financiero === */}
        <div className=" flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Resultado financiero</span>
          </div>
          <span
            className={`font-normal ${
              operativeBalance > 0
                ? "text-chart-2"
                : operativeBalance < 0
                  ? "text-chart-3"
                  : "text-chart-1"
            }`}
          >
            {toMoney(operativeBalance)}
          </span>
        </div>

        {/* === Inversiones === */}
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
              key={`${c.category?.name}-${c.sub_category?.name}-inv`}
              className={`group ${filter ? "cursor-pointer" : ""}`}
              onClick={() =>
                handleSubCategoryClick(c.sub_category?.name, c.category?.name)
              }
            >
              <div className=" flex justify-between items-center text-xs font-light">
                <div className="flex items-center gap-1.5">
                  <span className={filterClasses}>{c.sub_category?.name}</span>{" "}
                  <span className="font-extralight text-muted-foreground text-[10px]">
                    (<span>{c.total_count || 0}</span>)
                    <span className="text-blue-600 ml-1">
                      {total_invested
                        ? (
                            ((c.total_amount || 0) / total_invested) *
                            100
                          ).toFixed(2)
                        : "0.00"}
                      %
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CashflowSummaryUSDTooltip
                    c={c}
                    id={`${c.category?.name}-${c.sub_category?.name}-inv`}
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

        {/* === Saldo financiero === */}
        <div className=" flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Saldo financiero</span>
          </div>
          <span
            className={`font-normal ${
              globalBalance > 0
                ? "text-chart-2"
                : globalBalance < 0
                  ? "text-chart-3"
                  : "text-chart-1"
            }`}
          >
            {toMoney(globalBalance)}
          </span>
        </div>

        {/* === Retiros === */}
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

        {/* === Flujo neto de dinero === */}
        <div className=" flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Flujo neto de dinero</span>
          </div>
          <span
            className={`font-normal ${
              globalBalance + total_cashouts > 0
                ? "text-chart-2"
                : globalBalance + total_cashouts < 0
                  ? "text-chart-3"
                  : "text-chart-1"
            }`}
          >
            {toMoney(globalBalance + total_cashouts)}
          </span>
        </div>
      </CardContent>

      {aclaration && (
        <CardFooter>
          <span className="text-muted-foreground font-extralight text-xs ">
            <u>Aclaración</u>: {aclaration}
          </span>
        </CardFooter>
      )}
    </Card>
  );
};

export default CashflowsSummary;
