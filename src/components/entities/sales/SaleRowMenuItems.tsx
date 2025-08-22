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

const SaleRowMenuItems = ({ s, isOwner, isManager = false }) => {
  const update = useStore((s) => s.update);
  const logged_user = useStore((s) => s.logged_user);
  const current_store = useStore((s) => s.current_store);
  const router = useRouter();
  const pathname = usePathname();

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

      <CommentsDropdownItem mongoose_model="Sale" model_id={s._id} />
      <AttachmentsDropdownItem mongoose_model="Sale" model_id={s._id} />
      <DropdownMenuSeparator />

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
        Historial contraparte
      </DropdownMenuItem>

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
  );
};

export default SaleRowMenuItems;
