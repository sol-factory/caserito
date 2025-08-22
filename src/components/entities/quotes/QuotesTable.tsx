"use client";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";
import useSubscription from "@/hooks/use-subscription";
import QuoteRow from "./QuoteRow";
import { useSearchParams } from "next/navigation";

export default function QuotesTable({
  quotes,
  isOwner,
  isManager,
  user,
  store,
}) {
  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get("brand");
  return (
    <div>
      {quotes.length > 0 ? (
        <div
          className={`flex flex-col mt-5 ${store?.allow_sale_color ? "gap-1" : ""} ${
            quotes.length >= 3 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {quotes
            ?.filter((q) => {
              if (!selectedBrand) return true;
              return selectedBrand === q.vehicle.brand;
            })
            .map((q, index) => (
              <QuoteRow
                key={q._id}
                q={q}
                isLastOne={index === quotes.length - 1}
                isOwner={isOwner}
                companyName={user.company.name}
                colorAllowed={store?.allow_sale_color}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <NoRecordsFound text="No se encontró ninguna cotización en esta sucursal" />
        </div>
      )}
    </div>
  );
}
