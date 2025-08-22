"use client";
import MyInfoTooltip from "@/components/custom-ui/MyInfoTooltip";
import { toMoney } from "@/helpers/fmt";
import { pluralize } from "@/helpers/text";
import useFlags from "@/hooks/use-falgs";
import React from "react";

const CashflowSummaryUSDTooltip = ({
  c,
  id,
  entityName = "venta",
  exchange_rate,
  dontPluralize = false,
}) => {
  const { getFlag } = useFlags();

  if (!c.usd_amount || c.usd_amount === 0) return null;
  return (
    <MyInfoTooltip
      id={id}
      tinyIcon
      text={`Desglose de los ${toMoney(c.total_amount, true)}`}
    >
      <span className="block mb-2">
        <span className="text-yellow-200">{c.total_count}</span>{" "}
        {dontPluralize
          ? entityName
          : `${pluralize(entityName, c.total_count)} en total.`}
      </span>

      <span>
        <span className="text-yellow-200">{c.count}</span>
        {c.preText} en pesos {getFlag()}{" "}
        {c.count > 0 && (
          <span>
            por{" "}
            <span className="text-green-300">{toMoney(c.amount, true)}</span>
          </span>
        )}{" "}
      </span>
      <br />
      <span className="text-xs text-gray-400 text-extralight">
        <span className="text-yellow-200">{c.usd_count}</span>
        {c.preText} en dólares 🇺🇸 por{" "}
        <span className="text-green-300">
          {toMoney(c.usd_amount_converted, true)}
        </span>{" "}
        <sup>*</sup>
        <br />
        <br />
        <sup>*</sup>{" "}
        <span className="text-green-300">
          {toMoney(c.usd_amount, true, true, "u$s")}
        </span>{" "}
        a <span className="text-blue-300">{toMoney(exchange_rate)}</span>
      </span>
    </MyInfoTooltip>
  );
};

export default CashflowSummaryUSDTooltip;
