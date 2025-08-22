"use client";
import { toMoney } from "@/helpers/fmt";
import React from "react";
import StoresList from "../stores/StoresList";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import { Badge } from "@/components/ui/badge";
import { Copy, Hash } from "lucide-react";
import { capitalizeFirstLetter } from "@/helpers/text";
import usePermissions from "@/hooks/use-permissions";
import useFlags from "@/hooks/use-falgs";
import SaleSummaryForRows from "../sales/SaleSummaryForRows";

const ServiceRow = ({ s, allow_multi_currency = false }) => {
  const { isOwner, can_view_amount_service } = usePermissions();
  const { getFlag } = useFlags();
  return (
    <DropdownRow entity="service" item={s}>
      <div className="flex flex-col sm:flex-row py-3 cursor-pointer border-b-violet-50 text-sm">
        <div className="flex flex-col w-full sm:w-40 pr-3 mb-2 md:mb-0 font-bold select-none break-words">
          <span translate="no" className="mt-0.5">
            {capitalizeFirstLetter(s.name)}
          </span>{" "}
          <span className="text-muted-foreground text-xs font-extralight break-words -mt-0.5 mb-1">
            {s.detail}
          </span>
          {allow_multi_currency && (
            <Badge className="w-fit font-light text-nowrap  bg-gray-200 hover:bg-gray-200 rounded-lg  text-gray-700 text-[0.6rem] px-1 h-4">
              {s.currency === "ars"
                ? `${getFlag()} Precio en pesos`
                : "🇺🇸 Precio en dólares"}
            </Badge>
          )}
          {s.allow_quantity && (
            <Badge className="mt-1 w-fit font-light bg-gray-500 hover:bg-gray-500 rounded-lg  text-white text-[0.6rem] px-1 h-4 text-nowrap">
              <Hash className="mr-1 w-2" strokeWidth={2.2} />
              Admite cantidades
            </Badge>
          )}
          {s.duplicated && (
            <Badge className="w-fit font-light bg-yellow-400 hover:bg-yellow-400 rounded-lg text-gray-600 text-[0.6rem] px-1 h-4 mt-1">
              <Copy className="mr-1 w-2.5" strokeWidth={2.2} />
              Duplicado
            </Badge>
          )}
        </div>

        <div className={`flex flex-col gap-1 w-full lg:w-[19rem] sm:pl-3`}>
          {s.prices.map((p) => (
            <div
              className="flex items-center justify-between w-full md:w-[90%]"
              key={p._id}
            >
              <div className="flex items-center gap-2 select-none">
                {!!p.classification_id && (
                  <Image
                    width={18}
                    height={20}
                    alt={p.classification_id}
                    src={`${CONFIG.blob_url}/vehicles/${p.classification_id}.png`}
                  />
                )}
                <span>{p.name}</span>
              </div>
              {can_view_amount_service && (
                <span className="text-end">{toMoney(p.value)}</span>
              )}
            </div>
          ))}
        </div>

        <StoresList stores={s.stores} />

        {isOwner && <SaleSummaryForRows sales={s.sales} />}
      </div>
    </DropdownRow>
  );
};

export default ServiceRow;
