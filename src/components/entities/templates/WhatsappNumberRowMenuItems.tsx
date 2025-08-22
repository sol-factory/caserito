"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { Eye, Rocket } from "lucide-react";
import React from "react";

const WhatsappNumberRowMenuItems = ({ w, isOwner }) => {
  const update = useStore((s) => s.update);

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();

          update("whatsapp-number", { ...w, canUpdate: isOwner });
          update("openDialog", "template");
          update("openDialogIndex", 0);
        }}
      >
        <Rocket size={21} strokeWidth={1.5} />
        Mejorar plan
      </DropdownMenuItem>
    </>
  );
};

export default WhatsappNumberRowMenuItems;
