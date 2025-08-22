"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import SubscriptionStatus from "./SubscriptionStatus";
import { toMoney } from "@/helpers/fmt";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import OpenPendingSub from "./OpenPendingSub";
import { useStore } from "@/stores";
import { Separator } from "react-aria-components";

const SubscriptionDetail = ({ dbSub }) => {
  const edit_subscription = useStore((s) => s.edit_subscription);
  const current_store = useStore((s) => s.current_store);
  const messagesMonthLimit = dbSub?.messages.limits.month.max;
  const quotesMonthLimit = dbSub?.quotes.limit.max;
  const filesMonthLimit = dbSub?.files.limit.max;

  const wspAmount = dbSub?.messages?.amount || 0;

  const quoteAmount = dbSub?.quotes?.amount || 0;
  const fileAmount = dbSub?.files?.amount || 0;
  const subAmount = dbSub?.amount || 0;

  const totalSubAmount = subAmount + wspAmount + quoteAmount + fileAmount;

  const SUB_STATUS = {
    pending: {
      bg: "bg-yellow-400",
      text: "Pendiente",
      color: "text-gray-800",
    },
    paused: {
      bg: "bg-gray-300",
      text: "Pausada",
      color: "text-gray-800",
    },
    created: {
      bg: "bg-yellow-400",
      text: "Pendiente",
      color: "text-white-800",
    },
    authorized: {
      bg: "bg-blue-400",
      text: "Activa",
      color: "text-white",
    },
    ACTIVE: { bg: "bg-blue-400", text: "Activa", color: "text-white" },
    cancelled: { bg: "bg-red-400", text: "Cancelada", color: "text-white" },
  };

  const status = SUB_STATUS[dbSub?.status];
  if (edit_subscription || !dbSub) return <></>;

  const currencySymbol = current_store?.country_code === "AR" ? "$" : "USD";

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-auto border-0 overflow-auto"
    >
      <CardHeader className="pb-8 font-bold text-lg sm:text-xl px-4 sm:px-6">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <CardTitle className=" sm:max-w-full">
              Suscripción mensual
            </CardTitle>
            <SubscriptionStatus status={status} dbSub={dbSub} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {!!dbSub && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2">
                <Image
                  src={`${CONFIG.blob_url}/logo.png`}
                  alt="Logo de Aquapp"
                  width={34}
                  height={34}
                  className="mr-0.5 -ml-0.5 w-8 h-8.5"
                />
                <div className="flex flex-col">
                  <span className="font-normal">Sucursal Aquapp</span>
                  <span className="text-xs text-muted-foreground font-extralight">
                    Todas las funcionalidades
                  </span>
                </div>
              </div>
              <span>{toMoney(subAmount, false, true, currencySymbol)}</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center gap-2">
                <Image
                  src={`${CONFIG.blob_url}/whatsapp.png`}
                  alt="Logo de Aquapp"
                  width={30}
                  height={30}
                  className="mr-1 w-7 h-7"
                />
                <div className="flex flex-col">
                  <span className="font-normal">Mensajes instantáneos</span>
                  <span className="text-xs text-muted-foreground font-extralight">
                    {messagesMonthLimit} mensajes al mes
                  </span>
                </div>
              </div>
              <span>{toMoney(wspAmount, false, true, currencySymbol)}</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center gap-2">
                <Image
                  src={`${CONFIG.blob_url}/pdf2.png`}
                  alt="Logo de PDF"
                  width={30}
                  height={30}
                  className="mr-1 w-7 h-7"
                />
                <div className="flex flex-col">
                  <span className="font-normal">Cotizaciones en PDF</span>
                  <span className="text-xs text-muted-foreground font-extralight">
                    {quotesMonthLimit} documentos al mes
                  </span>
                </div>
              </div>
              <span>{toMoney(quoteAmount, false, true, currencySymbol)}</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center gap-2">
                <Image
                  src={`${CONFIG.blob_url}/attachment.png`}
                  alt="Logo de PDF"
                  width={30}
                  height={30}
                  className="mr-1 w-7 h-7"
                />
                <div className="flex flex-col">
                  <span className="font-normal">Archivos adjuntos</span>
                  <span className="text-xs text-muted-foreground font-extralight">
                    {filesMonthLimit} archivos al mes
                  </span>
                </div>
              </div>
              <span>{toMoney(fileAmount, false, true, currencySymbol)}</span>
            </div>
            <Separator />
            <div className="flex justify-between w-full items-start mt-2">
              <div className="flex items-start gap-2 font-bold text-lg sm:text-xl">
                <span>Total al mes</span>
              </div>
              <div className="flex flex-col items-end justify-end font-bold text-lg sm:text-xl">
                <span>
                  {toMoney(totalSubAmount, false, true, currencySymbol)}
                </span>
              </div>
            </div>
            {["pending", "created"].includes(dbSub.status) &&
              dbSub.details?.init_point && (
                <OpenPendingSub url={dbSub.details?.init_point} />
              )}
          </div>
        )}
        {!dbSub && (
          <div className="flex flex-col items-center justify-center gap-2 w-full mb-2">
            <span className="text-muted-foreground text-xs font-extralight text-center">
              Aún no has contratado ninguna suscripción
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetail;
