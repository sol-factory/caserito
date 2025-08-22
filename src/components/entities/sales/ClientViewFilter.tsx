"use client";
import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import { DatePickerPeriod } from "@/components/custom-ui/DatePickerPeriod";
import { CONFIG } from "@/config/constanst";
import Image from "next/image";
import DebtsByCurrency from "./DebtsByCurrency";

const ClientViewFilter = ({ client, sales, allowMultiCurrency }) => {
  if (!client || !sales) return <></>;
  const debts = sales.reduce(
    (acc, sale) => {
      const amount_debt =
        sale.amount - sale.gathered_amount - sale.discounts_amount;
      const usd_amount_debt =
        sale.usd_amount - sale.usd_gathered_amount - sale.usd_discounts_amount;
      return {
        amount: acc.amount + amount_debt,
        usd_amount: acc.usd_amount + usd_amount_debt,
      };
    },
    { amount: 0, usd_amount: 0 }
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row mr-8">
        <div className="flex flex-col sm:flex-row mr-3">
          <div className="flex mr-3">
            <div className="flex">
              <span className="font-bold underline">Cliente</span>:
            </div>
            <div className="mb-3 ml-1.5">
              <div className="flex gap-2">
                <span className="text-blue-500 sm:ml-1 mr-2">
                  {client.firstname} {client.lastname}
                </span>
              </div>
              {client.phone.formatted_number && (
                <div
                  className="flex items-center gap-1 group cursor-pointer ml-0.5"
                  onClick={() => {
                    window.open(
                      `https://api.whatsapp.com/send/?phone=${
                        client.phone.phone
                      }&text=Hola ${client.firstname}, `,
                      "_blank"
                    );
                  }}
                >
                  <Image
                    src={`${CONFIG.blob_url}/whatsapp.png`}
                    alt=""
                    width={30}
                    height={30}
                    className="w-3.5 cursor-pointer rounded-sm hover:scale-105 transition-transform"
                  />
                  <span className="text-[0.6rem] sm:text-xs font-extralight group-hover:underline">
                    {client.phone.formatted_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <DebtsByCurrency
          debts={debts}
          title="Deudas"
          allowMultiCurrency={allowMultiCurrency}
        />
      </div>
      <div className="flex items-center mr-3 mt-6 sm:mt-3">
        <DatePickerPeriod show btnClassName="!py-4 !h-5 mr-2 " />
        <CleanUrlFilters />
      </div>
    </div>
  );
};

export default ClientViewFilter;
