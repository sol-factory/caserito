"use client";

import MyInput from "@/components/custom-ui/MyInput";
import MySlider from "@/components/custom-ui/MySlider";
import { LoadingSpinner } from "@/components/custom-ui/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ENTITIES } from "@/config";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { notify } from "@/helpers/notify";
import { calculatePrices } from "@/helpers/subscription";
import { isValidEmail } from "@/helpers/validations";
import { useStore } from "@/stores";
import Image from "next/image";
import { useEffect } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { Separator } from "@/components/ui/separator";
import TutorialVideo from "../tutorials/TutorialVideo";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { addEvent } from "@/helpers/api";

export default function SubscriptionForm({ dbSub }) {
  const update = useStore((s) => s.update);
  const subscription = useStore((s) => s.subscription) as any;
  const edit_subscription = useStore((s) => s.edit_subscription);
  const current_store = useStore((s) => s.current_store);
  const loading = useStore((s) => s.loading);
  const router = useRouter();
  const country = current_store?.country_code;
  const currency = country === "AR" ? "ars" : "usd";
  const isMP = currency === "ars";
  const provider_logo = isMP ? "mp.webp" : "paypal-logo.png";

  const messagesLimit = subscription?.messages;
  const quotesLimit = subscription?.quotes;
  const filesLimit = subscription?.files || 0;

  const handleBuySub = async () => {
    try {
      update("loading", "buying-sub");
      const res = await fetch(`/api/subscriptions/${isMP ? "mp" : "paypal"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subscription,
          amount: pricing.aquapp,
          wspAmount,
          quoteAmount,
          fileAmount,
          wspBasePrice: pricing.whatsapp_base,
          quoteBasePrice: pricing.quotes_base,
          fileBasePrice: pricing.files_base,
        }),
      });

      const result = await res.json();
      update("loading", "");
      if (result.ok) {
        if (edit_subscription && subscription.active) {
          notify({ ok: true, message: "Suscripción editada correctamente" });
        } else {
          window.location.href = result.data;
        }
        update("edit_subscription", false);
      } else {
        notify(result);
      }
      router.refresh();
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    update(
      "subscription",
      ENTITIES["subscription"].new(country, current_store?.createdAt)
    );
    return () => {};
  }, [country]);

  if (!!dbSub && !edit_subscription) return <></>;

  const currencySymbol = current_store?.country_code === "AR" ? "$" : "USD";

  const { pricing, quote, whatsapp, file } = calculatePrices({
    whatsappQty: messagesLimit,
    quotesQty: quotesLimit,
    filesQty: filesLimit,
    country,
    createdAt: current_store?.createdAt,
    subscription: dbSub
      ? {
          messages: dbSub?.messages,
          quotes: dbSub?.quotes,
          files: dbSub?.files,
        }
      : null,
  });

  if (!pricing || !whatsapp || !quote || !file)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoadingSpinner />
      </div>
    );

  const wspAmount = whatsapp?.total || 0;
  const quoteAmount = quote?.total || 0;
  const fileAmount = file?.total || 0;
  const subAmount = pricing?.aquapp || 0;

  const totalSubAmount = subAmount + wspAmount + quoteAmount + fileAmount;

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-2 pb-[10rem] sm:pb-0">
      <Card
        x-chunk="dashboard-06-chunk-0"
        className="outline-none max-h-full w-full lg:w-[60%] rounded-none sm:rounded-xl m-0 h-auto border-0 overflow-scroll mt-2 no-scrollbar"
      >
        <CardHeader className="pb-8 font-bold text-lg sm:text-xl px-4 sm:px-6">
          <div className="flex justify-between">
            <CardTitle className=" sm:max-w-full">
              {edit_subscription
                ? "Editar suscripción mensual"
                : "Contratar suscripción mensual"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between w-full">
              <div className="flex items-start gap-2">
                <Image
                  src={`${CONFIG.blob_url}/logo.png`}
                  alt="Logo de Aquapp"
                  width={34}
                  height={34}
                  className="mr-0.5 -ml-0.5 w-8 h-8.5"
                />
                <div className="flex flex-col">
                  <span className="font-normal">Sucursal Aquapp</span>
                  <div className=" flex flex-col gap-0.5 text-[0.7rem] sm:text-xs text-muted-foreground font-extralight">
                    <SubscriptionItem>Ventas, cobros y pagos</SubscriptionItem>
                    <SubscriptionItem>Historial por cliente</SubscriptionItem>
                    <SubscriptionItem>
                      Usuarios por roles (ilimitados)
                    </SubscriptionItem>
                    <SubscriptionItem>Liquidación de sueldos</SubscriptionItem>
                    <SubscriptionItem>Servicios (ilimitados)</SubscriptionItem>
                    <SubscriptionItem>Descuentos (ilimitados)</SubscriptionItem>
                    <SubscriptionItem>
                      Plantillas whatsapp (ilimitadas)
                    </SubscriptionItem>
                    <SubscriptionItem>Billeteras (ilimitadas)</SubscriptionItem>
                    <SubscriptionItem>
                      Informes de ventas y caja
                    </SubscriptionItem>
                    <SubscriptionItem>
                      Whatsapp <u>manuales</u> (ilimitados)
                    </SubscriptionItem>
                    <SubscriptionItem>
                      Whatsapp <u>instantáneos</u> (25)
                    </SubscriptionItem>
                    <SubscriptionItem>Cotizaciones en PDF (5)</SubscriptionItem>
                    <SubscriptionItem>Archivos adjuntos (5)</SubscriptionItem>
                  </div>
                </div>
              </div>
              <span>{toMoney(subAmount, false, true, currencySymbol)}</span>
            </div>
            <div className="flex justify-between w-full items-start mt-2">
              <div className="flex items-start gap-2">
                <Image
                  src={`${CONFIG.blob_url}/whatsapp.png`}
                  alt="Logo de Aquapp"
                  width={30}
                  height={30}
                  className="mr-1 w-7 h-7 mt-0.5"
                />
                <div className="flex flex-col">
                  <span>Mensajes instantáneos</span>

                  <MySlider
                    form="subscription"
                    field="messages"
                    className="w-36 mt-1"
                    min={CONFIG.subscriptions.whatsapp.minQty}
                    max={CONFIG.subscriptions.whatsapp.maxQty}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end justify-end">
                <span>{toMoney(wspAmount, false, true, currencySymbol)}</span>
                <span className="text-blue-600 text-[0.7rem] sm:text-xs font-extralight ml-2">
                  {messagesLimit}{" "}
                  <span className="text-muted-foreground">al mes</span>
                </span>
                {whatsapp?.discountPercent > 0 && (
                  <span className="text-[0.6rem] text-green-600">
                    Ahorro {whatsapp.discountPercent}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex gap-2">
                <Image
                  src={`${CONFIG.blob_url}/pdf2.png`}
                  alt="Logo de PDF"
                  width={30}
                  height={30}
                  className="mr-1 w-7 h-7 mt-1.5"
                />
                <div className="flex flex-col">
                  <span>Cotizaciones en PDF</span>
                  <MySlider
                    form="subscription"
                    field="quotes"
                    className="w-36 mt-1"
                    min={CONFIG.subscriptions.quote.minQty}
                    max={CONFIG.subscriptions.quote.maxQty}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end justify-end">
                <span>{toMoney(quoteAmount, false, true, currencySymbol)}</span>
                <span className="text-blue-600 text-[0.7rem] sm:text-xs font-extralight ml-2">
                  {quotesLimit}{" "}
                  <span className="text-muted-foreground">al mes</span>
                </span>
                {quote?.discountPercent > 0 && (
                  <span className="text-[0.6rem] text-green-600">
                    Ahorro {quote.discountPercent}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex gap-2">
                <Image
                  src={`${CONFIG.blob_url}/attachment.png`}
                  alt="Imagen de un clip de papel"
                  width={30}
                  height={30}
                  className="mr-1 w-7 h-7 mt-1.5"
                />
                <div className="flex flex-col">
                  <span>Archivos adjuntos</span>
                  <MySlider
                    form="subscription"
                    field="files"
                    className="w-36 mt-1"
                    min={CONFIG.subscriptions.file.minQty}
                    max={CONFIG.subscriptions.file.maxQty}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end justify-end">
                <span>{toMoney(fileAmount, false, true, currencySymbol)}</span>
                <span className="text-blue-600 text-[0.7rem] sm:text-xs font-extralight ml-2">
                  {filesLimit}{" "}
                  <span className="text-muted-foreground">al mes</span>
                </span>
                {file?.discountPercent > 0 && (
                  <span className="text-[0.6rem] text-green-600">
                    Ahorro {file.discountPercent}%
                  </span>
                )}
              </div>
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
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-10 justify-end">
            {!edit_subscription && (
              <MyInput
                entity="subscription"
                field="mp_email"
                placeholder={`Email de ${isMP ? "Mercado Pago" : "PayPal"}...`}
                className="sm:w-72 w-full"
                toLowerCase
                trim
              />
            )}
            <Button
              variant="secondary"
              className="hover:bg-gray-200 sm:w-48 w-full"
              onClick={handleBuySub}
              disabled={
                (!isValidEmail(subscription.mp_email) && !edit_subscription) ||
                loading === "buying-sub"
              }
            >
              {loading === "buying-sub" ? (
                <LoadingSpinner />
              ) : edit_subscription ? (
                "Editar suscripción"
              ) : (
                <>
                  Contratar con{" "}
                  <Image
                    src={`${CONFIG.blob_url}/${provider_logo}`}
                    alt="Avatar"
                    width={isMP ? 75 : 65}
                    height={25}
                    className="overflow-hidden rounded  object-cover"
                  />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row lg:flex-col gap-1 w-full sm:w-[23rem]">
        <Card
          x-chunk="dashboard-06-chunk-0"
          className="outline-none max-h-full w-full rounded-none sm:rounded-xl m-0 h-auto border-0 overflow-auto mt-2"
        >
          <CardHeader className="py-5 font-bold text-lg sm:text-xl px-4 sm:px-6">
            <div className="flex flex-col justify-between">
              <CardTitle className="flex gap-0.5 sm:max-w-full ">
                <Image
                  src={`${CONFIG.blob_url}/whatsapp.png`}
                  alt="Logo de Whatsapp"
                  width={30}
                  height={30}
                  className="mr-1 w-5 h-5"
                />{" "}
                <div>Mensajes instantáneos</div>
              </CardTitle>
              <CardDescription className="font-light text-muted-foreground text-xs mt-2">
                Mejora <u>mucho</u> la comunicación con tus clientes. Enviá
                mensajes muy profesionales sin salir de la app, y en menos de 1
                segundo 🤯.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 -mt-2">
            <ViewToturial videoId="xe1Q-0HPYKg" />
          </CardContent>
        </Card>
        <Card
          x-chunk="dashboard-06-chunk-0"
          className="outline-none max-h-full w-full rounded-none sm:rounded-xl m-0 h-auto border-0 overflow-auto mt-2"
        >
          <CardHeader className="py-5 font-bold text-lg sm:text-xl px-4 sm:px-6">
            <div className="flex flex-col justify-between">
              <CardTitle className="flex  items-center gap-1 sm:max-w-full ">
                <Image
                  src={`${CONFIG.blob_url}/pdf2.png`}
                  alt="Logo de PDF"
                  width={30}
                  height={30}
                  className="mr-1 w-[1rem] h-[1rem] mt-0.5"
                />{" "}
                Cotizaciones en PDF
              </CardTitle>
              <CardDescription className="font-light text-muted-foreground text-xs mt-2">
                Enviá cotizaciones profesionales a tus clientes en muy poco
                tiempo. Conocé cuáles están pendientes y convertí más ventas.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4">
            <ViewToturial videoId="74ESCF0Thqs" />
          </CardContent>
        </Card>
        <Card
          x-chunk="dashboard-06-chunk-0"
          className="outline-none max-h-full w-full rounded-none sm:rounded-xl m-0 h-auto border-0 overflow-auto mt-2"
        >
          <CardHeader className="py-5 font-bold text-lg sm:text-xl px-4 sm:px-6">
            <div className="flex flex-col justify-between">
              <CardTitle className="flex  items-center gap-1 sm:max-w-full ">
                <Image
                  src={`${CONFIG.blob_url}/attachment.png`}
                  alt="Logo de un clip de papel"
                  width={30}
                  height={30}
                  className="mr-1 w-[1rem] h-[1rem] mt-0.5"
                />{" "}
                Archivos adjuntos
              </CardTitle>
              <CardDescription className="font-light text-muted-foreground text-xs mt-2">
                Guardá cualquier tipo de documento a tus ventas, cobros, pagos y
                más. Centralizá la información de tu negocio en 1 solo lugar.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4">
            <ViewToturial videoId="RmG5S0LMQyA" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ViewToturial = ({ videoId }) => {
  const update = useStore((s) => s.update);
  return (
    <div
      className="flex items-center gap-2 group mt-3 cursor-pointer"
      onClick={async () => {
        update("tutorial", { videoId });
        update("openDialog", "tutorial");
        await addEvent(
          navigator.userAgent,
          "aquapp",
          "Click LINK Subscription",
          {
            isTutorial: true,
            tutorial_custom_id: 10,
          }
        );
      }}
    >
      <Image
        src={`${CONFIG.blob_url}/youtube.png`}
        alt="Logo de Youtube"
        className="w-4"
        width={12}
        height={12}
      />{" "}
      <span className="group-hover:underline text-sm">Ver tutorial</span>
    </div>
  );
};
