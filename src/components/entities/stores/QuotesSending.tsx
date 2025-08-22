"use client";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/stores";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUp, Rocket } from "lucide-react";

const QuotesSending = () => {
  const update = useStore((s) => s.update);
  const store = useStore((s) => s.current_store);

  const daysSinceStart = 12;

  return (
    <div className="flex flex-col text-[0.6rem] my-4">
      <span>
        <span className="font-normal underline">
          Cotizaciones creadas últimos 30 días
        </span>
        :
      </span>
      <div className="flex items-center justify-between  gap-1 mt-1 mb-1">
        <div className="flex items-center gap-1">
          <Progress
            value={(store.quotes_count / store.quotes_limit) * 100}
            className="!w-16 bg-gray-50 ring-[0.5px] ring-gray-300"
          />
          <span>
            {store.quotes_count} / {store.quotes_limit}
          </span>
        </div>
        <div
          className="hover:underline hover:cursor-pointer hover:text-green-600 flex items-center gap-1 font-extralight justify-end"
          onClick={() => {
            update("openDialog", "plans");
            update("openDialogIndex", 0);
            update("subKind", "quotes");
          }}
        >
          <ArrowUp strokeWidth={1} className="w-2 h-2" />
          <span>Aumentar límite</span>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <span className="text-[0.5rem] font-extralight">
          El contador reinicia el{" "}
          <span className="text-blue-600">
            {format(
              addDays(
                new Date(store.quotes_limit_start_date || null),
                30 - daysSinceStart
              ),
              "EE dd MMM H:mm",
              { locale: es }
            )}
          </span>
        </span>
      </div>
    </div>
  );
};

export default QuotesSending;
