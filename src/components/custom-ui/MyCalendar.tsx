import { es } from "date-fns/locale";
import React, { useState } from "react";
import { Calendar } from "../ui/calendar";
import {
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfDay,
  startOfDay,
} from "date-fns";

const MyCalendar = ({
  dateValue,
  fromDateByField,
  fromDate,
  toDate,
  month,
  range,
  setMonth,
  handleDayClick,
  weekly,
  monthly,
}) => {
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);

  // Hover semanal
  const isInWeek = (day: Date) => {
    if (!hoverDate || !weekly) return false;
    const start = startOfWeek(hoverDate, { weekStartsOn: 1 });
    const end = endOfWeek(hoverDate, { weekStartsOn: 1 });
    return isWithinInterval(day, { start, end });
  };

  // Hover mensual
  const isInMonth = (day: Date) => {
    if (!hoverDate || !monthly) return false;
    const start = startOfMonth(hoverDate);
    const end = endOfMonth(hoverDate);
    return isWithinInterval(day, { start, end });
  };

  // Hover extremos (inicio y fin semana o mes)
  const isHoverRangeStart = (day: Date) => {
    if (!hoverDate) return false;
    if (weekly) {
      return isSameDay(day, startOfWeek(hoverDate, { weekStartsOn: 1 }));
    }
    if (monthly) {
      return isSameDay(day, startOfMonth(hoverDate));
    }
    return false;
  };

  const isHoverRangeEnd = (day: Date) => {
    if (!hoverDate) return false;
    if (weekly) {
      return isSameDay(day, endOfWeek(hoverDate, { weekStartsOn: 1 }));
    }
    if (monthly) {
      return isSameDay(day, endOfMonth(hoverDate));
    }
    return false;
  };

  const isMonday = (day: Date) => day.getDay() === 1;
  const isSunday = (day: Date) => day.getDay() === 0;

  // Semana seleccionada
  const isInSelectedWeek = (day: Date) => {
    if (!dateValue || !weekly) return false;
    const start = startOfWeek(dateValue, { weekStartsOn: 1 });
    const end = endOfWeek(dateValue, { weekStartsOn: 1 });
    return isWithinInterval(day, { start, end });
  };

  // Mes seleccionado
  const isInSelectedMonth = (day: Date) => {
    if (!dateValue || !monthly) return false;
    const start = startOfMonth(dateValue);
    const end = endOfMonth(dateValue);
    return isWithinInterval(day, { start, end });
  };

  // Rango seleccionado (modo range)
  const isInSelectedRange = (day: Date) => {
    if (!range?.from || !range?.to) return false;
    const start = startOfDay(range.from);
    const end = endOfDay(range.to);
    return isWithinInterval(day, { start, end });
  };

  // Día de inicio del rango (week, month o range)
  const isRangeStart = (day: Date) => {
    if (range?.from && isSameDay(day, range.from)) return true;
    if (
      weekly &&
      dateValue &&
      isSameDay(day, startOfWeek(dateValue, { weekStartsOn: 1 }))
    )
      return true;
    if (monthly && dateValue && isSameDay(day, startOfMonth(dateValue)))
      return true;
    return false;
  };

  // Día de fin del rango (week, month o range)
  const isRangeEnd = (day: Date) => {
    if (range?.to && isSameDay(day, range.to)) return true;
    if (
      weekly &&
      dateValue &&
      isSameDay(day, endOfWeek(dateValue, { weekStartsOn: 1 }))
    )
      return true;
    if (monthly && dateValue && isSameDay(day, endOfMonth(dateValue)))
      return true;
    return false;
  };

  return (
    <Calendar
      className="w-full"
      mode={range ? "range" : "single"}
      locale={es}
      modifiers={{
        // Hover
        inWeek: isInWeek,
        inMonth: isInMonth,
        hoverRangeStart: isHoverRangeStart,
        hoverRangeEnd: isHoverRangeEnd,

        // Selección real
        inSelectedWeek: isInSelectedWeek,
        inSelectedMonth: isInSelectedMonth,
        inSelectedRange: isInSelectedRange,

        // Extremos selección real
        rangeStart: isRangeStart,
        rangeEnd: isRangeEnd,

        monday: isMonday,
        sunday: isSunday,
      }}
      modifiersClassNames={{
        // Hover gris (intermedios)
        inWeek: "!bg-accent !text-accent-foreground !rounded-none",
        inMonth: "!bg-accent !text-accent-foreground !rounded-none",

        // Hover extremos negro
        hoverRangeStart: "!bg-black !text-white !rounded-l-sm",
        hoverRangeEnd: "!bg-black !text-white !rounded-r-sm",

        // Selección gris (intermedios)
        inSelectedWeek: "!bg-accent !text-accent-foreground !rounded-none",
        inSelectedMonth: "!bg-accent !text-accent-foreground !rounded-none",
        inSelectedRange: "!bg-accent !text-accent-foreground !rounded-none",

        // Selección extremos negro
        rangeStart: "!bg-black !text-white !rounded-l-sm",
        rangeEnd: "!bg-black !text-white !rounded-r-sm",

        // Bordes por día (solo si no están en rango o hover)
        monday: "rounded-l-sm",
        sunday: "rounded-r-sm",
      }}
      onDayMouseEnter={(day) => setHoverDate(day)}
      onDayMouseLeave={() => setHoverDate(undefined)}
      selected={dateValue}
      fromDate={fromDateByField || fromDate}
      toDate={toDate}
      month={month}
      onMonthChange={(date) => setMonth(date)}
      onSelect={handleDayClick}
      initialFocus
    />
  );
};

export default MyCalendar;
