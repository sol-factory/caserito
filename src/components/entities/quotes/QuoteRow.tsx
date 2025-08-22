"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { CONFIG } from "@/config/constanst";
import { timeAgo } from "@/helpers/date";
import { toMoney } from "@/helpers/fmt";
import { capitalizeFirstLetter, toProperCase, toSlug } from "@/helpers/text";
import usePermissions from "@/hooks/use-permissions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  CircleDollarSign,
  Clock,
  FilePlus2,
  IdCard,
  MessageCircle,
  Send,
} from "lucide-react";
import Image from "next/image";
import ClientName from "../clients/ClientName";
import MyInfoTooltip from "@/components/custom-ui/MyInfoTooltip";
import useFlags from "@/hooks/use-falgs";
import AttachmentsCounter from "../attachments/AttachmentsCounter";

const QuoteRow = ({
  q,
  isLastOne,
  isOwner,
  companyName,
  colorAllowed = false,
}) => {
  const { can_view_amount_quote } = usePermissions();
  const { getFlag, country } = useFlags();
  const discountsAmount = q.discounts_amount || 0;
  const quoteNetAmount = q.amount - discountsAmount;
  const usdDiscountsAmount = q.usd_discounts_amount || 0;
  const quoteUsdNetAmount = q.usd_amount - usdDiscountsAmount;

  const quote_date = new Date(
    q.full_date?.year,
    q.full_date?.month - 1,
    q.full_date?.day,
    q.full_date?.hour || new Date(q.date).getHours(),
    q.full_date?.minute || new Date(q.date).getMinutes()
  );

  let pick_up_date;

  if (!!q.full_pick_up_date?.year) {
    pick_up_date = new Date(
      q.full_pick_up_date?.year,
      q.full_pick_up_date?.month - 1,
      q.full_pick_up_date?.day,
      q.full_pick_up_date?.hour || new Date(q.pick_up_date).getHours(),
      q.full_pick_up_date?.minute || new Date(q.pick_up_date).getMinutes()
    );
  }

  const isCurrentYear = quote_date?.getFullYear() === new Date().getFullYear();

  const additionalItems = [
    colorAllowed, // puede indicar color
    !q.sold || !q.sent, // puede enviar o iniciar venta
    isOwner && !q.sent, // puede eliminar
    !!q.client?.phone, // hay templates para enviar mensajes
  ].reduce((prev, curr) => prev + +curr, 0);

  const rowItemsCount = 3 + additionalItems;

  return (
    <DropdownRow
      item={q}
      entity="quote"
      isLastOne={isLastOne}
      companyName={companyName}
      colorAllowed={colorAllowed}
      rowItemsCount={rowItemsCount}
      style={{
        borderLeft: colorAllowed && q.color ? `2px solid ${q.color}` : "",
        paddingLeft: colorAllowed && q.color ? "0.5rem" : "",
        borderTopLeftRadius: colorAllowed && q.color ? "0.2rem" : "",
        borderBottomLeftRadius: colorAllowed && q.color ? "0.2rem" : "",
      }}
      className={`${q.taken_away ? "bg-gray-100" : q.finished ? "bg-green-50" : ""}`}
    >
      <div
        key={q._id}
        className={`flex items-start ${colorAllowed ? "py-2" : "py-3"} cursor-pointer border-b-violet-50 text-sm relative`}
      >
        <div className="w-48">
          <div className="flex flex-col">
            <ClientName client={q.client} />
            <div className="md:hidden w-40 text-xs flex flex-col mb-1">
              <div className="flex items-center gap-1">
                <Image
                  src={`${CONFIG.blob_url}/brands/${toSlug(q.vehicle.brand)}.png`}
                  width={18}
                  height={18}
                  alt="Image"
                />

                <span className="font-normal">{q.vehicle.model}</span>
                <span className="font-normal text-blue-600">
                  {q.vehicle.patent.toUpperCase()}
                </span>
              </div>
              {q.vehicle.insurance_id && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Image
                    src={`${CONFIG.blob_url}/institutions/${toSlug(q.vehicle.insurance_id)}.png`}
                    width={18}
                    height={18}
                    alt="Image"
                  />

                  <span className={`font-normal`}>
                    {q.vehicle.insurance_name}
                  </span>
                </div>
              )}
            </div>
            {q.client.address && (
              <span className="text-blue-600 text-xs font-extralight">
                {q.client.address}
              </span>
            )}
            <div
              className="flex items-center gap-2 text-blue-600"
              title="Fecha y hora de creación"
            >
              <div className="flex items-center gap-1.5">
                <FilePlus2 size={12} strokeWidth={1} className="w-3.5 h-3.5" />

                <span className=" text-[0.7rem] text-gray-600 font-extralight text-nowrap">
                  {format(
                    quote_date,
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
                  {format(quote_date, "H:mm", { locale: es })}
                </span>
              </div>
            </div>

            {q.sent && (
              <div
                className="flex items-center gap-2 text-orange-600"
                title="Fecha y hora de envío al cliente"
              >
                <div className="flex items-center gap-2">
                  <Send size={12} strokeWidth={1} className="w-3 h-3" />

                  <span className=" text-[0.7rem] text-gray-600 font-extralight text-nowrap">
                    {format(
                      q.sent_at,
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
                    {format(q.sent_at, "H:mm", { locale: es })}
                  </span>
                </div>
              </div>
            )}
            {q.sent && !q.sold && (
              <span className="font-extralight text-muted-foreground text-[0.6rem] -mt-1 inline-block">
                Enviado hace{" "}
                <span className="text-orange-600">{timeAgo(q.sent_at)}</span>
              </span>
            )}
            {q.sold && (
              <div
                className="flex items-center gap-2 text-green-600"
                title="Fecha y hora de conversión a venta"
              >
                <div className="flex items-center gap-1.5">
                  <CircleDollarSign
                    size={12}
                    strokeWidth={1}
                    className="w-3.5 h-3.5"
                  />

                  <span className=" text-[0.7rem] text-gray-600 font-extralight text-nowrap">
                    {format(q.sold_at, "EE d/MM", {
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
                    {format(q.sold_at, "H:mm", { locale: es })}
                  </span>
                </div>
              </div>
            )}
            <AttachmentsCounter
              count={q.attachments_count}
              className="mt-[3px]"
            />
          </div>
        </div>
        <div className="sm:w-40 hidden md:flex md:flex-col">
          <div className="flex items-center gap-1">
            <Image
              src={`${CONFIG.blob_url}/brands/${toSlug(q.vehicle.brand)}.png`}
              width={18}
              height={18}
              alt="Image"
            />

            <span className="font-medium ">{q.vehicle.model}</span>
          </div>
          {q.vehicle.patent && (
            <div className="flex items-center gap-1">
              <IdCard className="w-[1.1rem] h-[1.1rem]" strokeWidth={0.8} />
              <span className="font-extralight text-blue-600">
                {q.vehicle.patent.toUpperCase()}
              </span>
            </div>
          )}
          {q.vehicle.insurance_id && (
            <div className="flex items-center gap-1 mt-0.5">
              <Image
                src={`${CONFIG.blob_url}/institutions/${toSlug(q.vehicle.insurance_id)}.png`}
                width={18}
                height={18}
                alt="Image"
              />

              <span className={`font-normal`}>{q.vehicle.insurance_name}</span>
            </div>
          )}
        </div>
        <div className="w-full sm:w-48">
          {can_view_amount_quote && (
            <div className="flex flex-col items-end sm:items-center">
              <div className="flex flex-col items-end gap-2 relative">
                {quoteNetAmount > 0 && (
                  <div className="flex items-center gap-1">
                    {country?.code === "AR" && <span>{getFlag()}</span>}
                    <span>{toMoney(quoteNetAmount)}</span>
                  </div>
                )}
                {quoteUsdNetAmount > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{getFlag("usd")}</span>
                    <span>{toMoney(quoteUsdNetAmount)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-[3px]">
                {q.discounts?.length > 0 && (
                  <div title={toMoney(discountsAmount)}>
                    <Image
                      src={`${CONFIG.blob_url}/discount.png`}
                      alt="Logo de descuento"
                      width={14}
                      height={14}
                    />
                  </div>
                )}
                {q.comments?.length > 0 && (
                  <div className="flex items-center gap-[2px]">
                    <MessageCircle
                      className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                      strokeWidth={1}
                    />
                    <span className="text-[11px] font-light">
                      {q.commentq.length}
                    </span>
                  </div>
                )}
                {q.messages_count > 0 && (
                  <div
                    className="flex items-center gap-[2px]"
                    title={`${q.messages_count} mensajes enviados`}
                  >
                    <Image
                      src={`${CONFIG.blob_url}/whatsapp.png`}
                      alt="Mensajes enviados"
                      width={14}
                      height={14}
                    />
                    <span className="text-[11px] font-light">
                      {q.messages_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="gap-1 hidden w-48  sm:flex sm:flex-col">
          {q.services.map((s, index) => (
            <div key={s._id + index} className="flex items-center gap-2">
              <div>
                <Bell className="w-4 h-4" strokeWidth={1} />{" "}
              </div>
              <span className="text-nowrap truncate max-w-40" translate="no">
                {capitalizeFirstLetter(s.name)}{" "}
                {s.allow_quantity && (
                  <span className="text-blue-600 font-light text-xs ml-1">
                    ({s.quantity})
                  </span>
                )}
              </span>
              {s.description && (
                <MyInfoTooltip
                  text={`Detalle`}
                  id={`${s._id}-tooltip-${q._id}-${index}`}
                  className="py-2"
                >
                  {s.description}
                </MyInfoTooltip>
              )}
            </div>
          ))}
        </div>
      </div>
    </DropdownRow>
  );
};

export default QuoteRow;
