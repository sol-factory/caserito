"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { copy, pluralize } from "@/helpers/text";
import { differenceInCalendarDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, CircleDollarSign, ScrollText, Shapes } from "lucide-react";
import Image from "next/image";

const CompanyRow = ({ c, isLastOne }) => {
  const daysSinceTrialStart = differenceInCalendarDays(
    new Date(),
    new Date(c.trial_start_date)
  );
  const daysSinceCreation = differenceInCalendarDays(
    new Date(),
    new Date(c.createdAt)
  );
  const daysSinceLastUpdate = differenceInCalendarDays(
    new Date(),
    new Date(c.updatedAt)
  );

  return (
    <DropdownRow item={c} entity="company" isLastOne={isLastOne}>
      <div className={`flex items-center !py-3 cursor-pointer text-sm`}>
        <div className="flex w-60">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              {c.logo_url && (
                <Image
                  src={c.logo_url || "/no-image.svg"}
                  alt="Logo marca"
                  width={30}
                  height={30}
                  className="w-8"
                />
              )}
              <span className="font-bold">{c.name}</span>
            </div>
            {c.origin_event_name && (
              <span className="text-muted-foreground text-[11px] font-extralight -mb-1">
                Origen:
                <span className="text-blue-600 font-normal ml-1">
                  {c.origin_event_name}
                </span>
              </span>
            )}
            <span className="text-muted-foreground text-[11px] font-extralight -mb-1">
              Creada hace{" "}
              <span className="text-blue-600 font-normal">
                {daysSinceCreation}
              </span>{" "}
              {pluralize("día", daysSinceCreation)}
            </span>
            <span className="text-muted-foreground text-[11px] font-extralight -mb-1">
              Restan{" "}
              <span className="text-red-600 font-normal">
                {14 - daysSinceTrialStart}
              </span>{" "}
              {pluralize("día", daysSinceTrialStart)} de prueba
            </span>
            <span className="text-muted-foreground text-[11px] font-extralight">
              Últ. act.{" "}
              <span className="font-normal">
                {format(c.updatedAt, "EE d MMM H:mm", { locale: es })}
              </span>{" "}
              (hace{" "}
              <span className="text-blue-600 font-normal">
                {daysSinceLastUpdate}
              </span>{" "}
              {pluralize("día", daysSinceLastUpdate)})
            </span>
            {c.statistics?.last_interaction && (
              <span className="text-muted-foreground text-orange-600 text-[11px] font-extralight">
                {c.statistics?.last_interaction}
              </span>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={`${CONFIG.blob_url}/countries/${c.country?.toLowerCase()}.png`}
                  alt=""
                  width={20}
                  height={20}
                />

                {(c.whatsapp || c?.phone?.phone) && (
                  <Image
                    src={`${CONFIG.blob_url}/whatsapp.png`}
                    alt=""
                    width={20}
                    height={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://api.whatsapp.com/send/?phone=+${c.whatsapp || c.phone.phone}&text=Hola ${c.name}, `
                      );
                    }}
                  />
                )}
                <span
                  className="text-muted-foreground text-[10px] font-extralight"
                  onClick={(e) => {
                    if (c.lat) {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps?q=${c.lat},${c.lng}`
                      );
                    }
                  }}
                >
                  {c.city} ({c.province})
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-extralight text-sm gap-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Shapes strokeWidth={1} className="w-4" />
              <span className="text-blue-600">
                {c.statistics.classifications}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bell strokeWidth={1} className="w-4" />
              <span className="text-blue-600">{c.statistics.services}</span>
            </div>
            <span className="text-blue-600 text-nowrap">
              ✋🏼 {c.statistics.manual_wsp || 0}
            </span>{" "}
            <span className="text-blue-600 text-nowrap">
              ⚡️ {c.statistics.instant_wsp || 0}
            </span>
            <span className="text-blue-600 text-nowrap">
              🤖 {c.statistics.automatic_wsp || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CircleDollarSign strokeWidth={1} className="w-4" />
            <span className="text-blue-600">{c.statistics.sales}</span>{" "}
            <span className="text-xs mt-[3px]">por</span>{" "}
            <span className="text-green-600">
              {toMoney(c.statistics.sales_amount / 1000, false, false)}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Image
                src={`${CONFIG.blob_url}/pdf2.png?h=as`}
                width={18}
                height={18}
                alt="Image"
                className="w-4"
              />
              <span className="text-blue-600">{c.statistics.quotes || 0}</span>{" "}
              <span className="text-xs mt-[3px]">por</span>{" "}
              <span className="text-green-600">
                {toMoney(c.statistics.quotes_amount || 0 / 1000, false, false)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Image
                src={`${CONFIG.blob_url}/attachment.png?h=as`}
                width={18}
                height={18}
                alt="Image"
                className="w-3.5"
              />
              <span className="text-blue-600">
                {c.statistics.attachments || 0}
              </span>{" "}
            </div>
          </div>
          {Array.isArray(c.statistics.tutorials_clicked) && (
            <div className="flex items-center gap-1">
              <Image
                src={`${CONFIG.blob_url}/youtube.png`}
                alt=""
                width={15}
                height={15}
              />
              <span className="text-blue-600 ml-0.5">
                {c.statistics.tutorials_clicked.join(" - ")}
              </span>{" "}
            </div>
          )}
          <span
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              copy(c.creator_email, "Email");
            }}
          >
            {c.creator_email}
          </span>
          <span className="text-xs">{c.subscription?.status}</span>
          <span
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              copy(c?.phone?.phone || c.whatsapp, "Whatsapp");
            }}
          >
            {c?.phone?.phone || c.whatsapp}
          </span>
        </div>
      </div>
    </DropdownRow>
  );
};

export default CompanyRow;
