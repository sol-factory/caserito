import { CONFIG } from "@/config/constanst";
import { cn } from "@/helpers/ui";
import Image from "next/image";
import React from "react";

const SaleAddress = ({ s, className = "" }) => {
  return (
    <div
      className="flex items-center gap-1 hover:underline"
      onClick={(e) => {
        if (s.lat) {
          e.stopPropagation();
          window.open(`https://www.google.com/maps?q=${s.lat},${s.lng}`);
        }
      }}
    >
      {s.lat && (
        <Image
          src={`${CONFIG.blob_url}/map-1RFxiVx7smoDeYChcZWimSUPPigzNN.png`}
          className="w-[0.7rem] h-[0.7rem] mx-0.5"
          width={16}
          height={16}
          alt="Image"
        />
      )}
      <span
        className={cn(
          "text-orange-600 text-xs font-extralight text-nowrap",
          className
        )}
      >
        {s.client.address}
      </span>
    </div>
  );
};

export default SaleAddress;
