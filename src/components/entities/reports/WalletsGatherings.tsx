"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrencySign } from "@/helpers/currency";
import { toMoney } from "@/helpers/fmt";
import { getWalletUrl } from "@/helpers/ui";
import useFlags from "@/hooks/use-falgs";
import { useStore } from "@/stores";
import Image from "next/image";

const WalletsGatherings = ({ gatheredByWallet }) => {
  const { getFlag } = useFlags();
  const current_store = useStore((s) => s.current_store);
  const total = gatheredByWallet.reduce(
    (prev, curr) => {
      const usd_gathered = curr.currency === "usd" ? curr.gathered : 0;
      const gathered = curr.currency !== "usd" ? curr.gathered : 0;
      return {
        usd_amount: prev.usd_amount + usd_gathered,
        amount: prev.amount + gathered,
      };
    },
    {
      usd_amount: 0,
      amount: 0,
    }
  );

  const showFlags =
    current_store?.allow_multi_currency ||
    (total.amount > 0 && total.usd_amount > 0);

  if (total.amount === 0 && total.usd_amount === 0) return <></>;
  return (
    <Card className="outline-none w-full rounded-none sm:rounded-2xl">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center justify-between space-y-0 text-xl -mb-1">
          Cobros por billetera
        </CardTitle>
        <CardDescription className="text-xs font-extralight ">
          Distribución de los{" "}
          {showFlags ? (
            <span className="mr-0.5">
              {getFlag(current_store?.country_code)}
            </span>
          ) : (
            ""
          )}
          <span className={`text-chart-2 font-normal`}>
            {toMoney(total.amount, false, true, "$")}
          </span>
          {showFlags && total.usd_amount > 0 ? (
            <div className="inline-flex items-center gap-1 mx-1">
              y
              <span className={`text-chart-2 font-normal`}>
                <span className="mr-0.5">🇺🇸</span>
                {toMoney(total.usd_amount, false, true, "$")}
              </span>
            </div>
          ) : (
            ""
          )}
          recibidos por estas ventas
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 mt-2">
        {gatheredByWallet.map((w) => {
          const currenctSign = getCurrencySign(w.currency);
          // Solo se puede hacer cierre si es el último día en que hubo movimientos

          return (
            <div key={w._id} className="flex items-center justify-between">
              <div className={`flex items-center gap-2`}>
                <Image
                  src={getWalletUrl(w)}
                  className={`w-4 rounded-sm`}
                  width={17}
                  height={17}
                  alt="Image"
                />
                <div className="flex items-center gap-1 text-sm">
                  <span>{w.name}</span>
                  <span className="text-[0.7rem] w-fit text-muted-foreground font-extralight">
                    ({w.gatherings})
                  </span>
                </div>
              </div>
              <span className="text-sm font-light">
                <span className="mr-1">{showFlags && getFlag(w.currency)}</span>
                {toMoney(w.gathered, false, true, currenctSign)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default WalletsGatherings;
