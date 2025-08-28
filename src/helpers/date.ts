import { parseDate } from "@internationalized/date";
import { addDays, addMinutes, differenceInCalendarDays } from "date-fns";
import { pluralize } from "./text";

export const getNextLockDate = (from: Date): Date => {
  const date = new Date(from);
  date.setDate(date.getDate() + 120);
  return date;
};

export const getWeekOfYear = (fecha: Date) => {
  const fechaCopia = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  );
  const diaSemana = fechaCopia.getUTCDay() || 7; // Domingo es 7 en ISO

  // Ajusta la fecha para que siempre caiga en el jueves de la semana ISO.
  fechaCopia.setUTCDate(fechaCopia.getUTCDate() + 4 - diaSemana);

  // Calcular el inicio del año en el jueves de la primera semana ISO.
  const inicioDelAnio = new Date(Date.UTC(fechaCopia.getUTCFullYear(), 0, 1));
  const primerDiaSemana = inicioDelAnio.getUTCDay() || 7;
  const primerJueves = new Date(inicioDelAnio);
  primerJueves.setUTCDate(inicioDelAnio.getUTCDate() + (4 - primerDiaSemana));

  // Diferencia entre la fecha ajustada y el primer jueves del año.
  const diff = +fechaCopia - +primerJueves;
  const numeroSemana = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

  return numeroSemana;
};

export const getUTCOffset = (timeZone, user) => {
  if (!timeZone) return 0;
  try {
    // Obtiene la fecha actual
    const now = new Date();

    // Formatea la fecha para obtener el offset de la zona horaria
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    });

    // Extrae el nombre de la zona horaria (incluye el offset, por ejemplo, "GMT-3")
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find((part) => part.type === "timeZoneName");

    if (timeZonePart) {
      // Extrae el offset del formato, ejemplo: "GMT-3" => -3
      const match = timeZonePart.value.match(/GMT([+-]\d+)/);
      if (match) {
        return parseInt(match[1], 10) * 60; // Retorna el offset en minutos
      }
    }

    throw new Error("No se pudo determinar el offset");
  } catch (error) {
    console.error(
      "Error al calcular el offset:",
      error.message,
      timeZone,
      user
    );
    return 0;
  }
};

export const getUserDate = (user, date = null) => {
  return addMinutes(date ? new Date(date) : new Date(), -180);
};

export const getInternazionalizedDate = (year, month, day) => {
  try {
    return parseDate(
      `${year}-${month > 9 ? month : "0" + month}-${day < 10 ? "0" + day : day}`
    );
  } catch (error) {
    return null;
  }
};

export const getDateRange = ({ user, since, to, startDaysAgo = 30 }) => {
  const sinceDate = since
    ? new Date(+since)
    : addDays(new Date(), -1 * startDaysAgo);
  const toDate = to
    ? getUserDate(user, new Date(+to))
    : getUserDate(user, new Date());
  const sinceDay = sinceDate.getUTCDate();
  const sinceMonth = sinceDate.getUTCMonth() + 1;
  const sinceYear = sinceDate.getUTCFullYear();
  const toDay = toDate.getUTCDate();
  const toMonth = toDate.getUTCMonth() + 1;
  const toYear = toDate.getUTCFullYear();

  return {
    sinceDate: sinceDate,
    toDate,
    toMonth,
    sinceMonth,
    toYear,
    sinceYear,
    ra_sinceDate: getInternazionalizedDate(sinceYear, sinceMonth, sinceDay),
    ra_toDate: getInternazionalizedDate(toYear, toMonth, toDay),
    sinceDay,
    toDay,
  };
};

export const getWeekDateRange = (weekNumber, year) => {
  const firstDayOfYear = new Date(year, 0, 1); // 1 de enero del año
  const daysToAdd = (weekNumber - 1) * 7; // Días desde la primera semana

  // Ajustar al lunes de la primera semana
  const firstMonday = new Date(firstDayOfYear);
  const dayOfWeek = firstMonday.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  const offset = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Para que comience el lunes
  firstMonday.setDate(firstMonday.getDate() + offset);

  // Calcular el rango de fechas de la semana
  const weekStart = new Date(firstMonday);
  weekStart.setDate(weekStart.getDate() + daysToAdd); // Inicio de la semana
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Fin de la semana

  return {
    start: weekStart, // Fecha inicial en formato YYYY-MM-DD
    end: weekEnd, // Fecha final en formato YYYY-MM-DD
  };
};

