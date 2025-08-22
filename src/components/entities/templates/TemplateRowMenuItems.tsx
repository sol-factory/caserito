"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { Eye } from "lucide-react";
import React from "react";

const TemplateRowMenuItems = ({ t, isOwner }) => {
  const update = useStore((s) => s.update);

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();

          update("template", { ...t, canUpdate: isOwner });
          update("openDialog", "template");
          update("openDialogIndex", 0);
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>

      {isOwner && !t.locked && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={t._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", t._id);
              update("deletion_entity", "template");
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

export default TemplateRowMenuItems;
