"use client";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/config/constanst";
import Image from "next/image";

const OpenPendingSub = ({ url }) => {
  return (
    <div className="flex flex-col sm:flex-row w-full sm:justify-end gap-2">
      <Button
        variant="secondary"
        className="hover:bg-gray-200 sm:w-72 w-full mt-10"
        onClick={() => {
          window.location.href = url;
        }}
      >
        <Image
          src={`${CONFIG.blob_url}/mp.webp`}
          alt="Avatar"
          width={75}
          height={25}
          className="overflow-hidden rounded  object-cover"
        />
        Continuar con la contratación{" "}
      </Button>
    </div>
  );
};

export default OpenPendingSub;
