"use client";
import { CONFIG } from "@/config/constanst";
import { toSlug } from "@/helpers/text";
import Image from "next/image";
import React from "react";

const VehicleDetails = ({ vehicle }) => {
  if (!vehicle?.brand) return "";

  return (
    <div className="flex items-center gap-1">
      <Image
        src={`${CONFIG.blob_url}/brands/${toSlug(vehicle.brand)}.png`}
        width={18}
        height={18}
        alt="Image"
      />

      <span className="text-xs font-normal text-nowrap">{vehicle.model}</span>
      <span className="text-xs font-normal text-blue-600">
        {vehicle.patent.toUpperCase()}
      </span>
    </div>
  );
};

export default VehicleDetails;
