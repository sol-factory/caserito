"use client";

import {
  addMonths,
  addWeeks,
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/stores";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createQueryString } from "@/helpers/url";
import { es } from "date-fns/locale";
import { useState } from "react";

const PREDEFINED_PERIODS = [
  { key: "this_week", label: "Esta semana" },
  { key: "last_week", label: "Semana pasada" },
  { key: "next_week", label: "Próxima semana" },
  { key: "this_month", label: "Este mes" },
  { key: "last_month", label: "Mes pasado" },
  { key: "next_month", label: "Próximo mes" },
  { key: "this_year", label: "Este año" },
  { key: "last_year", label: "Año pasado" },
  { key: "next_year", label: "Próximo año" },
  { key: "last_2_years", label: "Últimos 2 años" },
  { key: "last_3_years", label: "Últimos 3 años" },
  { key: "last_4_years", label: "Últimos 4 años" },
  { key: "last_5_years", label: "Últimos 5 años" },
];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPeriodLabel(period: string) {
  const today = new Date();

  if (period.startsWith("custom_")) {
    const parts = period.replace("custom_", "").split("-");
    const monthIndex = parseInt(parts[1]) - 1;
    const year = parts[0];
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${months[monthIndex]} ${year}`;
  }

  switch (period) {
    case "this_week": {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return `Semana del ${format(start, "d", { locale: es })} al ${format(end, "d 'de' LLL", { locale: es })}`;
    }
    case "last_week": {
      const start = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const end = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      return `Semana del ${format(start, "d", { locale: es })} al ${format(end, "d 'de' LLL", { locale: es })}`;
    }
    case "next_week": {
      const start = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
      const end = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
      return `Semana del ${format(start, "d", { locale: es })} al ${format(end, "d 'de' LLL", { locale: es })}`;
    }
    case "this_month":
      return capitalize(format(today, "LLLL yyyy", { locale: es }));
    case "last_month":
      return capitalize(
        format(subMonths(today, 1), "LLLL yyyy", { locale: es })
      );
    case "next_month":
      return capitalize(
        format(addMonths(today, 1), "LLLL yyyy", { locale: es })
      );
    case "this_year":
      return `Año ${today.getFullYear()}`;
    case "last_year":
      return `Año ${today.getFullYear() - 1}`;
    case "next_year":
      return `Año ${today.getFullYear() + 1}`;
    case "last_2_years":
      return `Años ${today.getFullYear() - 1}–${today.getFullYear()}`;
    case "last_3_years":
      return `Años ${today.getFullYear() - 2}–${today.getFullYear()}`;
    case "last_4_years":
      return `Años ${today.getFullYear() - 3}–${today.getFullYear()}`;
    case "last_5_years":
      return `Años ${today.getFullYear() - 4}–${today.getFullYear()}`;
    default:
      return "Seleccionar período";
  }
}

export function DatePickerPeriod({ show = false, btnClassName = "" }) {
  const searchParams = useSearchParams();
  const update = useStore((s) => s.update);
  const openDatePicker = useStore((s) => s.openDatePicker);
  const router = useRouter();
  const pathname = usePathname();

  const currentPeriod = searchParams.get("period") || "this_week";
  const isOpen = openDatePicker === "date";

  const handlePeriodChange = (period: string) => {
    const params = createQueryString(
      searchParams,
      ["period"],
      [period],
      pathname
    );
    router.push(pathname + "?" + params);
    update("openDatePicker", "");
  };

  const periodLabel = getPeriodLabel(currentPeriod);

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handleCustomMonthYear = () => {
    const monthStr = (selectedMonth + 1).toString().padStart(2, "0");
    const periodKey = `custom_${selectedYear}-${monthStr}`;
    handlePeriodChange(periodKey);
  };

  if (pathname !== "/reports" && !show) return null;

  return (
    <div className="relative">
      <Popover open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              update("openDatePicker", isOpen ? "" : "date");
              update("openSelect", "");
            }}
            className={cn(
              // Base (mobile): más finito y chico
              "justify-start text-left font-normal !h-4 px-2 text-xs !py-3",
              // En pantallas grandes (sm en adelante): vuelve a la normalidad
              "sm:h-[2.4rem] sm:px-3 sm:text-base sm:!py-4",
              btnClassName
            )}
          >
            <CalendarIcon className="sm:mr-0.5  !h-3 !w-3 sm:!h-4 sm:!w-4" />
            <span>{periodLabel || "Seleccionar período"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-3 w-[400px] max-w-[100vw]">
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs pl-3">
                Semanas y Meses
              </span>
              {PREDEFINED_PERIODS.slice(0, 6).map(({ key, label }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start",
                    key === currentPeriod && "font-bold text-primary bg-accent"
                  )}
                  onClick={() => handlePeriodChange(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs pl-3">Años</span>
              {PREDEFINED_PERIODS.slice(6).map(({ key, label }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start",
                    key === currentPeriod && "font-bold text-primary bg-accent"
                  )}
                  onClick={() => handlePeriodChange(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="border-t mt-3 pt-3">
            <div className="flex gap-2 mb-2">
              <select
                className="border rounded-md px-2 py-1 w-full"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map((month, i) => (
                  <option key={month} value={i}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md px-2 py-1 w-full"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleCustomMonthYear}
              className="w-full"
              size="sm"
            >
              Aplicar mes/año personalizado
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
