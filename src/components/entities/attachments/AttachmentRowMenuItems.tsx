"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getFileTypeActionText } from "@/helpers/images";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { ArrowUpRight, Download, Ear } from "lucide-react";

const AttachmentRowMenuItems = ({ a }) => {
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);
  const sale_id = useStore((s) => s.sale._id);

  const actionText = getFileTypeActionText(a.mimetype);
  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();
          window.open(a.blob_url, "_blank");
        }}
      >
        {actionText === "Abrir" ? (
          <ArrowUpRight size={21} />
        ) : actionText === "Escuchar" ? (
          <Ear size={21} />
        ) : (
          <Download size={21} />
        )}
        {actionText}
      </DropdownMenuItem>

      {isOwner && (
        <>
          <div
            className="p-2 hover:bg-gray-100 rounded-sm !cursor-pointer flex gap-3"
            key={a._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", a._id);
              update("deletion_entity", "attachment");
              update("openSecondaryDialog", "delete");
              update("deletion_query_refetch", ["attachments", sale_id]);
            }}
          >
            <DeleteIcon text="Eliminar" className="w-full text-base" />
          </div>
        </>
      )}
    </>
  );
};

export default AttachmentRowMenuItems;
