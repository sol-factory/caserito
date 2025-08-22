"use client";
import MyInput from "@/components/custom-ui/MyInput";
import MyTextArea from "@/components/custom-ui/MyTextArea";
import { LoadingSpinner } from "@/components/custom-ui/Spinner";
import { Button } from "@/components/ui/button";
import { ENTITIES } from "@/config";
import api from "@/helpers/api";
import { toMoney } from "@/helpers/fmt";
import { notify } from "@/helpers/notify";
import { getWalletUrl } from "@/helpers/ui";
import { useStore } from "@/stores";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDown, ArrowUp, WalletMinimal } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const WalletClosureForm = () => {
  const w = useStore((s) => s.wallet) as any;
  const update = useStore((s) => s.update);
  const reset = useStore((s) => s.reset);
  const creating = useStore((s) => s.creating);
  const loading = useStore((s) => s.loading);
  const router = useRouter();

  const balanceAtStart = w.current_balance - w.gathered + w.spent;
  const currenctSign = w.currency === "usd" ? "u$s" : "$"; //getCurrencySign(w.currency);

  const difference = w.counted_closing - w.current_balance;
  const config = ENTITIES["wallet"];
  if (!w || !w._id) return null;

  return (
    <div className="flex flex-col w-full gap-0">
      <div className="flex flex-col items-center justify-center w-full pb-4">
        <div className={`flex items-center gap-2`}>
          <Image
            src={getWalletUrl(w)}
            className={`w-4 rounded-sm`}
            width={17}
            height={17}
            alt="Image"
          />
          <div className="flex flex-col text-md">
            <span>{w.name}</span>
          </div>
        </div>
        <span className="font-extralight text-blue-600 text-xs">
          {format(new Date(w.date), "EEEE dd 'de' MMMM yyyy", { locale: es })}
        </span>
      </div>
      <div className=" flex items-center justify-between font-light text-sm pr-3">
        <div className="flex items-center gap-2">
          <WalletMinimal className="text-gray-800 w-4 h-4" strokeWidth={1.7} />
          <span>Saldo al inicio</span>
        </div>
        <div className="flex flex-col text-end">
          <span>{toMoney(balanceAtStart, false, true, currenctSign)}</span>
        </div>
      </div>
      <div className=" flex items-center justify-between font-light text-sm mt-3.5 pr-3">
        <div className="flex items-center gap-2">
          <ArrowUp className="text-chart-2 w-4 h-4" />
          <span>Ingresos</span>
          {w.gatherings > 0 && (
            <span className="text-muted-foreground font-extralight ml-1 text-[0.8rem] mt-[2px]">
              ({w.gatherings})
            </span>
          )}
        </div>
        <div className="flex flex-col text-end">
          <span>{toMoney(w.gathered, false, true, currenctSign)}</span>
        </div>
      </div>

      <div className=" flex items-center justify-between font-light text-sm mb-3 pr-3">
        <div className="flex items-center gap-2">
          <ArrowDown className="text-chart-3 w-4 h-4" />
          <span>Egresos</span>
          {w.spents > 0 && (
            <span className="text-muted-foreground font-extralight ml-1 text-[0.8rem] mt-[2px]">
              ({w.spents})
            </span>
          )}
        </div>
        <div className="flex flex-col text-end text-md">
          <span>{toMoney(w.spent, false, true, currenctSign)}</span>
        </div>
      </div>
      <hr className="block mb-2" />
      <div
        className=" flex items-center justify-between font-light text-sm mb-5 pr-3 group hover:cursor-pointer"
        onClick={() => update("wallet", { counted_closing: w.current_balance })}
      >
        <div className="flex items-center gap-2">
          <WalletMinimal className="text-gray-800 w-4 h-4" strokeWidth={1.7} />
          <span>Saldo esperado</span>
        </div>
        <div className="flex flex-col text-end text-md group-hover:underline">
          <span>{toMoney(w.current_balance, false, true, currenctSign)}</span>
        </div>
      </div>
      <div className=" flex items-center justify-between font-light text-sm mb-5">
        <div className="flex items-center gap-2">
          <WalletMinimal className="text-gray-800 w-4 h-4" strokeWidth={1.7} />
          <span>Saldo real</span>
        </div>
        <MyInput
          id="real-balance"
          entity="wallet"
          field="counted_closing"
          type="number"
          placeholder="Saldo real"
          required
          autoFocus
          className="max-w-28"
          placeholderClassName="!-top-[0.5rem]"
          inputClassName="text-end"
        />
      </div>
      {w.counted_closing > 0 && (
        <div className=" flex items-center justify-center gap-3 font-light mt-2 text-sm mb-3 pr-2.5">
          <div className="flex items-center gap-1 font-bold">
            {difference < 0 && (
              <>
                <ArrowDown className="text-chart-3 w-4 h-4" />
                <span>Faltan</span>
              </>
            )}
            {difference > 0 && (
              <>
                <ArrowUp className="text-chart-2 w-4 h-4" />
                <span>Sobran</span>
              </>
            )}
          </div>
          {Math.abs(difference) === 0 && (
            <div className="text-center w-full font-bold text-sm">
              No existen diferencias ✅
            </div>
          )}
          {Math.abs(difference) > 0 && (
            <div className="flex flex-col text-end text-md pr-1">
              <span className="block">
                {toMoney(difference, false, true, currenctSign)}
              </span>
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        disabled={loading === config.loadingKey || w.counted_closing === null}
        className="w-full mt-3 select-none"
        onClick={async (e) => {
          e.stopPropagation();
          update("loading", "wallet-form");
          const result = await api(
            { ...w, balanceAtStart, difference },
            "wallet",
            "createWalletClosure",
            router
          );
          await notify(result);
          update("loading", "");
          update("openDialog", "");
          update("openDialogIndex", 0);
          reset("wallet");
        }}
      >
        {loading === config.loadingKey ? (
          <LoadingSpinner />
        ) : creating ? (
          "Realizar cierre diario"
        ) : (
          "Guardar cambios"
        )}
      </Button>
    </div>
  );
};

export default WalletClosureForm;
