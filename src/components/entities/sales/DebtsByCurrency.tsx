"use client";

import { toMoney } from "@/helpers/fmt";
import useFlags from "@/hooks/use-falgs";

const DebtsByCurrency = ({
  debts,
  allowMultiCurrency = false,
  title = "Deudas",
}) => {
  const { getFlag } = useFlags();
  return (
    <div className="flex items-start">
      <span className="font-bold underline">{title}</span>:{" "}
      <div className="flex items-center gap-1 ml-2">
        {allowMultiCurrency && getFlag()}
        <span className="text-red-600 text-nowrap text-xs sm:text-base">
          {toMoney(debts.amount)}
        </span>
      </div>
      {debts.usd_amount > 0 && (
        <div className="flex items-center gap-1 ml-1">
          <span className="font-light px-2 sm:px-3 text-xs">y</span>{" "}
          {allowMultiCurrency && getFlag("usd")}
          <span className="text-red-600 text-nowrap text-xs sm:text-base">
            {toMoney(debts.usd_amount, false, true, "u$s")}
          </span>
        </div>
      )}
    </div>
  );
};

export default DebtsByCurrency;
