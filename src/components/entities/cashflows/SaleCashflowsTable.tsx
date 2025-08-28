"use client";
import { useStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";

import { toMoney } from "@/helpers/fmt";

import api from "@/helpers/api";
import SendingLoader from "../templates/SendingLoader";
import { DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
import useFlags from "@/hooks/use-falgs";
import SaleCashflowRow from "./SaleCashflowRow";
import { notify } from "@/helpers/notify";

const SaleCashflowsTable = () => {
  const cashflow_amount = useStore((s) => s.cashflow.amount);
  const creating = useStore((s) => s.creating);
  const update = useStore((s) => s.update);
  const sale = useStore((s) => s.sale);
  const cancelling = useStore((s) => s.cashflow.cancelling);
  const wallet = useStore((s) => s.cashflow.wallet) as any;
  const exchange_rate = useStore((s) => s.cashflow.exchange_rate);
  const selectedId = useStore((s) => s.cashflow._id);

  const { data: cashflows, isPending } = useQuery({
    queryKey: ["attachments", sale?._id],
    staleTime: 0,
    queryFn: async () => {
      const data = await api(
        { filterId: sale?._id },
        "cashflow",
        "getGatherings"
      );
      update("sale", {
        gathered_amount: data
          .filter((c) => !c.deleted && c.cancelling === cancelling)
          .reduce((prev, curr) => prev + curr.amount * curr.exchange_rate, 0),
      });
      return data;
    },
    enabled: !!sale?._id,
  });

  const activeCashflows = cashflows?.filter((c) => !c.deleted) || [];

  const amountField = "amount";

  const amount = sale[amountField];
  const saleNetAmount = amount;

  const gathered =
    activeCashflows?.reduce((prev, curr) => prev + curr.amount, 0) || 0;

  const pendingAmount = Math.round(
    saleNetAmount + gathered * (sale.kind === "income" ? -1 : 1)
  );

  console.log({ sale });

  useEffect(() => {
    const shouldExchange = cancelling !== wallet?.currency;
    let cancellingAmount = cashflow_amount;

    if (shouldExchange) {
      if (cancelling === "usd") {
        cancellingAmount = cashflow_amount / exchange_rate;
      } else {
        cancellingAmount = cashflow_amount * exchange_rate;
      }
      cancellingAmount = Math.round(cancellingAmount);
    }

    update("avoidClosingModal", cancellingAmount < pendingAmount || !creating);
  }, [wallet?.currency, cashflow_amount]);

  if (isPending && !cashflows) {
    return (
      <div className="flex w-full items-center justify-center h-10">
        <SendingLoader isSending={true} />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <DialogTitle className="mb-3">Resumen de la operación</DialogTitle>

      <div className="flex flex-col mb-2">
        <div className="flex items-center justify-between text-sm w-full font-normal">
          <span>Monto</span> <span>{toMoney(saleNetAmount)}</span>{" "}
        </div>

        <span className="text-xs underline mt-3 mb-2">
          {sale.kind === "income" ? "Cobros recibidos" : "Pagos realizados"}
        </span>
        {activeCashflows.length === 0 && (
          <span className="text-xs font-extralight text-muted-foreground mt-1 mb-2">
            Aún no se recibieron cobros.
          </span>
        )}
        <div className="flex flex-col gap-2">
          {activeCashflows.map((c) => (
            <SaleCashflowRow c={c} selectedId={selectedId} key={c._id} />
          ))}
        </div>
      </div>
      <hr />
      <div
        className="flex items-center justify-between text-sm w-full font-normal mt-2 cursor-pointer hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          if (!wallet.name) {
            notify({
              ok: false,
              message:
                "Debes seleccionar una billetera para autocompletar el monto.",
            });
            return;
          }
          const amountToComplete = pendingAmount;
          let multiplyBy = 1;
          if (wallet.currency !== cancelling) {
            multiplyBy =
              cancelling === "usd" ? exchange_rate : 1 / exchange_rate;
          }
          update("cashflow", {
            amount: Math.ceil(+(amountToComplete * multiplyBy).toFixed(2)),
          });
        }}
      >
        <span>{sale.kind === "income" ? "Diferencia" : "Restan pagar"}</span>
        <span>{toMoney(pendingAmount)}</span>
      </div>
    </div>
  );
};

export default SaleCashflowsTable;
