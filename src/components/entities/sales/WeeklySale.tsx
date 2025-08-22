import DropdownRow from "@/components/custom-ui/DropdownRow";
import { Card } from "@/components/ui/card";
import { canFinish, canReactivate } from "@/helpers/permissions";
import { capitalizeFirstLetter, toProperCase, toSlug } from "@/helpers/text";
import { getMenuItemsCount } from "@/helpers/ui";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import React from "react";
import SaleAddress from "./SaleAddress";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import Workers from "./Workers";
import { Progress } from "@/components/ui/progress";
import { toMoney } from "@/helpers/fmt";
import { LogIn, MessageCircle, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ClientName from "../clients/ClientName";
import MyInfoTooltip from "@/components/custom-ui/MyInfoTooltip";
import useFlags from "@/hooks/use-falgs";
import { SaleProgressBar } from "./SaleProgressBar";

const WeeklySale = ({
  s,
  companyName,
  isStayingCar = false,
  isLeaving = false,
  day,
}) => {
  const { isOwner, isManager } = usePermissions();
  const store = useStore((s) => s.current_store);
  const hover_id = useStore((s) => s.hover_id);

  const rowItemsCount = getMenuItemsCount([
    store?.allow_sale_color,
    !s.taken_away,
    canReactivate(s, isOwner, isManager),
    canFinish(s),
  ]);

  if (isStayingCar) {
    return <SaleCard s={s} isStayingCar isLeaving={isLeaving} day={day} />;
  }

  const shineColor =
    hover_id === s._id && store.show_permanence ? "bg-blue-100" : "";

  return (
    <DropdownRow
      item={s}
      entity="sale"
      rowItemsCount={rowItemsCount}
      companyName={companyName}
      colorAllowed={store?.allow_sale_color}
      key={s._id}
      isLastOne
      className={`!px-0 py-0.5`}
    >
      <SaleCard s={s} shineColor={shineColor} />
    </DropdownRow>
  );
};

const SaleCard = ({
  s,
  isStayingCar = false,
  isLeaving = false,
  shineColor = "",
  day = null,
}) => {
  const { isOwner, isManager } = usePermissions();
  const store = useStore((s) => s.current_store);
  const update = useStore((s) => s.update);
  const hover_id = useStore((s) => s.hover_id);

  const sale_date = new Date(
    s.full_date?.year,
    s.full_date.month - 1,
    s.full_date.day,
    s.full_date.hour || new Date(s.date).getHours(),
    s.full_date.minute || new Date(s.date).getMinutes()
  );
  const pick_up_date = s.pick_up_date
    ? new Date(
        s.full_pick_up_date?.year,
        s.full_pick_up_date.month - 1,
        s.full_pick_up_date.day,
        s.full_pick_up_date.hour || new Date(s.pick_up_date).getHours(),
        s.full_pick_up_date.minute || new Date(s.pick_up_date).getMinutes()
      )
    : null;

  const shine =
    ((hover_id === s._id && isStayingCar) || shineColor) &&
    store?.show_permanence &&
    !!s.pick_up_date;
  const finalShineColor = shineColor
    ? shineColor
    : isLeaving
      ? "bg-red-100"
      : "bg-yellow-100";

  return (
    <div
      className={`flex flex-col justify-start mx-auto  gap-1 w-28 min-w-20 ${isStayingCar ? "hover:!bg-none opacity-30 py-0.5" : ""} ${shine && !shineColor ? `!opacity-45` : ""}`}
      key={s._id}
      onMouseEnter={() => update("hover_id", s._id)}
      onMouseLeave={() => update("hover_id", "")}
    >
      <Card
        style={{
          borderLeft:
            store?.allow_sale_color && s.color ? `2px solid ${s.color}` : "",
          paddingLeft: store?.allow_sale_color && s.color ? "0.5rem" : "",
        }}
        className={`flex flex-col overflow-visible text-[0.7rem] px-1.5 py-1.5 ${s.taken_away ? "bg-gray-100" : s.finished ? "bg-green-50" : ""} ${shine ? finalShineColor : ""}`}
      >
        <ClientName
          client={s.client}
          gap="gap-1"
          nameHeight="4"
          textClassName="truncate max-w-16"
        />

        <div className="flex items-start flex-col mt-2">
          <SaleProgressBar
            s={s}
            currency={store?.currency}
            showFlags={store?.allow_multi_currency}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2 ml-0.5">
          {s.comments.length > 0 && (
            <div className="flex items-center gap-0.5">
              <MessageCircle className="w-3 h-3" strokeWidth={1} />
              <span className="text-[0.65rem] font-light text-muted-foreground mt-[0.1rem]">
                {s.comments.length}
              </span>
            </div>
          )}
          {s.messages_count > 0 && (
            <div className="flex items-center gap-0.5">
              <Image
                src={`${CONFIG.blob_url}/whatsapp.png`}
                alt="Mensajes enviados"
                width={12}
                height={12}
              />
              <span className="text-[0.65rem] font-light text-muted-foreground mt-[0.1rem]">
                {s.messages_count}{" "}
              </span>
            </div>
          )}
          {s.attachments_count > 0 && (
            <div
              className="flex items-center gap-0.5"
              title={`${s.attachments_count} archivos adjuntos`}
            >
              <Paperclip className="w-3 h-3" strokeWidth={1} />
              <span className="text-[0.65rem] font-light text-muted-foreground mt-[0.1rem]">
                {s.attachments_count}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-end justify-between w-full mt-2 text-[0.55rem]">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div
                className="flex items-center gap-0.5"
                title="Fecha y hora de ingreso del vehículo"
              >
                <LogIn
                  size={12}
                  strokeWidth={1}
                  className="w-2.5 h-2.5 scale-x-[-1] text-blue-600"
                />

                <span className="  text-gray-600 font-extralight text-nowrap">
                  {format(sale_date, isStayingCar ? "d MMM HH:mm" : "H:mm", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>
            {pick_up_date && (
              <div
                className="flex items-center gap-0.5"
                title="Fecha y hora de egreso del vehículo"
              >
                <LogIn
                  size={12}
                  strokeWidth={1}
                  className="w-2.5 h-2.5 text-red-600"
                />

                <span className="  text-gray-600 font-extralight text-nowrap">
                  {format(pick_up_date, "d MMM H:mm", {
                    locale: es,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeeklySale;
