"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { CONFIG } from "@/config/constanst";
import { getDaysDifferenceText, timeAgo } from "@/helpers/date";
import { toMoney } from "@/helpers/fmt";
import { copy, toProperCase } from "@/helpers/text";
import { format, isFuture } from "date-fns";
import { es } from "date-fns/locale";
import { Cake, IdCard, Mail } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import VehicleDetails from "../vehicles/VehicleDetails";
import usePermissions from "@/hooks/use-permissions";
import ClientName from "./ClientName";
import SaleSummaryForRows from "../sales/SaleSummaryForRows";
import AttachmentsCounter from "../attachments/AttachmentsCounter";

const ClientRow = ({ c, companyName, isLastOne = false }) => {
  const searchParams = useSearchParams();
  const { isOwner, can_view_phone_client } = usePermissions();

  const filter_service_id = searchParams.get("service_id");
  let last_services_time = null;
  if (!!filter_service_id && filter_service_id !== "null") {
    last_services_time = c.last_services.filter(
      (ls) => ls._id === filter_service_id
    );
  }

  return (
    <DropdownRow
      item={c}
      entity="client"
      isLastOne={isLastOne}
      companyName={companyName}
    >
      <div
        className={`flex h-auto ${last_services_time ? "" : "items-start"} py-3 cursor-pointer text-sm`}
      >
        <div className="flex flex-col w-full md:w-60 md:min-w-60">
          <div className="flex flex-col gap-1">
            <ClientName client={c} textSize="text-md" />
            <AttachmentsCounter count={c.attachments_count} />
          </div>
          <div className="mt-1">
            {c.dob?.date && (
              <div className="flex items-center gap-1 text-xs mt-[1px]">
                <Cake
                  className="text-muted-foreground mb-[3px]"
                  size={14}
                  strokeWidth={1.5}
                />
                <span className="text-muted-foreground font-light">
                  {format(
                    new Date(c.dob.year, c.dob.month - 1, c.dob.day),
                    "dd/MM/yyyy"
                  )}
                </span>
              </div>
            )}
            {c?.fiscal_id && (
              <div
                className="flex items-center gap-1 text-xs mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  copy(c.fiscal_id, "ID fiscal");
                }}
              >
                <IdCard
                  className="text-muted-foreground mb-[1px]"
                  size={14}
                  strokeWidth={1.5}
                />
                <span className="text-muted-foreground font-light">
                  {c.fiscal_id}
                </span>
              </div>
            )}
          </div>
        </div>

        {!last_services_time && can_view_phone_client && (
          <div className={`hidden lg:flex lg:flex-col lg:w-48 lg:min-w-48`}>
            {c.formatted_number && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Image
                    src={`${CONFIG.blob_url}/whatsapp.png`}
                    alt=""
                    width={60}
                    height={60}
                    className="w-4 cursor-pointer rounded-sm hover:scale-105 transition-transform"
                    onClick={() => {}}
                  />
                  <span>{c.formatted_number}</span>
                </div>
              </div>
            )}

            {!c.country_code && c.formatted_number && (
              <span className="font-light text-[8px] text-red-400 -mt-1">
                Falta elegir país del teléfono
              </span>
            )}
            {c.email && (
              <div className="flex items-center gap-2 text-xs mt-[1px]">
                <div className="w-4 ml-[1.2px] mt-[1px]">
                  <Mail
                    className="w-[0.87rem] text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-muted-foreground font-light">
                  {c.email}
                </span>
              </div>
            )}
          </div>
        )}
        <div className="hidden md:flex md:flex-col md:w-full gap-1">
          {c.last_messages
            ?.filter((lm) => !!lm.template_name)
            .map((lm, index) => (
              <div className="flex flex-col -mt-1.5 gap-0" key={index}>
                <span className="text-[0.65rem] font-normal -mb-2">
                  {lm.template_name}
                </span>
                <div className="flex items-center gap-1">
                  <Image
                    src={`${CONFIG.blob_url}/${lm.sender_email === "info@aquapp.lat" ? "aquabot-WHctK7a6a4myMqIJzaYoNJw7k33jcG" : "thunder-2.png"}`}
                    alt="Logo de Aquabot"
                    width={10}
                    height={10}
                    className={
                      lm.sender_email === "info@aquapp.lat" ? "w-2" : "w-1.5"
                    }
                  />
                  <span className="text-[8px] font-extralight text-muted-foreground block  whitespace-pre">
                    Enviado
                    <span className="text-blue-600 ml-0.5">
                      {format(lm.sent_at, "EE dd MMM HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </span>
                </div>
              </div>
            ))}
        </div>
        {last_services_time && (
          <div className="flex flex-col w-96 items-end gap-3">
            {last_services_time.map((ls) => {
              const time_ago = timeAgo(ls.last_date);
              const is_future = isFuture(ls.last_date);
              return (
                <div
                  className="flex flex-col  text-end justify-end items-end"
                  key={ls._id + ls.vehicle_id}
                >
                  <VehicleDetails vehicle={ls.vehicle} />
                  <span
                    className={`text-violet-600 text-[0.65rem] font-extralight`}
                  >
                    {format(ls.last_date, "EE dd/MM/yyyy", {
                      locale: es,
                    })}
                  </span>
                  <div className="flex items-center gap-1 text-[0.65rem] font-extralight -mt-1">
                    <span className="text-muted-foreground">
                      {is_future ? "En" : "hace"}
                    </span>
                    <span
                      className={`${!is_future ? "text-orange-600" : "text-green-600"} `}
                    >
                      {time_ago.replace("-", "")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isOwner && c.sales?.count > 0 && !last_services_time && (
          <SaleSummaryForRows sales={c.sales} />
        )}
      </div>
    </DropdownRow>
  );
};

export default ClientRow;
