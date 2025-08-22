"use client";

import { toMoney } from "@/helpers/fmt";
import useFlags from "@/hooks/use-falgs";
import { useStore } from "@/stores";

const CancellingAmount = () => {
  const amount = useStore((s) => s.cashflow.amount);
  const { getFlag } = useFlags();
  const exchange_rate = useStore((s) => s.cashflow.exchange_rate);
  const cancelling = useStore((s) => s.cashflow.cancelling);
  const wallet = useStore((s) => s.cashflow.wallet) as any;

  const shouldExchange = cancelling !== wallet?.currency;
  let cancellingAmount = Math.round(exchange_rate * amount);

  if (shouldExchange && cancelling === "usd") {
    cancellingAmount = Math.round(amount / exchange_rate);
  }

  if (cancelling === wallet?.currency || !wallet?.currency) return <></>;

  return (
    <div className="text-xs text-gray-700 font-light mt-2 mb-2">
      Se reciben {toMoney(amount)} {getFlag(wallet.currency)}
      {", "}
      cancelando {toMoney(cancellingAmount)} de la deuda en{" "}
      {getFlag(cancelling)}.
    </div>
  );
};

export default CancellingAmount;
