"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { isFuture, isPast, isToday, isYesterday } from "date-fns";
import { Eye, History } from "lucide-react";
import { useRouter } from "next/navigation";
import AttachmentsDropdownItem from "../attachments/AttachmentsDropdownItem";
import CommentsDropdownItem from "../comments/CommentsDropdownItem";

const CashflowRowMenuItems = ({ c }) => {
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);
  const router = useRouter();

  const isServiceGathering = c?.sub_category?.name === "Venta de servicios";
  return (
    <>
      {c.category.name !== "Giro" && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => {
            try {
              e.stopPropagation();
              update("cashflow", {
                ...c,
                date: new Date(
                  c.full_date.year,
                  c.full_date.month - 1,
                  c.full_date.day,
                  10, // para que no se cambie el día
                  0
                ),
                kind: c.kind === "Ingreso" ? "income" : "egress",
                canUpdate: !isServiceGathering,
                canCreate: false,
                onlyShow: isServiceGathering || isPast(c.date),
              });
              update("openDialog", "cashflow");
              update("openDialogIndex", 1);
            } catch (error) {
              console.log({ error });
            }
          }}
        >
          <Eye size={21} />
          Ver detalle
        </DropdownMenuItem>
      )}
      <CommentsDropdownItem mongoose_model="Cashflow" model_id={c._id} />
      {c.kind === "Ingreso" && c.client_id && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/cashflows?client_id=${c.client_id}`);
          }}
        >
          <History size={21} />
          Historial de pagos
        </DropdownMenuItem>
      )}
      <AttachmentsDropdownItem mongoose_model="Cashflow" model_id={c._id} />

      {isOwner &&
        (isYesterday(c.createdAt) ||
          isToday(c.createdAt) ||
          isFuture(c.createdAt)) &&
        !isServiceGathering && (
          <>
            <div
              className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
              key={c._id}
              onClick={(e) => {
                e.stopPropagation();
                update("deletion_id", c._id);
                update("deletion_entity", "cashflow");
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

export default CashflowRowMenuItems;
