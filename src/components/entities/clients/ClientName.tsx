import { toProperCase } from "@/helpers/text";
import { cn } from "@/lib/utils";
import { Building, User } from "lucide-react";

const ClientName = ({
  client,
  gap = "gap-1.5",
  textSize = "",
  textClassName = "",
  nameHeight = "h-5",
}) => {
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
          {toProperCase(`${client.name}`)}
        </span>
      </div>
    </div>
  );
};

export default ClientName;
