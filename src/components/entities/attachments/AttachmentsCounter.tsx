import { CONFIG } from "@/config/constanst";
import { cn } from "@/helpers/ui";
import Image from "next/image";
import React from "react";

const AttachmentsCounter = ({ count, className = "" }) => {
  if (count === 0 || !count) return null;
  return (
    <div
      className={cn("flex items-center gap-[3px]", className)}
      title={`${count} archivos adjuntos`}
    >
      <Image
        src={`${CONFIG.blob_url}/attachment.png`}
        alt="Archivos adjuntos"
        className="min-w-2.5"
        width={12}
        height={12}
      />
      <span className="font-light text-[12px]">{count}</span>
    </div>
  );
};

export default AttachmentsCounter;
