"use client";

import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { Eye } from "lucide-react";

const WalletRowMenuItems = ({ w }) => {
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);

  if (w.name === "Efectivo") return <></>;

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={async () => {
          update("wallet", w);
          update("openDialog", "wallet");
          update("openDialogIndex", 0);
          update("creating", false);
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>

      {isOwner && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={w._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", w._id);
              update("deletion_entity", "wallet");
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

export default WalletRowMenuItems;
