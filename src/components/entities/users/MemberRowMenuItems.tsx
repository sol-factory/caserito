"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { DollarSign, Eye, KeyRound } from "lucide-react";
import React from "react";
import TemplatesMenuItems from "../templates/TemplatesMenuItems";
import { COUNTRIES } from "@/config/constanst";
import usePermissions from "@/hooks/use-permissions";
import AttachmentsDropdownItem from "../attachments/AttachmentsDropdownItem";

const MemberRowMenuItems = ({ m, companyName }) => {
  const current_store = useStore((s) => s.current_store);
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);

  const handleOptionClick = (e, formIndex) => {
    e.stopPropagation();
    const country = COUNTRIES.find(
      (c) => c.code === (m.country_code || m.country?.code)
    );

    update("member", {
      ...m,
      firstname: m.firstname || "",
      lastname: m.lastname || "",
      email: m.email || "",
      payment_type: m.payment_type?._id ? m.payment_type : {},
      pay_cycle: m.pay_cycle?._id ? m.pay_cycle : {},
      country,
      formatted_number: m.formatted_number,
      phone: m.phone,
      canUpdate: true,
    });
    update("openDialog", "member");
    update("creating", false);
    update("openDialogIndex", formIndex);
  };
  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => handleOptionClick(e, 0)}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>
      <AttachmentsDropdownItem mongoose_model={"Member"} model_id={m._id} />
      {current_store.allow_workers && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => handleOptionClick(e, 1)}
        >
          <DollarSign size={21} strokeWidth={1.5} />
          Configurar sueldo
        </DropdownMenuItem>
      )}
      {m.role.name === "Técnico" && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => handleOptionClick(e, 2)}
        >
          <KeyRound size={21} strokeWidth={1.5} />
          Configurar permisos
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <TemplatesMenuItems
        c={{
          firstname: m.firstname,
          phone: m?.phone,
          country_code: m.country_code,
        }}
        entity="member"
        screen="Personal"
        isOwner={isOwner}
      />
      {isOwner && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={m._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", m._id);
              update("deletion_entity", "member");
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

export default MemberRowMenuItems;
