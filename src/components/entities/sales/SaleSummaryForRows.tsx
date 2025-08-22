import { getDaysDifferenceText } from "@/helpers/date";
import { toMoney } from "@/helpers/fmt";

const SaleSummaryForRows = ({ sales }) => {
  return (
    <div className="flex flex-col items-end w-40 sm:w-[12rem]">
      {sales?.count > 0 && (
        <div className="flex items-center gap-1 justify-end">
          <span className="text-nowrap">{toMoney(sales?.amount || 0)}</span>
          <span className="text-muted-foreground text-xs">
            ({sales?.count || 0})
          </span>
        </div>
      )}
      {sales?.usd_count > 0 && (
        <div className="flex items-center gap-1 justify-end">
          <span className="text-nowrap">
            {toMoney(sales?.usd_amount || 0, false, true, "u$s")}
          </span>
          <span className="text-muted-foreground text-xs">
            ({sales?.usd_count || 0})
          </span>
        </div>
      )}
      {sales?.last_one && (
        <span className="text-[10px] text-muted-foreground -mt-1">
          Última vez:{" "}
          <span className="text-blue-400">
            {getDaysDifferenceText(sales?.last_one)}
          </span>
        </span>
      )}
    </div>
  );
};

export default SaleSummaryForRows;
