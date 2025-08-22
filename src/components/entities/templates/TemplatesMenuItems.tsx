"use client";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CONFIG } from "@/config/constanst";
import api from "@/helpers/api";
import { formatPhoneToSendMessage, validatePhone } from "@/helpers/phones";
import {
  createQuote,
  filterMenuItems,
  parseWhatsappMessage,
} from "@/helpers/ui";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareOff, PhoneMissedIcon } from "lucide-react";
import Image from "next/image";
import SendingMode from "./SendingMode";
import { useStore } from "@/stores";
import { notify } from "@/helpers/notify";
import { differenceInMilliseconds, format } from "date-fns";
import { es } from "date-fns/locale";
import SendingLoader from "./SendingLoader";
import { usePathname, useRouter } from "next/navigation";
import { queryClient } from "@/components/custom-ui/QueryProvider";

const TemplatesMenuItems = ({
  c,
  saleId = null,
  quoteId = null,
  services = [],
  discounts = [],
  gatheredAmount = 0,
  usdGatheredAmount = 0,
  saleAmount = 0,
  usdSaleAmount = 0,
  entity,
  screen,
  flag = null,
  isOwner = null,
  title = "Mensajes predefinidos",
}) => {
  const sendingMode = useStore((s) => s.sendingMode);
  const update = useStore((s) => s.update);
  const current_store = useStore((s) => s.current_store);
  const current_company = useStore((s) => s.current_company);
  const pathname = usePathname();
  const loading = useStore((s) => s.loading);
  const router = useRouter();
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["template", entity, saleId, screen, c._id],
    queryFn: async () => {
      const data = await api(
        { entity, sale_id: saleId, client_id: c._id, screen },
        "template",
        "getItems"
      );
      return data || [];
    },
  });
  const phone: any = validatePhone({
    number: c.phone,
    countryCode: c.country_code,
  });

  const { templates, store } = data || {};

  const hasWhatsappLinked = !!current_store?.whatsapp_number;
  const automatic = sendingMode === "automatic" && hasWhatsappLinked;
  const saleScreen = screen === "Ventas";

  return (
    <>
      <DropdownMenuLabel
        className={`flex justify-between text-xs text-gray-800 font-bold mt-1 ${store?.whatsapp?.number ? "mb-1" : ""}`}
      >
        <div className="flex flex-col">
          <span>{title}</span>

          <div className="flex items-center gap-1">
            <span className="block text-blue-600 text-[0.55rem] font-extralight -mt-[0.14rem]">
              {sendingMode === "hand" ? "Envío manual" : "Envío instantaneo"}
            </span>
          </div>
        </div>{" "}
        <SendingMode />
      </DropdownMenuLabel>

      {!phone.isValid && (
        <div className="flex items-center px-2 pt-2 pb-4 gap-2">
          <div>
            <PhoneMissedIcon className="w-3 h-3 text-red-400" />
          </div>
          <span className="text-muted-foreground font-light text-center text-xs">
            {!c.phone ? "Falta cargar teléfono" : "Teléfono inválido"}
          </span>
        </div>
      )}
      {phone.isValid && templates?.length === 0 && (
        <div className="flex items-center px-2 pt-2 pb-4 gap-2 text-muted-foreground">
          <div>
            <MessageSquareOff className="w-3 h-3 " />
          </div>
          <span className=" text-center font-light text-xs">
            Ningún mensaje predefinido
          </span>
        </div>
      )}
      <div className="max-h-[7rem] no-scrollbar overflow-y-scroll">
        {phone.isValid &&
          templates
            ?.filter((t) => filterMenuItems(screen, c, t))
            .map((t) => {
              const isLoading = loading === t._id;
              return (
                <DropdownMenuItem
                  key={t._id}
                  className={`flex gap-3 cursor-pointer hover:!bg-gray-100 h-9 ${t.sent_at && saleScreen && automatic && store.whatsapp?.number ? "hover:!bg-green-50 bg-green-50 rounded-none cursor-not-allowed" : ""}`}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const message = parseWhatsappMessage(t.content, {
                      clientName: c?.firstname,
                      vehicle: c?.vehicle,
                      storeName: current_store.name,
                      storeAddress: current_store.address,
                      sale_date: c?.sale_date,
                      pick_up_date: c?.pick_up_date,
                      companyName: current_company.name,
                      services,
                      discounts,
                      gatheredAmount,
                      saleAmount,
                      usdGatheredAmount,
                      usdSaleAmount,
                      flag,
                      saleId,
                      isOwner,
                    });
                    if (screen === "Cotizaciones" && !automatic) {
                      if (!store.whatsapp?.number) {
                        notify(
                          {
                            ok: false,
                            message: `Para enviar cotizaciones por Whatsapp vincula tu número desde la pestaña de "Plantillas", o bien descarga el PDF y envíalo manualmente.`,
                          },
                          "top-right",
                          5000
                        );
                      } else {
                        notify(
                          {
                            ok: false,
                            message: `Para enviar cotizaciones por Whatsapp es necesario utilizar el envío automático o descargar el PDF y enviarlo manualmente.`,
                          },
                          "top-right",
                          5000
                        );
                      }
                      return;
                    }

                    if (
                      store.whatsapp?.number &&
                      automatic &&
                      loading !== t._id
                    ) {
                      if (t.sent_at && screen === "Ventas") {
                        notify({
                          ok: false,
                          message: "Ya enviaste este mensaje para esta venta",
                        });
                        return;
                      }
                      update("loading", t._id);
                      const phoneNumber = formatPhoneToSendMessage(phone);

                      let formData;
                      if (entity === "quote" && t.locked) {
                        const pdf = (await createQuote(
                          c,
                          current_company,
                          current_store
                        )) as any;
                        const pdfBlob = pdf.output("blob"); // si usás jsPDF en frontend
                        const pdfFile = new File([pdfBlob], "presupuesto.pdf", {
                          type: "application/pdf",
                        });
                        formData = new FormData();
                        formData.append("pdf", pdfFile);
                      }

                      const startTime = new Date();
                      const result = await api(
                        {
                          template_id: t._id,
                          template_name: t.name,
                          phoneNumber,
                          message,
                          wspNumberId: store?.whatsapp?._id,
                          sale_id: saleId,
                          quote_id: quoteId,
                          pathname,
                          formData,
                          pdfFileName: `Presupuesto ${c.firstname} (${format(new Date(), "dd MMM yyyy", { locale: es })}).pdf`,
                          client_id: [
                            "Ventas",
                            "Clientes",
                            "Cotizaciones",
                          ].includes(screen)
                            ? c._id
                            : null,
                        },
                        "template",
                        "sendMessage"
                      );
                      await refetch();
                      await queryClient.invalidateQueries({
                        queryKey: ["subscription"],
                      });
                      const milliseconds = differenceInMilliseconds(
                        new Date(),
                        startTime
                      );

                      const totalSeconds = ((milliseconds - 200) / 1000)
                        .toFixed(2)
                        .replace(".", ",");
                      if (result.ok) {
                        notify({
                          ok: true,
                          message: `Enviado en ${totalSeconds} segundos`,
                        });
                        await api(
                          {
                            $inc: { "statistics.instant_wsp": 1 },
                            $set: { last_interaction: "Mensaje ⚡️" },
                          },
                          "company",
                          "updateStatistics"
                        );
                      } else {
                        notify(result);
                      }
                      update("loading", "");
                      if (["sale", "client"].includes(entity)) {
                        router.refresh();
                      }
                    } else {
                      window.open(
                        `https://api.whatsapp.com/send/?phone=${
                          c.phone
                        }&text=${encodeURI(message)}`,
                        "_blank"
                      );
                      await api(
                        {
                          $inc: { "statistics.manual_wsp": 1 },
                          $set: { last_interaction: "Mensaje ✋🏼" },
                        },
                        "company",
                        "updateStatistics"
                      );
                    }
                  }}
                >
                  <Image
                    src={`${CONFIG.blob_url}/whatsapp.png`}
                    alt="Logo de Whatsapp"
                    width={22}
                    height={22}
                    className="-ml-[3px]"
                  />
                  <div className="flex flex-col">
                    <span>{t.name}</span>
                    {t.sent_at &&
                      !isLoading &&
                      automatic &&
                      store.whatsapp?.number && (
                        <div className="flex items-center -mt-1.5 gap-1">
                          <Image
                            src={`${CONFIG.blob_url}/${t.sender_email === "info@aquapp.lat" ? "aquabot-WHctK7a6a4myMqIJzaYoNJw7k33jcG" : "thunder-2.png"}`}
                            alt="Logo de Aquabot"
                            width={10}
                            height={10}
                            className={
                              t.sender_email === "info@aquapp.lat"
                                ? "w-2.5"
                                : "w-1.5"
                            }
                          />

                          <span className="text-[8px] font-extralight text-muted-foreground block  whitespace-pre">
                            {screen === "Ventas" ? `Enviado ` : `Último envío `}
                            <span className="text-blue-600">
                              {format(t.sent_at, "EE dd MMM HH:mm", {
                                locale: es,
                              })}
                            </span>
                          </span>
                        </div>
                      )}
                    <SendingLoader isSending={isLoading} tiny />
                  </div>
                </DropdownMenuItem>
              );
            })}
        {phone.isValid &&
          isFetching &&
          (!templates || templates.length === 0) && (
            <div className="flex w-full items-center justify-center h-10">
              <SendingLoader isSending={true} />
            </div>
          )}
      </div>
    </>
  );
};

export default TemplatesMenuItems;
