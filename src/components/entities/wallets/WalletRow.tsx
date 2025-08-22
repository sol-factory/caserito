/* eslint-disable @next/next/no-img-element */
"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { Badge } from "@/components/ui/badge";
import { toMoney } from "@/helpers/fmt";
import { getWalletUrl } from "@/helpers/ui";
import useFlags from "@/hooks/use-falgs";
import { MapPin } from "lucide-react";
import Image from "next/image";

const WalletRow = ({ w }) => {
  const { getFlag, country } = useFlags();

  const isEfectivo = w.name === "Efectivo";

  return (
    <DropdownRow
      entity="wallet"
      item={w}
      preventClick={isEfectivo}
      className={!isEfectivo ? "hover:cursor-pointer" : ""}
    >
      <div className="flex pt-3 pb-4 cursor-pointer border-b-violet-50 text-sm">
        <div className="w-16 mt-0.5">
          {" "}
          <Image
            src={getWalletUrl(w)}
            alt="Logo marca"
            width={25}
            height={25}
            className="w-7"
          />
        </div>

        <div translate="no">
          <div className="flex flex-col justify-center w-28 sm:w-48 sm:pr-5">
            <div className="flex items-center gap-2 select-none">
              <span className="inline-block font-semibold">{w.name}</span>
              {w.name === "Efectivo" && <span>🔒</span>}
            </div>
            {w.currency && country?.code === "AR" && (
              <Badge className="w-fit font-light bg-gray-200 hover:bg-gray-200  text-gray-700 text-[0.7rem] px-1.5 h-4 mt-1">
                {w.currency === "ars" ? `${getFlag()} pesos` : "🇺🇸 dólares"}
              </Badge>
            )}
          </div>
        </div>
        <div className="w-32 sm:w-48 text-end sm:text-start sm:pl-10">
          <div className="flex flex-col gap-2">
            {toMoney(
              w.balance || 0,
              false,
              true,
              w.currency === "usd" ? "u$s" : "$"
            )}
          </div>
        </div>
        {w.name !== "Efectivo" && (
          <div className="hidden sm:flex">
            <div className="flex flex-col gap-2">
              {w.stores.map((s) => (
                <div key={s._id} className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />{" "}
                  <span translate="no">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DropdownRow>
  );
};

export default WalletRow;
