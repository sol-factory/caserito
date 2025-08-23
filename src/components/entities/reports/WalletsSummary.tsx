"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrencySign } from "@/helpers/currency";
import { toMoney } from "@/helpers/fmt";
import { getWalletUrl } from "@/helpers/ui";
import { useStore } from "@/stores";
import { differenceInCalendarDays } from "date-fns";
import { ArrowDown, ArrowUp, Funnel, FunnelX } from "lucide-react";
import Image from "next/image";
import ClosureDetail from "../wallets/ClosureDetail";

const WalletsSummary = ({
  gatheredByWallet,
  closures = [],
  dayFilters = null,
  date = null,
  lastCashflows = [],
  storeWalletsBalances = [],
}) => {
  const update = useStore((s) => s.update);
  const reset = useStore((s) => s.reset);
  const selected_wallet = useStore((s) => s.selected_wallet);

  const wallets_count = gatheredByWallet?.length;
  return (
    <div className="flex flex-col w-full gap-2">
      {gatheredByWallet.map((w) => {
        const color =
          w.balance > 0
            ? "text-chart-2"
            : w.balance < 0
              ? "text-chart-3"
              : "text-chart-1";

        const currenctSign = getCurrencySign(w.currency);
        // Solo se puede hacer cierre si es el último día en que hubo movimiento

        const isSelected = selected_wallet?._id === w._id;

        return (
          <Card
            key={w._id}
            className="outline-none w-full rounded-none sm:rounded-2xl"
          >
            <CardHeader className="py-4">
              <CardTitle className="flex items-center justify-between space-y-0">
                <div className={`flex items-center gap-2`}>
                  <Image
                    src={getWalletUrl(w)}
                    className={`w-6 rounded-sm`}
                    width={17}
                    height={17}
                    alt="Image"
                  />
                  <div className="flex items-center gap-2">
                    <span>{w.name}</span>

                    {isSelected && dayFilters && wallets_count > 1 && (
                      <FunnelX
                        className="w-3.5 h-3.5 text-red-600 cursor-pointer"
                        strokeWidth={1.3}
                        onClick={() => reset("selected_wallet")}
                      />
                    )}
                    {!isSelected && dayFilters && wallets_count > 1 && (
                      <Funnel
                        className="w-3.5 h-3.5 hover:text-blue-600 cursor-pointer"
                        strokeWidth={1.3}
                        onClick={() => update("selected_wallet", w)}
                      />
                    )}
                  </div>
                </div>
                <span className={color}>
                  {toMoney(w.balance, false, true, currenctSign)}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-4 mt-2">
              <div className=" flex items-center justify-between font-light text-sm">
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

              <div className=" flex items-center justify-between font-light text-sm">
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WalletsSummary;
