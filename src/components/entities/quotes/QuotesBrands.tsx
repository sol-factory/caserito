"use client";

import { TotalAmount } from "../reports/TotalAmount";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createQueryString, removeQueryString } from "@/helpers/url";
import { toSlug } from "@/helpers/text";

const QuotesBrands = ({ quotes }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get("brand");
  const pathname = usePathname();

  const countByBrand = Object.values(
    quotes.reduce((acc, item) => {
      const brand = item.vehicle?.brand ?? "Desconocido";
      acc[brand] = acc[brand] || { brand, count: 0, amount: 0 };
      acc[brand].count += 1;
      acc[brand].amount += item.amount;
      return acc;
    }, {})
  );

  return (
    <div className="flex items-center flex-wrap gap-3 mt-5 overflow-hidden overflow-x-scroll no-scrollbar py-1 px-0.5 -ml-0.5 ">
      {countByBrand.map((b: any) => (
        <TotalAmount
          key={b.brand}
          data={{ total_amount: b.amount, count: b.count }}
          title={b.brand}
          blob_name={`brands/${toSlug(b.brand)}`}
          onClick={() => {
            if (b.brand === selectedBrand) {
              router.push(
                `/quotes?${removeQueryString("brand", searchParams, pathname)}`
              );
            } else {
              router.push(
                `/quotes?${createQueryString(searchParams, "brand", b.brand, pathname)}`
              );
            }
          }}
          className={`hover:bg-accent max-w-full hover:cursor-pointer text-nowrap rounded ${selectedBrand === b.brand ? "bg-blue-50" : ""}`}
        />
      ))}
    </div>
  );
};

export default QuotesBrands;
