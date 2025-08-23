"use client";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";
import SaleRow from "./SaleRow";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import { useStore } from "@/stores";

export default function SalesTable({ sales, isOwner, user }) {
  const current_store = useStore((s) => s.current_store);

  return (
    <div className="!z-0">
      {sales.length > 0 ? (
        <div
          className={`flex flex-col mt-5 ${current_store?.allow_sale_color ? "gap-1" : ""} ${
            sales.length >= 3 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {sales?.map((s, index) => (
            <SaleRow
              key={s._id}
              s={s}
              isLastOne={index === sales.length - 1}
              companyName={user.company.name}
              pickUpDateAllowed={current_store?.allow_pick_up_date}
              trackServicesTime={current_store?.track_services_time}
              colorAllowed={current_store?.allow_sale_color}
              multiCurrency={current_store?.allow_multi_currency}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <NoRecordsFound text="No se encontraron ventas en esta sucursal" />
        </div>
      )}
    </div>
  );
}
