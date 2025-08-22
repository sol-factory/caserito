import { endOfDay, startOfDay } from "date-fns";

export const getBooleanRoles = (user) => {
  return {
    isOwner: user?.role === "Socio",
    isManager: user?.role === "Encargado",
    isTechnical: user?.role === "Técnico",
  };
};

export const canFinish = (sale) => {
  return !sale.finished && !sale.taken_away && sale.date < endOfDay(new Date());
};

export const canTakeAway = (sale) => {
  return !sale?.taken_away && sale.date < endOfDay(new Date());
};

export const canReactivate = (sale, isOwner, isManager) => {
  const todayOrFutureSale = sale.date > startOfDay(new Date());
  return sale.finished && (isOwner || isManager) && todayOrFutureSale;
};
