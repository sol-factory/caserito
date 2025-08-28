"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { CONFIG } from "@/config/constanst";
import { canFinish, canReactivate } from "@/helpers/permissions";
import { getMenuItemsCount } from "@/helpers/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, LogIn, LogOut, MessageCircle, Paperclip } from "lucide-react";
import Image from "next/image";
import usePermissions from "@/hooks/use-permissions";
import { SaleProgressBar } from "./SaleProgressBar";

const SaleRow = ({
  s,
  isLastOne,
  companyName,
  pickUpDateAllowed,
  trackServicesTime = false,
  colorAllowed = false,
  multiCurrency = false,
}) => {
  const { isOwner, isManager } = usePermissions();

  const sale_date = new Date(
    s.full_date?.year,
    s.full_date?.month - 1,
    s.full_date?.day,
    s.full_date?.hour || new Date(s.date).getHours(),
    s.full_date?.minute || new Date(s.date).getMinutes()
  );

  let pick_up_date;

  if (!!s.full_pick_up_date?.year) {
    pick_up_date = new Date(
      s.full_pick_up_date?.year,
      s.full_pick_up_date?.month - 1,
      s.full_pick_up_date?.day,
      s.full_pick_up_date?.hour || new Date(s.pick_up_date).getHours(),
      s.full_pick_up_date?.minute || new Date(s.pick_up_date).getMinutes()
    );
  }

  const isCurrentYear = sale_date?.getFullYear() === new Date().getFullYear();

  const rowItemsCount =
    getMenuItemsCount([
      colorAllowed,
      canReactivate(s, isOwner, isManager),
      !s.taken_away,
      canFinish(s),
    ]) + 1;

  return (
    <DropdownRow
      item={s}
      entity="sale"
      isLastOne={isLastOne}
      companyName={companyName}
      colorAllowed={colorAllowed}
      rowItemsCount={rowItemsCount}
    >
      <div
        key={s._id}
        className={`flex items-start ${colorAllowed ? "py-2" : "py-3"} cursor-pointer border-b-violet-50 text-sm`}
      >
        <div className="w-48">
          <div className="flex flex-col">
            <span
              className={`${s.category.name === "VENTA" ? "text-blue-600" : "text-red-600"} font-bold`}
            >
              {s.sub_category.name}
            </span>
            <span className="text-muted-foreground text-xs font-light">
              {s.category.name}
            </span>

            <div className="flex items-center gap-2 text-blue-600">
              <div
                className="flex items-center gap-1.5"
                title="Fecha y hora de ingreso del vehículo"
              >
                <LogIn
                  size={12}
                  strokeWidth={1}
                  className="w-3.5 h-3.5 scale-x-[-1]"
                />

                <span className=" text-[0.7rem] text-gray-600 font-extralight text-nowrap">
                  {format(sale_date, isCurrentYear ? "EE d/MM" : "EE d/MM/yy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Clock
                  size={12}
                  strokeWidth={1}
                  className="w-[0.68rem] h-[0.68rem]"
                />
                <span className=" text-[0.7rem] font-extralight">
                  {format(sale_date, "H:mm", { locale: es })}
                </span>
              </div>
            </div>
            {pick_up_date && pickUpDateAllowed && (
              <div
                className="flex items-center gap-2 text-red-600 -mt-1"
                title="Fecha y hora de retiro del vehículo"
              >
                <div className="flex items-center gap-1.5">
                  <LogOut size={12} strokeWidth={1} className="w-3.5 h-3.5" />
                  <span className=" text-[0.7rem] text-gray-600 font-extralight text-nowrap">
                    {format(
                      pick_up_date,
                      isCurrentYear ? "EE d/MM" : "EE d/MM/yy",
                      {
                        locale: es,
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Clock
                    size={12}
                    strokeWidth={1}
                    className="w-[0.68rem] h-[0.68rem]"
                  />
                  <span className=" text-[0.7rem] font-extralight">
                    {format(pick_up_date, "H:mm", { locale: es })}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 mt-[3px]">
              {s.comments?.length > 0 && (
                <div className="flex items-center gap-[2px]">
                  <MessageCircle
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                    strokeWidth={1}
                  />
                  <span className="text-[11px] font-light">
                    {s.comments.length}
                  </span>
                </div>
              )}
              {s.messages_count > 0 && (
                <div
                  className="flex items-center gap-[2px]"
                  title={`${s.messages_count} mensajes enviados`}
                >
                  <Image
                    src={`${CONFIG.blob_url}/whatsapp.png`}
                    alt="Mensajes enviados"
                    width={14}
                    height={14}
                  />
                  <span className="text-[11px] font-light">
                    {s.messages_count}
                  </span>
                </div>
              )}
              {s.attachments_count > 0 && (
                <div
                  className="flex items-center gap-[2px]"
                  title={`${s.attachments_count} archivos adjuntos`}
                >
                  <Paperclip
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                    strokeWidth={1}
                  />
                  <span className="text-[11px] font-light">
                    {s.attachments_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full sm:w-48 sm:pr-16">
          <div className="flex flex-col items-end">
            <SaleProgressBar
              s={s}
              currency="ars"
              showAmount
              className="flex-col gap-0 mb-3 items-end"
            />
          </div>
        </div>
        {s.detail && (
          <div className="flex flex-col ml-3">
            <span className="font-bold underline">Aclaraciones</span>
            <span className="text-muted-foreground font-light">{s.detail}</span>
          </div>
        )}
      </div>
    </DropdownRow>
  );
};

export default SaleRow;
