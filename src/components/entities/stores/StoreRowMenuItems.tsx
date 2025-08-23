"use client";

import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CONFIG } from "@/config/constanst";
import api from "@/helpers/api";
import { notify } from "@/helpers/notify";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import {
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  Cog,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

const StoreRowMenuItems = ({ s }) => {
  const { isOwner, isDeveloper } = usePermissions();
  const update = useStore((s) => s.update);
  const router = useRouter();

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={async () => {
          update("store", {
            ...s,
            whatsapp: s.whatsapp?._id
              ? {
                  _id: s.whatsapp._id,
                  name: s.whatsapp.number,
                  pre_name: `${CONFIG.blob_url}/whatsapp.png`,
                }
              : {},
          });
          update("openDialog", "store");
          update("openDialogIndex", 0);
          update("creating", false);
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>
      {isOwner && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => {
            e.stopPropagation();

            update("store", {
              ...s,
              canUpdate: true,
            });
            update("openDialog", "store");
            update("openDialogIndex", 2);
          }}
        >
          <Cog size={21} strokeWidth={1.5} className="min-w-5" />
          Configuración
        </DropdownMenuItem>
      )}
      {isOwner && s.country_code === "AR" && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-96"
          onClick={(e) => {
            e.stopPropagation();

            update("store", {
              ...s,
              canUpdate: true,
            });
            update("openDialog", "store");
            update("openDialogIndex", 3);
          }}
        >
          <ArrowLeftRight size={21} strokeWidth={1.5} className="min-w-5" />
          Tipo de cambio
        </DropdownMenuItem>
      )}
      {isOwner && s.country_code === "AR" && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-96"
          onClick={async (e) => {
            e.stopPropagation();

            const result = await api(
              { store_id: s._id, allow: !s.allow_multi_currency },
              "store",
              "toggleAllowMultipleCurrencies",
              router
            );
            notify(result);
          }}
        >
          {!s.allow_multi_currency ? (
            <CircleCheckBig
              size={21}
              strokeWidth={1.5}
              className="min-w-5 text-green-600"
            />
          ) : (
            <CircleX
              size={21}
              strokeWidth={1.5}
              className="min-w-5 text-red-600"
            />
          )}
          {!s.allow_multi_currency
            ? "Habilitar multimoneda"
            : "Deshabilitar multimoneda"}
        </DropdownMenuItem>
      )}

      {isOwner && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={s._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", s._id);
              update("deletion_entity", "store");
              update("openSecondaryDialog", "delete");
            }}
          >
            <DeleteIcon text="Eliminar" className="w-full" />
          </div>
        </>
      )}
    </>
  );
};

export default StoreRowMenuItems;
