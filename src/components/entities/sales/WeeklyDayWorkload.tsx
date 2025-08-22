import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CONFIG } from "@/config/constanst";
import { pluralize } from "@/helpers/text";
import { useStore } from "@/stores";
import { format, isFuture, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, CarFront, LogIn, Warehouse } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const WeeklyDayWorkload = ({
  day,
  store,
  daySales,
  dayStayingCars,
  servicesCount,
}) => {
  const [openId, setOpenId] = useState(0);
  const update = useStore((s) => s.update);
  const show_cars = useStore((s) => s.show_cars);
  if (daySales.length === 0 && dayStayingCars.length === 0) return <></>;

  const vehicles: any = groupVehiclesByKindClassification([
    ...daySales,
    ...dayStayingCars,
  ]);

  const opened = openId === day.getDate();

  const totalCars = dayStayingCars.length + daySales.length;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip
        open={opened}
        onOpenChange={(open) => setOpenId(open ? day.getDate() : 0)}
      >
        <TooltipTrigger asChild onClick={() => setOpenId(day.getDate())}>
          <div className="h-4">
            <div className="flex items-center justify-center gap-2">
              {store?.show_permanence && (
                <div className="flex items-center gap-0.5">
                  <CarFront className="w-3 h-3" strokeWidth={1.4} />
                  <span className="text-cyan-600 text-[0.7rem] font-extralight">
                    {daySales.length + dayStayingCars.length}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-0.5">
                <LogIn
                  size={12}
                  className="w-2.5 h-2.5 scale-x-[-1] text-blue-600"
                  strokeWidth={1.4}
                />
                <span className="text-cyan-600 text-[0.7rem] font-extralight">
                  {daySales.length}
                </span>
              </div>
              {daySales.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <Bell className="w-3 h-3" strokeWidth={1.4} />
                  <span className="text-cyan-600 text-[0.7rem] font-extralight">
                    {servicesCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="flex flex-col max-w-60 bg-black py-3 shadow"
          align="start"
        >
          <div className="grid grow space-y-1">
            <p className="text-[13px] text-start font-semibold text-white">
              Resumen <u>{format(day, "EE d MMMM", { locale: es })}</u>
            </p>
            <div className="text-xs max-w-72 font-light select-none text-start text-stone-400">
              {store?.show_permanence && (
                <div className="flex flex-col">
                  <p>
                    {isFuture(day)
                      ? pluralize("Habrá", totalCars, "n")
                      : isToday(day)
                        ? "Hay"
                        : "Ocupación:"}{" "}
                    <span className="text-yellow-200">
                      {dayStayingCars.length + daySales.length}{" "}
                      {pluralize("vehículo", totalCars)}
                    </span>{" "}
                    en el local.
                  </p>
                  <div className="mt-1">
                    {vehicles.map((v, index) => (
                      <div className="flex items-center gap-2" key={index}>
                        <Image
                          src={`${CONFIG.blob_url}/${v.kind_classification_id ? `vehicles/${v.kind_classification_id}` : "image-off"}.png`}
                          width={13}
                          height={13}
                          alt="Image"
                          className="w-3.5 h-auto"
                        />
                        {v.kind}
                        <span className="ml-1 font-normal text-white">
                          {v.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-2">
                {daySales.length > 0 ? (
                  <>
                    {pluralize("Ingresa", daySales.length, "n")}{" "}
                    {daySales.length} {pluralize("vehículo", daySales.length)}{" "}
                    para {pluralize("realizarle", daySales.length)}{" "}
                    {servicesCount} {pluralize("servicio", servicesCount)}.
                  </>
                ) : (
                  "No ingresará ningún vehículo."
                )}
              </div>
              {store?.show_permanence && (
                <div
                  className="flex items-center gap-1 mt-3 !cursor-pointer hover:underline hover:text-white"
                  onClick={() => {
                    update("show_cars", !show_cars);
                  }}
                >
                  <Warehouse strokeWidth={1.2} className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {show_cars ? "Ocultar" : "Ver"} ocupación
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

function groupVehiclesByKindClassification(sales) {
  const counts = {};

  for (const sale of sales) {
    const kindId = sale.vehicle?.kind_classification_id;
    const kind = sale.vehicle?.kind;

    if (!kindId || !kind) continue;

    if (!counts[kindId]) {
      counts[kindId] = {
        kind_classification_id: kindId,
        kind,
        count: 0,
      };
    }

    counts[kindId].count += 1;
  }

  return Object.values(counts);
}

export default WeeklyDayWorkload;
