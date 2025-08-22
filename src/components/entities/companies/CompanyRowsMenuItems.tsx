"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { notify } from "@/helpers/notify";
import { Eye, Scan, Sparkles } from "lucide-react";
import api from "@/helpers/api";
import { differenceInCalendarDays } from "date-fns";

const CompanyRowMenuItems = ({ c }) => {
  const daysSinceTrialStart = differenceInCalendarDays(
    new Date(),
    new Date(c.trial_start_date)
  );
  const remainingDays = 14 - daysSinceTrialStart;
  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();

          window.open(
            `https://www.aquapp.lat?email=${c.creator_email}&code=letmein`,
            "_blank"
          );
        }}
      >
        <Scan size={21} />
        Inspeccionar
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();

          window.open(c.logo_url, "_blank");
        }}
      >
        <Eye size={21} />
        Ver logo
      </DropdownMenuItem>

      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={async (e) => {
          e.stopPropagation();

          const result = await api(c._id, "company", "activateManually");

          notify(result);
        }}
      >
        <Sparkles size={21} />
        Habilitar suscripción
      </DropdownMenuItem>

      {remainingDays < 6 && (
        <DropdownMenuItem
          className="flex gap-3 cursor-pointer w-auto"
          onClick={async (e) => {
            e.stopPropagation();

            const result = await api(c._id, "company", "extendTrial");

            notify(result);
          }}
        >
          <Eye size={21} />
          Extender 7 días de prueba
        </DropdownMenuItem>
      )}
    </>
  );
};

export default CompanyRowMenuItems;
