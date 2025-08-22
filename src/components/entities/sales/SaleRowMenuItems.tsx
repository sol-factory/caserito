"use client";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CONFIG } from "@/config/constanst";
import { notify } from "@/helpers/notify";
import { useStore } from "@/stores";
import {
  CheckCircle,
  Eye,
  History,
  MessageCircle,
  Palette,
  Paperclip,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import TemplatesMenuItems from "../templates/TemplatesMenuItems";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { getFullDate } from "@/helpers/date";
import api from "@/helpers/api";
import { startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { canFinish, canReactivate, canTakeAway } from "@/helpers/permissions";
import { createQueryString } from "@/helpers/url";
import useFlags from "@/hooks/use-falgs";
import usePermissions from "@/hooks/use-permissions";
import AttachmentRowMenuItems from "../attachments/AttachmentRowMenuItems";
import AttachmentsDropdownItem from "../attachments/AttachmentsDropdownItem";
import CommentsDropdownItem from "../comments/CommentsDropdownItem";

const SaleRowMenuItems = ({
  s,
  companyName,
  isOwner,
  isManager,
  colorAllowed,
}) => {
  const { isDeveloper } = usePermissions();
  const update = useStore((s) => s.update);
  const { getFlag } = useFlags();
  const logged_user = useStore((s) => s.logged_user);
  const current_store = useStore((s) => s.current_store);
  const router = useRouter();
  const pathname = usePathname();

  const handleColorClick = async (e, color) => {
    e.stopPropagation();
    const result = await api(
      { data: { _id: s._id, color, alreadySelected: s.color === color } },
      "sale",
      "setColor"
    );
    notify(result);
  };

  const { day, month, year } = getFullDate(new Date());

  const todayOrFutureSale = s.date > startOfDay(new Date());

  const isCreator = s.creator_id === logged_user._id;

  const isMultiCurrency =
    s.usd_amount > 0 || current_store?.allow_multi_currency;

  const handleCancellingClick = (e, cancelling) => {
    e.stopPropagation();
    update("creating", true);
    update("openDialog", "cashflow");
    update("openDialogIndex", 0);
    update("cashflow", {
      date: null,
      wallet: {},
      amount: "",
      isMultiCurrency,
      sale_id: s._id,
      sale_date: s.date,
      cancelling,
      exchange_rate: current_store.usd_exchange_rate || 1,
      sale_created_date: s.createdAt,
      canUpdate: isOwner || !s.finished,
      canCreate: isOwner || todayOrFutureSale,
    });
    update("sale", s);
  };

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();
          update("creating", false);
          update("openDialog", "sale");
          update("openDialogIndex", 0);
          update("sale", {
            ...s,
            workers: s.workers || [],
            quote_id: s.quote_id || "",
            quote_identifier: s.quote_identifier || "",
            date: new Date(
              s.full_date.year,
              s.full_date.month - 1,
              s.full_date.day,
              s.full_date.hour || new Date(s.date).getHours(),
              s.full_date.minute || new Date(s.date).getMinutes()
            ),
            pick_up_date: s.full_pick_up_date?.year
              ? new Date(
                  s.full_pick_up_date.year,
                  s.full_pick_up_date.month - 1,
                  s.full_pick_up_date.day,
                  s.full_pick_up_date.hour || new Date(s.date).getHours(),
                  s.full_pick_up_date.minute || new Date(s.date).getMinutes()
                )
              : undefined,
            canUpdate: !s.finished && (isOwner || isManager || isCreator),
          });
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {!isMultiCurrency && (
        <DropdownMenuItem
          className="flex gap-4 cursor-pointer w-auto"
          onClick={(e) => handleCancellingClick(e, current_store.currency)}
        >
          <Image
            src={`${CONFIG.blob_url}/payment.png`}
            alt="Logo de Whatsapp"
            width={18}
            height={18}
          />
          Cobros recibidos
        </DropdownMenuItem>
      )}
      {isMultiCurrency && (
        <>
          <div
            className="flex items-center px-2  text-sm gap-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`${CONFIG.blob_url}/payment.png`}
              alt="Logo de Whatsapp"
              width={18}
              height={18}
              className="w-4.5 h-4.5"
            />
            <div className="flex flex-col w-full -ml-2">
              {s.amount > 0 && (
                <div
                  className="hover:bg-accent cursor-pointer px-2 rounded-sm py-1"
                  onClick={(e) =>
                    handleCancellingClick(e, current_store.currency)
                  }
                >
                  Cobros deuda en {getFlag()}
                </div>
              )}
              {s.usd_amount > 0 && (
                <div
                  className="hover:bg-accent cursor-pointer px-2 rounded-sm py-1"
                  onClick={(e) => handleCancellingClick(e, "usd")}
                >
                  Cobros deuda en 🇺🇸
                </div>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
        </>
      )}

      <CommentsDropdownItem mongoose_model="Sale" model_id={s._id} />
      <AttachmentsDropdownItem mongoose_model="Sale" model_id={s._id} />
      <DropdownMenuSeparator />

      {canFinish(s) && (
        <DropdownMenuItem
          className="flex gap-4 cursor-pointer hover:!bg-gray-100"
          onClick={async (e) => {
            e.stopPropagation();
            const result = await api(
              {
                data: {
                  _id: s._id,
                  finished: true,
                },
              },
              "sale",
              "finish"
            );
            if (result.ok) {
              notify(result);
            }
          }}
        >
          <Image
            src={`${CONFIG.blob_url}/race.png`}
            alt="Logo de Whatsapp"
            width={18}
            height={18}
          />
          <span>Finalizar</span>
        </DropdownMenuItem>
      )}
      {canTakeAway(s) && (
        <>
          <DropdownMenuItem
            className="flex gap-3 cursor-pointer hover:!bg-gray-100 -ml-[0.1rem]"
            onClick={async (e) => {
              e.stopPropagation();
              const result = await api(
                {
                  data: {
                    _id: s._id,
                    takenAway: true,
                  },
                },
                "sale",
                "takenAway"
              );
              if (result.ok) {
                notify(result);
              }
            }}
          >
            <Image
              src={`${CONFIG.blob_url}/keys-6iGprFHBksy8CdBbVEkYbEnYjZd9yr.png`}
              alt="Logo de llaves en mano"
              width={22}
              height={22}
              className="scale-x-[-1]"
            />
            <span>Entregar vehículo</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      {canReactivate(s, isOwner, isManager) && (
        <>
          <DropdownMenuItem
            className="flex gap-4 cursor-pointer hover:!bg-gray-100 -ml-0.5"
            onClick={async (e) => {
              e.stopPropagation();
              const result = await api(
                {
                  data: {
                    _id: s._id,
                    finished: false,
                  },
                },
                "sale",
                "finish"
              );
              if (result.ok) {
                notify({ ok: true, message: "Lavado finalizado" });
              }
            }}
          >
            <Image
              src={`${CONFIG.blob_url}/logo.png`}
              alt="Logo de Whatsapp"
              width={24}
              height={24}
            />
            <span className="-ml-1">Reactivar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}

      {colorAllowed && !s.taken_away && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/washes?client_id=${s.client._id}`);
          }}
        >
          <Palette size={21} strokeWidth={1.5} />
          Color
          <div className="flex items-center gap-1">
            <Badge
              className="bg-red-500 h-5 w-7 !cursor-pointer px-2"
              onClick={(e) => handleColorClick(e, "#ef4444")}
            >
              {s.color === "#ef4444" && <CheckCircle />}
            </Badge>{" "}
            <Badge
              className="bg-blue-500 h-5 w-7 !cursor-pointer px-2"
              onClick={(e) => handleColorClick(e, "#3b82f6")}
            >
              {s.color === "#3b82f6" && <CheckCircle />}
            </Badge>{" "}
            <Badge
              className="bg-green-500 h-5 w-7 !cursor-pointer px-2"
              onClick={(e) => handleColorClick(e, "#22c55e")}
            >
              {s.color === "#22c55e" && <CheckCircle />}
            </Badge>{" "}
          </div>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();
          router.push(
            `/washes?${createQueryString("", ["client_id", "period"], [s.client._id, "last_2_years"], pathname)}`
          );
        }}
      >
        <History size={21} strokeWidth={1.5} />
        Historial cliente
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <TemplatesMenuItems
        c={{
          ...s.client,
          taken_away: s.taken_away,
          vehicle: s.vehicle,
          sale_date: new Date(
            s.full_date.year,
            s.full_date.month - 1,
            s.full_date.day,
            s.full_date.hour || new Date(s.date).getHours(),
            s.full_date.minute || new Date(s.date).getMinutes()
          ),
          pick_up_date: s.full_pick_up_date?.year
            ? new Date(
                s.full_pick_up_date.year,
                s.full_pick_up_date.month - 1,
                s.full_pick_up_date.day,
                s.full_pick_up_date.hour,
                s.full_pick_up_date.minute
              )
            : null,
        }}
        entity="sale"
        screen="Ventas"
        services={s.services}
        discounts={s.discounts}
        gatheredAmount={s.gathered_amount}
        usdGatheredAmount={s.usd_gathered_amount}
        saleAmount={s.amount}
        flag={getFlag()}
        usdSaleAmount={s.usd_amount}
        saleId={s._id}
      />

      {(isOwner ||
        (new Date(s.date) >= new Date(year, month - 1, day) &&
          !s.finished)) && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={s._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", s._id);
              update("deletion_entity", "sale");
              update("openSecondaryDialog", "delete");
            }}
          >
            <DeleteIcon className="w-full text-sm" text="Eliminar" />
          </div>
        </>
      )}
    </>
  );
};

export default SaleRowMenuItems;
