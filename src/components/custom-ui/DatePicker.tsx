"use client";
import { format, isFuture, isPast, isToday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore, type StateStore } from "@/stores";
import { es } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createQueryString } from "@/helpers/url";
import { focusAfter } from "@/helpers/ui";
import { useEffect, useRef, useState } from "react";
import { weekRangeText } from "@/helpers/date";
import MyCalendar from "./MyCalendar";

type SelectableStates = Pick<
  StateStore,
  "user" | "sale" | "filter" | "cashflow"
>;

type Props<E extends keyof SelectableStates> = {
  entity: E;
  field: keyof SelectableStates[E];
  param?: string;
  fromDate?: Date;
  fromDateField?: string;
  popoverWidth?: string;
  toDate?: Date;
  weekStart?: Date;
  weekEnd?: Date;
  dateFormat?: string;
  icon?: any;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  weekly?: boolean;
  monthly?: boolean;
  onlyIcon?: boolean;
  range?: boolean;
  children?: React.ReactNode;
};

export function DatePicker<E extends keyof SelectableStates>({
  entity,
  field,
  param,
  fromDate,
  toDate,
  fromDateField = null,
  dateFormat = "PP",
  popoverWidth = "w-full",
  icon,
  id = null,
  placeholder,
  disabled = false,
  monthly = false,
  weekly = false,
  weekStart = null,
  weekEnd = null,
  onlyIcon = false,
  range = false,
}: Props<E>) {
  const searchParams = useSearchParams();
  const dateFromParams = searchParams.get(param);
  const update = useStore((s) => s.update);
  const openDatePicker = useStore((s) => s.openDatePicker);
  const router = useRouter();
  const pathname = usePathname();
  const value = useStore((s) => s[entity][field]) as Date;
  const fromDateByField = useStore((s) => s[entity][fromDateField]) as Date;
  const popoverRef = useRef(null);

  const isOpen = openDatePicker === id;
  const paramDate = !!dateFromParams ? new Date(+dateFromParams) : null;

  const dateValue =
    param && paramDate ? paramDate : value ? new Date(value) : undefined;

  const [month, setMonth] = useState(dateValue);

  const isFilter = entity === "filter";
  const cashflowScreen = pathname === "/cashflows";

  useEffect(() => {
    if (cashflowScreen) {
      const lastOpen = localStorage.getItem("lastOpen");
      const hadVisitedCashflowsToday =
        !!lastOpen && isToday(new Date(+lastOpen));
      const today = new Date();
      const now = String(+today);

      if (!hadVisitedCashflowsToday) {
        router.push(
          `/cashflows?${createQueryString(searchParams, "date", now, pathname)}`
        );
        setMonth(today);
      }
      localStorage.setItem("lastOpen", now);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      event.stopPropagation();

      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        update("openDatePicker", "");
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDayClick = (date) => {
    if (date) {
      const isFutureDate = isFuture(date);
      const isPastDate = isPast(date);

      date.setHours(isFutureDate && !param ? 0 : new Date().getHours());
      date.setMinutes(new Date().getMinutes());
      date.setSeconds(new Date().getSeconds());
      if (param) {
        router.push(
          pathname +
            (date
              ? "?" +
                createQueryString(searchParams, param, `${+date}`, pathname)
              : "")
        );
        update(entity, {
          [field]: date ? (date.toString() as string) : "",
        });
      }
      if (entity) {
        update(entity, {
          [field]: date.toString() as string,
        });
        const selector = `#${field as string} div[aria-label='hora']`;

        const hourDiv = document.querySelector(selector) as HTMLDivElement;

        if (isFutureDate || isPastDate || fromDateField) {
          hourDiv?.focus();
        } else {
          focusAfter("sale-client", 50, true);
        }
      }
    } else {
      if (!cashflowScreen) {
        update(entity, { [field]: "" });
      }
      if (param && !cashflowScreen) {
        router.push(pathname);
      }
    }

    update("openDatePicker", "");
  };

  return (
    <div ref={popoverRef} className={`relative ${popoverWidth} inline-flex`}>
      <Popover open={openDatePicker === id} modal={false}>
        <PopoverTrigger asChild className="relative">
          {!onlyIcon ? (
            <Button
              id={id}
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  update("openSelect", "");
                  update("openDatePicker", isOpen ? "" : id);
                }
              }}
              className={cn(
                "justify-start text-left font-normal w-full px-3",
                !field && "text-muted-foreground",
                disabled && "cursor-default",
                onlyIcon && "w-fit gap-0"
              )}
            >
              {!!value && !isFilter && (
                <span
                  className={`absolute !-top-[0.3rem] rounded-sm px-1 leading-tight  
              start-0 md:start-2 bg-white text-zinc-400 text-[8px]`}
                >
                  {isFilter ? "Filtro fecha" : placeholder}
                </span>
              )}
              {icon ? icon : <CalendarIcon />}
              {!!dateValue && !isNaN(dateValue.getTime()) ? (
                <span
                  className={`${isFilter || onlyIcon ? "hidden sm:block" : ""}`}
                >
                  {format(dateValue, dateFormat, { locale: es })}
                </span>
              ) : (
                <span className="text-zinc-400 !font-light">{placeholder}</span>
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
              {weekly
                ? weekRangeText(weekStart, weekEnd)
                : format(dateValue, dateFormat, {
                    locale: es,
                  })}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full z-50">
          <MyCalendar
            weekly={weekly}
            monthly={monthly}
            dateValue={dateValue}
            fromDate={fromDateByField}
            fromDateByField={fromDateByField}
            toDate={toDate}
            month={month}
            range={range}
            setMonth={setMonth}
            handleDayClick={handleDayClick}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
