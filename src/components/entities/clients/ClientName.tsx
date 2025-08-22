import { CONFIG } from "@/config/constanst";
import { toProperCase } from "@/helpers/text";
import { cn } from "@/lib/utils";
import { Building, User } from "lucide-react";
import Image from "next/image";

const ClientName = ({
  client,
  trimLastname = false,
  gap = "gap-1.5",
  textSize = "",
  textClassName = "",
  nameHeight = "h-5",
  imageWidth = "w-5",
}) => {
  const lastname =
    trimLastname && client.lastname
      ? `${client.lastname.split("")[0]}.`
      : client.lastname;
  return (
    <div className="flex items-center">
      <div className={`flex items-center ${gap}`}>
        {client.kind === "company" ? (
          <Building className="!w-3.5 h-3.5 text-teal-600" strokeWidth={2} />
        ) : (
          <User className="!w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
        )}
        <span
          className={cn(
            `font-semibold ${nameHeight} ${textSize} text-nowrap`,
            textClassName
          )}
        >
          {toProperCase(`${client.firstname} ${lastname}`)}
        </span>
      </div>
      {client.category && (
        <Image
          src={`${CONFIG.blob_url}/clients/${client.category}${client.category === "gold" ? "2" : ""}.png`}
          alt=""
          width={60}
          height={60}
          className={`${imageWidth} cursor-pointer ml-1 mb-0.5 !drop-shadow-[0_0.5px_0.3px_rgba(0,0,0,1)] rounded-sm hover:scale-105 transition-transform`}
          onClick={() => {}}
        />
      )}
    </div>
  );
};

export default ClientName;
