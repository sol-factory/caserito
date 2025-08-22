import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { RotateCcw } from "lucide-react";
import React from "react";
import FreeTrialState from "../users/FreeTrialState";
import useSubscription from "@/hooks/use-subscription";

const ResetSalesMenuItem = () => {
  const sub = useSubscription();
  const update = useStore((s) => s.update);

  const handleResetSales = async () => {
    update("deleting", false);
    update("deletion_id", "sale-reset");
  };
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="gap-3 cursor-pointer items-start"
          onClick={handleResetSales}
        >
          <RotateCcw />
          <div className="flex flex-col">
            <span> Resetear movimientos</span>
            <span className="text-[10px] -mt-1 font-light text-muted-foreground">
              Solo por período de prueba
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
};

export default ResetSalesMenuItem;
