/* eslint-disable @next/next/no-img-element */
"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { toMoney } from "@/helpers/fmt";
import { useStore } from "@/stores";
import { Lock, MapPin } from "lucide-react";

const DiscountRow = ({ d }) => {
  const update = useStore((s) => s.update);
  return (
    <TableRow
      key={d._id}
      className="hover:cursor-pointer"
      onClick={async () => {
        if (d.locked) return;
        update("discount", { ...d, canUpdate: d.name !== "De monto variable" });
        update("openDialog", "discount");
        update("openDialogIndex", 0);
        update("creating", false);
      }}
    >
      <TableCell className="font-medium w-48 ">
        <div className="flex flex-col">
          <span translate="no">{d.name}</span>
          {d.locked && (
            <Badge className="w-fit font-normal bg-slate-600 text-[0.7rem] px-1.5 h-4">
              <Lock className="mr-1 w-2.5" strokeWidth={2.2} />
              Obligatorio
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {d.value > 0 && (
          <span>{d.kind === "$" ? toMoney(d.value) : `${d.value}%`}</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:block">
        <div className="flex flex-col gap-1">
          {d.stores.map((s) => (
            <div key={s._id} className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />{" "}
              <span className="text-nowrap">{s.name}</span>
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {!d.locked && (
          <DeleteIcon
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", d._id);
              update("deletion_entity", "discount");
              update("openSecondaryDialog", "delete");
            }}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default DiscountRow;
