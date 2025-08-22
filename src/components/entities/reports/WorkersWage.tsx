"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { toMoney } from "@/helpers/fmt";
import { useStore } from "@/stores";
import { ArrowUp } from "lucide-react";
import Image from "next/image";

const WorkersWage = ({ salaries, cycle = "monthly" }) => {
  const current_store = useStore((s) => s.current_store);
  const total = salaries
    .filter((s) => s.pay_cycle?._id === cycle)
    .reduce(
      (prev, curr) =>
        prev + curr.total_amount + curr.payment_scheme.fixed_salary,
      0
    );

  const finalSalaries = salaries.filter(
    (s) => s.payment_scheme?.pay_cycle?._id === cycle
  );
  if (!current_store?.allow_workers || finalSalaries.length === 0) return null;

  return (
    <Card className="outline-none w-full rounded-none sm:rounded-xl p-5">
      <div className="flex items-center gap-2">
        <CardTitle className="text-xl">Liquidación de sueldos</CardTitle>
        <span className="text-sm text-muted-foreground font-light">
          (
          {cycle === "daily"
            ? "Diaria"
            : cycle === "weekly"
              ? "semanal"
              : "mensual"}
          )
        </span>
      </div>
      <CardDescription className="text-xs font-extralight">
        Distribución de los
        <span className={`text-chart-1 font-normal mx-1`}>
          {toMoney(total)}
        </span>
        a abonar
      </CardDescription>
      <div className="flex flex-col w-full gap-2 mt-2">
        {finalSalaries.map((s) => {
          const { payment_scheme } = s;
          const payment_type = payment_scheme?.payment_type;

          let balance = payment_scheme.fixed_salary;
          if (payment_type?._id === "fixed_plus_commission") {
            balance = payment_scheme.fixed_salary + s.total_amount;
          }
          if (payment_type?._id === "fixed_or_commission") {
            balance = Math.max(payment_scheme.fixed_salary, s.total_amount);
          }

          if (payment_type?._id === "percent_of_sales") {
            balance = s.total_amount;
          }
          const color = "text-chart-2";
          if (balance <= 0) return null;
          return (
            <div className="flex flex-col w-full gap-1" key={s._id}>
              <div className="py-4 pb-0">
                <CardTitle className="flex items-center justify-between space-y-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {s.image_url && (
                        <Image
                          src={s.image_url}
                          className="w-6 rounded-sm"
                          width={17}
                          height={17}
                          alt="Image"
                        />
                      )}
                      <span>{s.name}</span>
                    </div>
                    {payment_type?.name && (
                      <Badge className="w-fit font-extralight mt-0.5 text-gray-700 bg-gray-200 hover:bg-slate-200 text-[0.6rem] px-1.5 h-3">
                        {payment_type?.name}
                      </Badge>
                    )}
                  </div>
                  <span className={color}>{toMoney(balance)}</span>
                </CardTitle>
              </div>
              <div className="pb-2 mt-2">
                {payment_scheme.fixed_salary >= 0 &&
                  payment_type?._id?.includes("fixed") && (
                    <div className=" flex items-center justify-between font-light text-sm">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="text-chart-2 w-4 h-4" />
                        <span>Sueldo fijo</span>
                      </div>
                      <div className="flex flex-col text-end">
                        <span>{toMoney(s.payment_scheme.fixed_salary)}</span>
                      </div>
                    </div>
                  )}
                {s.count > 0 && payment_scheme?.sales_percentage > 0 && (
                  <div className=" flex items-center justify-between font-light text-sm">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="text-chart-2 w-4 h-4" />
                      <span>% sobre ventas</span>

                      <span className="text-muted-foreground font-extralight ml-1 text-[0.8rem] mt-[2px]">
                        ({s.count})
                      </span>
                    </div>
                    <div className="flex flex-col text-end text-md">
                      <span>{toMoney(s.total_amount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WorkersWage;