export const getFullDate = (date: Date = new Date()) => {
  return {
    minute: date.getMinutes(),
    hour: date.getUTCHours(),
    day: date.getUTCDate(),
    week: getWeekOfYear(date),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
};

export const getDaysDifferenceText = (date: Date) => {
  const daysFromLastTime = differenceInCalendarDays(new Date(), date);
  return daysFromLastTime === 1
    ? "ayer"
    : daysFromLastTime === 0
      ? "hoy"
      : daysFromLastTime === -1
        ? "mañana"
        : daysFromLastTime < -1
          ? `en ${Math.abs(daysFromLastTime)} días`
          : `hace ${daysFromLastTime} días`;
};

export const weekRangeText = (start: Date, end: Date) => {
  const startMonth = start.toLocaleString("es-AR", { month: "short" });
  const endMonth = end.toLocaleString("es-AR", { month: "short" });

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear && start.getMonth() === end.getMonth()) {
    // 🟢 Mismo mes, mismo año
    return `${start.getDate()} al ${end.getDate()} de ${startMonth} de ${startYear}`;
  }

  if (startYear === endYear) {
    // 🟡 Distinto mes, mismo año
    return `${start.getDate()} de ${startMonth} al ${end.getDate()} de ${endMonth} de ${startYear}`;
  }

  // 🔴 Distinto año
  return `${start.getDate()} de ${startMonth} de ${startYear} al ${end.getDate()} de ${endMonth} de ${endYear}`;
};

export const timeAgo = (date: Date | string) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = +now - +target; // positivo si es pasado, negativo si es futuro
  const diffSeconds = Math.abs(diffMs) / 1000;
  const diffMinutes = diffSeconds / 60;
  const diffHours = diffMinutes / 60;
  const diffDays = diffHours / 24;

  const sign = diffMs >= 0 ? 1 : -1;

  if (diffSeconds < 60) {
    return sign * Math.floor(diffSeconds) + " segundos";
  } else if (diffMinutes < 60) {
    return (
      sign * Math.floor(diffMinutes) +
      " " +
      pluralize("minuto", Math.floor(diffMinutes))
    );
  } else if (diffHours < 24) {
    const rounded = Math.floor(diffHours * 10) / 10;
    return sign * rounded + " " + pluralize("hora", rounded);
  } else {
    const rounded = Math.floor(diffDays * 10) / 10;
    return sign * rounded + " " + pluralize("día", rounded);
  }
};

export const getPeriodFilter = (
  period: string,
  full_date_field: string = "full_date",
  today = new Date()
) => {
  if (!period) return null;
  const correctHours = process.env.NODE_ENV === "development" ? 3 : 0;
  today.setHours(today.getHours() + correctHours);
  const fullDate = getFullDate(today);
  const field = (key: string) => `${full_date_field}.${key}`;

  if (period.startsWith("custom_")) {
    const [yearStr, monthStr] = period.replace("custom_", "").split("-");
    return {
      [field("year")]: parseInt(yearStr),
      [field("month")]: parseInt(monthStr),
    };
  }

  switch (period) {
    case "this_week":
      return {
        [field("year")]: fullDate.year,
        [field("week")]: fullDate.week,
      };
    case "last_week":
      return {
        [field("year")]:
          fullDate.week === 1 ? fullDate.year - 1 : fullDate.year,
        [field("week")]: fullDate.week === 1 ? 52 : fullDate.week - 1,
      };
    case "next_week":
      return {
        [field("year")]:
          fullDate.week === 52 ? fullDate.year + 1 : fullDate.year,
        [field("week")]: fullDate.week === 52 ? 1 : fullDate.week + 1,
      };
    case "this_month":
      return {
        [field("year")]: fullDate.year,
        [field("month")]: fullDate.month,
      };
    case "last_month":
      return {
        [field("year")]:
          fullDate.month === 1 ? fullDate.year - 1 : fullDate.year,
        [field("month")]: fullDate.month === 1 ? 12 : fullDate.month - 1,
      };
    case "next_month":
      return {
        [field("year")]:
          fullDate.month === 12 ? fullDate.year + 1 : fullDate.year,
        [field("month")]: fullDate.month === 12 ? 1 : fullDate.month + 1,
      };
    case "this_year":
      return {
        [field("year")]: fullDate.year,
      };
    case "last_year":
      return {
        [field("year")]: fullDate.year - 1,
      };
    case "next_year":
      return {
        [field("year")]: fullDate.year + 1,
      };
    case "last_2_years":
      return {
        [field("year")]: { $gte: fullDate.year - 1, $lte: fullDate.year },
      };
    case "last_3_years":
      return {
        [field("year")]: { $gte: fullDate.year - 2, $lte: fullDate.year },
      };
    case "last_4_years":
      return {
        [field("year")]: { $gte: fullDate.year - 3, $lte: fullDate.year },
      };
    case "last_5_years":
      return {
        [field("year")]: { $gte: fullDate.year - 4, $lte: fullDate.year },
      };
    default:
      return {
        [field("year")]: fullDate.year,
        [field("week")]: fullDate.week,
      };
  }
};

export const correctHours = (date: Date) => {
  const correctHours = process.env.NODE_ENV === "development" ? 3 : 0;
  const adaptedDate = new Date(date);
  adaptedDate.setHours(adaptedDate.getHours() + correctHours);
  return adaptedDate;
};
