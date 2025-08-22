"use client";

import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import api from "@/helpers/api";
import { notify } from "@/helpers/notify";
import { useStore } from "@/stores";
import { Cog, Copy, Eye } from "lucide-react";
import React from "react";

const ServiceRowMenuItems = ({ s, isOwner }) => {
  const update = useStore((s) => s.update);

  return (
    <>
      <DropdownMenuItem
        className="flex gap-2 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();

          update("service", {
            ...s,
            detail: s.detail || "",
            quotes_description: s.quotes_description || "",
            canUpdate: isOwner,
          });
          update("openDialogIndex", 0);
          update("openDialog", "service");
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>
      {isOwner && (
        <DropdownMenuItem
          className="flex gap-2 cursor-pointer w-auto"
          onClick={async (e) => {
            e.stopPropagation();
            const result = await api(
              { data: { _id: s._id } },
              "service",
              "duplicate"
            );
            notify(result);
          }}
        >
          <Copy size={21} strokeWidth={1.5} />
          Duplicar servicio
        </DropdownMenuItem>
      )}
      {isOwner && (
        <DropdownMenuItem
          className="flex gap-2 cursor-pointer w-auto"
          onClick={(e) => {
            e.stopPropagation();

            update("service", {
              ...s,
              detail: s.detail || "",
              quotes_description: s.quotes_description || "",
              canUpdate: isOwner,
            });
            update("openDialog", "service");
            update("openDialogIndex", 1);
          }}
        >
          <Cog size={21} strokeWidth={1.5} className="min-w-5" />
          Configuración
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
              update("deletion_entity", "service");
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

export default ServiceRowMenuItems;
