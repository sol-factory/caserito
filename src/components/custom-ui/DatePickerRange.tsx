"use client";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isToday,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore, type StateStore } from "@/stores";
import { es } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createQueryString } from "@/helpers/url";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { weekRangeText } from "@/helpers/date";

type SelectableStates = Pick<
  StateStore,
  "vehicle" | "service" | "user" | "sale" | "filter" | "client" | "cashflow"
>;

type Props<E extends keyof SelectableStates> = {
  icon?: any;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  link?: boolean;
  alwaysShow?: boolean;
  maxDate?: Date;
};

export function DatePickerRange<E extends keyof SelectableStates>({
  icon,
  id = null,
  placeholder,
  disabled = false,
  link = false,
  alwaysShow = false,
  maxDate = null,
}: Props<E>) {
  const searchParams = useSearchParams();
  const update = useStore((s) => s.update);
  const openDatePicker = useStore((s) => s.openDatePicker);
  const router = useRouter();
  const pathname = usePathname();
  const since = searchParams.get("since");
  const to = searchParams.get("to");
  const popoverRef = useRef(null);

  const isOpen = openDatePicker === id;
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [month, setMonth] = useState(new Date(+to));
  const handleChangeDate = (from, to, close = false, monthToGo = null) => {
    if (!month && from) {
      setMonth(from);
    }
    if (monthToGo) {
      setMonth(monthToGo);
    }
    setDate({ from, to });
    const params = createQueryString(
      searchParams,
      ["since", "to"],
      [String(+from), String(+to)],
      pathname
    );

    router.push(pathname + "?" + params);
    if (close) {
      update("openDatePicker", "");
    }
  };

  const showPage = ["/admin"].includes(pathname);
  const show = showPage || alwaysShow;

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        update("openDatePicker", "false");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show) return null;

  const today = new Date();
  const yesterday = {
    from: subDays(today, 1),
    to: subDays(today, 1),
  };
  const lastWeek = {
    from: subDays(startOfWeek(today), 6),
    to: startOfWeek(today),
  };
  const thisWeek = {
    from: addDays(startOfWeek(today), 1),
    to: addDays(startOfWeek(today), 7),
  };
  const thisMonth = {
    from: startOfMonth(today),
    to: endOfMonth(today),
  };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  const thisYear = {
    from: startOfYear(today),
    to: endOfYear(today),
  };

  return (
    <div ref={popoverRef} className="relative">
      <Popover open={isOpen}>
        <PopoverTrigger asChild className="relative">
          {!link ? (
            <Button
              id={id}
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  update("openDatePicker", isOpen ? "" : id);
                  update("openSelect", "");
                }
              }}
              className={cn(
                "justify-start text-left font-normal w-auto px-3 !h-8 sm:!h-[2.78rem]",

                disabled && "cursor-default"
              )}
            >
              {icon ? icon : <CalendarIcon />}
              {(date?.from || date?.to) && (
                <div className="flex items-center gap-3">
                  <span className={`${false ? "hidden sm:block" : ""}`}>
                    {date?.from
                      ? format(date?.from, "d MMM yy", { locale: es })
                      : "..."}
                  </span>

                  <span className="text-muted-foreground font-light">al</span>

                  <span className={`${false ? "hidden sm:block" : ""}`}>
                    {date?.to
                      ? format(date?.to, "d MMM yy", { locale: es })
                      : "..."}
                  </span>
                </div>
              )}
              {!date?.from && !date?.to && (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </Button>
          ) : (
            <Button
              className="relative inline-block text-blue-600 outline-none focus-visible:!ring-0 font-extralight -ml-2 hover:underline cursor-pointer"
              variant="link"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  update("openDatePicker", isOpen ? "" : id);
                  update("openSelect", "");
                }
              }}
            >
              {date?.from && date?.to
                ? weekRangeText(date.from, date.to)
                : "Seleccionar período"}
            </Button>
          )}
        </PopoverTrigger>

        <PopoverContent className="p-0 w-full">
          <div>
            <div className="rounded-md border bg-white">
              <div className="flex max-sm:flex-col">
                <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
                  <div className="h-full sm:border-e">
                    <div className="flex flex-col px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(today, today, false, today)
                        }
                      >
                        Hoy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(
                            yesterday.from,
                            yesterday.to,
                            false,
                            yesterday.from
                          )
                        }
                      >
                        Ayer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(
                            thisWeek.from,
                            thisWeek.to,
                            false,
                            thisWeek.from
                          )
                        }
                      >
                        Esta semana
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(
                            lastWeek.from,
                            lastWeek.to,
                            false,
                            lastWeek.from
                          )
                        }
                      >
                        Semana pasada
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(
                            thisMonth.from,
                            thisMonth.to,
                            false,
                            thisMonth.from
                          )
                        }
                      >
                        Este mes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(
                            lastMonth.from,
                            lastMonth.to,
                            false,
                            lastMonth.from
                          )
                        }
                      >
                        Mes pasado
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          handleChangeDate(
                            thisYear.from,
                            thisYear.to,
                            false,
                            thisYear.from
                          )
                        }
                      >
                        Este año
                      </Button>
                    </div>
                  </div>
                </div>
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate?.to && newDate?.from) {
                      handleChangeDate(newDate.from, newDate.to, false);
                    }

                    const newMonth = +since === +newDate?.from ? +to : +since;
                    setDate(newDate);
                  }}
                  month={month}
                  onMonthChange={setMonth}
                  toDate={maxDate}
                  className="p-2"
                  locale={es}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
