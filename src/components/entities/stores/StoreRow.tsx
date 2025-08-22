"use client";

import DropdownRow from "@/components/custom-ui/DropdownRow";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { validatePhone } from "@/helpers/phones";
import usePermissions from "@/hooks/use-permissions";
import { MapPin } from "lucide-react";
import Image from "next/image";
import SaleSummaryForRows from "../sales/SaleSummaryForRows";

const StoreRow = ({ s }) => {
  const { isOwner } = usePermissions();
  let phone;
  if (s.whatsapp?.number) {
    phone = validatePhone({
      number: "+" + s.whatsapp?.number,
      countryCode: s.whatsapp?.number.slice(0, 2),
    });
  }

  return (
    <DropdownRow entity="store" item={s}>
      <div className="flex flex-row py-3 cursor-pointer border-b-violet-50 text-sm">
        <div className="w-full flex flex-col font-light text-xs">
          <span translate="no" className="w-fit sm:w-60 font-bold block mb-1">
            {s.name}
          </span>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.2} />
            <span translate="no">{s.address}</span>
          </div>
          {s.whatsapp?.number && (
            <div className="flex items-center mt-1">
              <Image
                src={`${CONFIG.blob_url}/whatsapp.png`}
                alt="Logo de Whatsapp"
                width={14}
                height={14}
                className="mr-1"
              />{" "}
              <span className="font-light text-xs">{phone.number}</span>
            </div>
          )}
        </div>
        {isOwner && <SaleSummaryForRows sales={s.sales} />}
      </div>
    </DropdownRow>
  );
};

export default StoreRow;
