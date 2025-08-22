"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CONFIG, COUNTRIES } from "@/config/constanst";
import { getInternazionalizedDate } from "@/helpers/date";
import { useStore } from "@/stores";
import { Eye, History, Shapes, Trophy } from "lucide-react";
import React from "react";
import TemplatesMenuItems from "../templates/TemplatesMenuItems";
import { usePathname, useRouter } from "next/navigation";
import { createQueryString } from "@/helpers/url";
import { addDays } from "date-fns";
import usePermissions from "@/hooks/use-permissions";
import api from "@/helpers/api";
import { notify } from "@/helpers/notify";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import AttachmentsDropdownItem from "../attachments/AttachmentsDropdownItem";

const ClientRowMenuItems = ({ c, companyName }) => {
  const { can_view_phone_client, can_edit_client, isOwner } = usePermissions();
  const update = useStore((s) => s.update);
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryClick = async (e, category) => {
    e.stopPropagation();
    const result = await api(
      {
        data: {
          _id: c._id,
          category,
          alreadySelected: c.category === category,
        },
      },
      "client",
      "setCategory"
    );
    notify(result);
  };

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();

          let defValue;
          try {
            defValue = getInternazionalizedDate(
              c.dob?.year,
              c.dob?.month,
              c.dob?.day
            );
          } catch (error) {
            console.log({ error });
          }
          const country = COUNTRIES.find(
            (cl) => cl.code === (c.country_code || c.country?.code)
          );

          update("client", {
            ...c,
            kind: c.kind || "person",
            fiscal_id: c.fiscal_id || "",
            country,
            formatted_number: c.formatted_number,
            phone: c.phone,
            defaultDOB: defValue,
            canUpdate: can_edit_client,
          });
          update("openDialog", "client");
          update("openDialogIndex", 0);
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>
      {c.sales?.count > 0 && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/washes?${createQueryString("", ["client_id", "period"], [c._id, "this_year"], pathname)}`
            );
          }}
        >
          <History size={21} strokeWidth={1.5} />
          Historial de ventas
        </DropdownMenuItem>
      )}
      <AttachmentsDropdownItem mongoose_model={"Client"} model_id={c._id} />
      <DropdownMenuSeparator />
      {isOwner && (
        <>
          <DropdownMenuItem
            className="flex gap-2 cursor-pointer w-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Shapes size={21} strokeWidth={1.5} className="!w-5" />
            <span className="ml-1.5">Categoría</span>
            <div className="flex items-center gap-1">
              <Badge
                className={`bg-white shadow-none h-5 w-7 !cursor-pointer px-1 py-0 ${c.category === "gold" ? "bg-gray-200" : ""}`}
                onClick={(e) => handleCategoryClick(e, "gold")}
              >
                <Image
                  src={`${CONFIG.blob_url}/clients/gold2.png`}
                  alt=""
                  width={60}
                  height={60}
                  className="w-5 cursor-pointer !drop-shadow-[0_0.5px_0.3px_rgba(0,0,0,1)] rounded-sm hover:scale-105 transition-transform"
                  onClick={() => {}}
                />
              </Badge>{" "}
              <Badge
                className={`bg-white shadow-none h-5 w-7 !cursor-pointer px-1 ${c.category === "silver" ? "bg-gray-200" : ""}`}
                onClick={(e) => handleCategoryClick(e, "silver")}
              >
                <Image
                  src={`${CONFIG.blob_url}/clients/silver.png`}
                  alt=""
                  width={60}
                  height={60}
                  className="w-5 cursor-pointer !drop-shadow-[0_0.5px_0.3px_rgba(0,0,0,1)] rounded-sm hover:scale-105 transition-transform"
                  onClick={() => {}}
                />
              </Badge>{" "}
              <Badge
                className={`bg-white shadow-none h-5 w-7 !cursor-pointer px-1 ${c.category === "bronze" ? "bg-gray-200" : ""}`}
                onClick={(e) => handleCategoryClick(e, "bronze")}
              >
                <Image
                  src={`${CONFIG.blob_url}/clients/bronze.png`}
                  alt=""
                  width={60}
                  height={60}
                  className="w-5 cursor-pointer !drop-shadow-[0_0.5px_0.3px_rgba(0,0,0,1)] rounded-sm hover:scale-105 transition-transform"
                  onClick={() => {}}
                />
              </Badge>{" "}
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      {can_view_phone_client && (
        <TemplatesMenuItems c={c} entity="client" screen="Clientes" />
      )}
      {isOwner && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={c._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", c._id);
              update("deletion_entity", "client");
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

export default ClientRowMenuItems;
