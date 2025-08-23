import { Progress } from "@/components/ui/progress";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { cn } from "@/helpers/ui";
import useFlags from "@/hooks/use-falgs";
import Image from "next/image";

export const SaleProgressBar = ({
  s,
  currency,
  showFlags = false,
  showAmount = false,
  className = "",
}) => {
  const { getFlag } = useFlags();
  const amountField = currency === "usd" ? "usd_amount" : "amount";
  const gatheredAmountField =
    currency === "usd" ? "usd_gathered_amount" : "gathered_amount";

  const netAmount = s[amountField];
  if (netAmount <= 0) return null;

  const extraPayment = s[gatheredAmountField] - netAmount;
  const currencySign = currency === "usd" ? "u$s" : "$";
  return (
    <div>
      {showAmount && (
        <span className={`block mb-1 text-end `}>
          {toMoney(netAmount, false, false, currencySign)}
        </span>
      )}
      <div
        className={cn(
          "flex items-center justify-end sm:justify-start gap-1",
          className
        )}
      >
        <div className="flex items-center gap-1">
          {showFlags && getFlag(currency)}
          <Progress
            value={(s[gatheredAmountField] / netAmount) * 100}
            className=" bg-gray-50 ring-[0.5px] ring-gray-300 w-12"
          />
        </div>
        <div className="flex items-center gap-0.5 ml-1">
          {extraPayment > 0 && (
            <div title={toMoney(extraPayment, false, false, currency)}>
              <Image
                src={`${CONFIG.blob_url}/money.png`}
                alt="Logo de pagos extras"
                className="min-w-3 w-3 h-3"
                width={10}
                height={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
