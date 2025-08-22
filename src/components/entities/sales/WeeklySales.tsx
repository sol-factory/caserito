"use client";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";
import { capitalizeFirstLetter } from "@/helpers/text";
import { useStore } from "@/stores";
import { addDays, endOfDay, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import WeeklySale from "./WeeklySale";
import { getFullDate } from "@/helpers/date";
import WeeklyDayWorkload from "./WeeklyDayWorkload";

const WeeklySales = ({ weekSales, staying_cars, date, companyName }) => {
  const firstSale = weekSales[0];
  const store = useStore((s) => s.current_store);
  const show_cars = useStore((s) => s.show_cars);
  const daysOfWeek = new Array(7)
    .fill(0)
    .map((_, i) =>
      addDays(startOfWeek(firstSale?.date || date, { weekStartsOn: 1 }), i)
    );

  const router = useRouter();

  return (
    <div>
      {(weekSales.length > 0 || staying_cars.length > 0) && (
        <div className="flex justify-between w-full px-1 gap-1 min-w-[500px] mt-3">
          {daysOfWeek.map((day, i) => {
            const daySales = weekSales.filter(
              (s) => s.full_date.day === day.getDate()
            );

            const dayStayingCars = staying_cars.filter(
              (sc) =>
                sc.full_date?.day !== day.getDate() &&
                sc.date < day &&
                endOfDay(sc.pick_up_date) >= endOfDay(day)
            );

            const servicesCount = daySales.reduce(
              (acc, s) => acc + s.services.length,
              0
            );

            return (
              <div
                className="flex flex-col items-center max-h-[60rem] !overflow-x-visible"
                key={i}
              >
                <div className="flex flex-col w-28 text-center mb-4 ">
                  <div
                    className="flex flex-col group !cursor-pointer"
                    onClick={() => router.push(`/washes?date=${+day}`)}
                  >
                    <span className="font-bold group-hover:underline ">
                      {capitalizeFirstLetter(
                        format(day, "EEEE", { locale: es })
                      )}
                    </span>
                    <span className="text-muted-foreground font-extralight text-[0.6rem] -mt-1 mb-1">
                      {format(day, "d", { locale: es })} de{" "}
                      {format(day, "MMMM", { locale: es })}
                    </span>
                  </div>

                  <WeeklyDayWorkload
                    day={day}
                    store={store}
                    daySales={daySales}
                    dayStayingCars={dayStayingCars}
                    servicesCount={servicesCount}
                  />
                </div>
                <div
                  className={`flex flex-col w-[7rem] justify-start gap-0.5 !overflow-y-scroll overflow-x-visible no-scrollbar  !max-h-[50rem] ${daySales.length <= 2 ? "pb-[4rem]" : "pb-[15rem]"}`}
                >
                  {daySales.map((s) => (
                    <WeeklySale
                      key={s._id}
                      s={s}
                      companyName={companyName}
                      day={day.getDate()}
                    />
                  ))}
                  {show_cars &&
                    dayStayingCars.map((s, index) => {
                      const full_pick_up_date = s.pick_up_date
                        ? getFullDate(s.pick_up_date)
                        : null;
                      return (
                        <WeeklySale
                          key={index}
                          s={s}
                          companyName={companyName}
                          isStayingCar
                          day={day.getDate()}
                          isLeaving={
                            full_pick_up_date?.day === day.getDate() &&
                            full_pick_up_date?.month === day.getMonth() + 1
                          }
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {weekSales.length === 0 && (
        <div className="flex flex-col items-center">
          <NoRecordsFound text="No se encontró ninguna venta en esta sucursal" />
        </div>
      )}
    </div>
  );
};

export default WeeklySales;
