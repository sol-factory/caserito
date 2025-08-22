"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { CONFIG } from "@/config/constanst";
import { timeAgo } from "@/helpers/date";
import { canFinish, canReactivate } from "@/helpers/permissions";
import { capitalizeFirstLetter, toSlug } from "@/helpers/text";
import { getMenuItemsCount } from "@/helpers/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  Clock,
  IdCard,
  LogIn,
  LogOut,
  MessageCircle,
  Paperclip,
} from "lucide-react";
import Image from "next/image";
import SaleAddress from "./SaleAddress";
import Workers from "./Workers";
import usePermissions from "@/hooks/use-permissions";
import ClientName from "../clients/ClientName";
import MyInfoTooltip from "@/components/custom-ui/MyInfoTooltip";
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
  const { can_view_amount_sale, isOwner, isManager } = usePermissions();

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
      style={{
        borderLeft: colorAllowed && s.color ? `2px solid ${s.color}` : "",
        paddingLeft: colorAllowed && s.color ? "0.5rem" : "",
        borderTopLeftRadius: colorAllowed && s.color ? "0.2rem" : "",
        borderBottomLeftRadius: colorAllowed && s.color ? "0.2rem" : "",
      }}
      className={`${s.taken_away ? "bg-gray-100" : s.finished ? "bg-green-50" : ""}`}
    >
      <div
        key={s._id}
        className={`flex items-start ${colorAllowed ? "py-2" : "py-3"} cursor-pointer border-b-violet-50 text-sm`}
      >
        <div className="w-48">
          <div className="flex flex-col">
            <ClientName client={s.client} />
            <div className="md:hidden w-40 text-xs flex flex-col mb-1">
              <div className="flex items-center gap-1.5">
                <Image
                  src={`${CONFIG.blob_url}/brands/${toSlug(s.vehicle.brand)}.png`}
                  width={18}
                  height={18}
                  alt="Image"
                />

                <span className={`font-normal`}>{s.vehicle.model}</span>
                <span className="font-normal text-blue-600">
                  {s.vehicle.patent.toUpperCase()}
                </span>
              </div>
              {s.vehicle.insurance_id && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Image
                    src={`${CONFIG.blob_url}/institutions/${toSlug(s.vehicle.insurance_id)}.png`}
                    width={18}
                    height={18}
                    alt="Image"
                  />

                  <span className={`font-normal`}>
                    {s.vehicle.insurance_name}
                  </span>
                </div>
              )}
            </div>
            {s.lat && <SaleAddress s={s} />}
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
            {!s.finished && trackServicesTime && (
              <span className="font-extralight text-muted-foreground text-[0.6rem] -mt-1 inline-block">
                Ingresó hace{" "}
                <span className="text-orange-600">{timeAgo(sale_date)}</span>
              </span>
            )}
            {s.finished && (
              <div className="flex items-center gap-2 text-green-600 -mt-1">
                <div
                  className="flex items-center gap-1.5"
                  title="Fecha y hora de finalización de tratamiento"
                >
                  <Image
                    src={`${CONFIG.blob_url}/race.png`}
                    className="w-[0.65rem] h-[0.65rem] mx-0.5"
                    width={14}
                    height={14}
                    alt="Image"
                  />

                  <span className=" text-[0.7rem] text-gray-600 font-extralight text-nowrap">
                    {format(
                      s.finished_at,
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
                    {format(s.finished_at, "H:mm", { locale: es })}
                  </span>
                </div>
              </div>
            )}
            {s.taken_away && (
              <div className="flex items-center gap-2 text-gray-700 -mt-1">
                <div
                  className="flex items-center gap-1.5"
                  title="Fecha y hora de finalización de tratamiento"
                >
                  <Image
                    src={`${CONFIG.blob_url}/keys-6iGprFHBksy8CdBbVEkYbEnYjZd9yr.png`}
                    className="w-[0.65rem] h-[0.65rem] mx-0.5 scale-x-[-1]"
                    width={14}
                    height={14}
                    alt="Image"
                  />

                  <span className=" text-[0.7rem] text-gray-700 font-extralight text-nowrap">
                    {format(
                      s.taken_away_at,
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
                  <span className=" text-[0.7rem] font-extralight text-gray-700">
                    {format(s.taken_away_at, "H:mm", { locale: es })}
                  </span>
                </div>
              </div>
            )}
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
              {!!s.quote_identifier && (
                <div title={`Presupuesto: ${s.quote_identifier}`}>
                  <Image
                    src={`${CONFIG.blob_url}/pdf2.png`}
                    alt="Logo de pagos extras"
                    width={14}
                    height={14}
                  />
                </div>
              )}

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
        <div className="sm:w-40 hidden md:flex md:flex-col">
          <div className="flex items-center gap-1">
            <Image
              src={`${CONFIG.blob_url}/brands/${toSlug(s.vehicle.brand)}.png`}
              width={18}
              height={18}
              alt="Image"
            />

            <span className="font-medium ">{s.vehicle.model}</span>
          </div>
          {s.vehicle.patent && (
            <div className="flex items-center gap-1 mt-0.5">
              <IdCard className="w-[1.1rem] h-[1.1rem]" strokeWidth={0.8} />
              <span className="font-extralight text-blue-600">
                {s.vehicle.patent.toUpperCase()}
              </span>
            </div>
          )}
          {s.vehicle.insurance_id && (
            <div className="flex items-center gap-1 mt-0.5">
              <Image
                src={`${CONFIG.blob_url}/institutions/${toSlug(s.vehicle.insurance_id)}.png`}
                width={18}
                height={18}
                alt="Image"
              />

              <span className={`font-normal`}>{s.vehicle.insurance_name}</span>
            </div>
          )}
        </div>
        <div className="w-full sm:w-48 sm:pr-16">
          {can_view_amount_sale && (
            <div className="flex flex-col items-end">
              <SaleProgressBar
                s={s}
                currency="ars"
                showFlags={multiCurrency}
                showAmount
                className="flex-col gap-0 mb-3 items-end"
              />
              <SaleProgressBar
                s={s}
                currency="usd"
                showFlags={multiCurrency}
                showAmount
                className="flex-col gap-0 items-end"
              />
            </div>
          )}
        </div>
        <div className="gap-1 hidden w-48  sm:flex sm:flex-col">
          <div>
            {s.services.map((ss) => (
              <div key={ss._id} className="flex items-center gap-2">
                <div>
                  <Bell className="w-4 h-4" strokeWidth={1} />{" "}
                </div>
                <span className="text-nowrap truncate max-w-40" translate="no">
                  {capitalizeFirstLetter(ss.name)}{" "}
                </span>
                {ss.allow_quantity && (
                  <span className="text-blue-600 font-light text-xs ml-1">
                    ({ss.quantity})
                  </span>
                )}
                {ss.description && (
                  <MyInfoTooltip
                    text={`Detalle`}
                    id={`${ss._id}-tooltip-${s._id}`}
                    className="py-2"
                  >
                    {ss.description}
                  </MyInfoTooltip>
                )}
              </div>
            ))}
          </div>
          {(isOwner || isManager) && <Workers workers={s.workers} />}
        </div>
      </div>
    </DropdownRow>
  );
};

export default SaleRow;
