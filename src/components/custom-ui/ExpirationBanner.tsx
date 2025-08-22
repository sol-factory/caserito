"use client";

import { Button } from "@/components/ui/button";
import { addEvent } from "@/helpers/api";
import usePermissions from "@/hooks/use-permissions";
import { addDays, endOfDay } from "date-fns";
import { AlertCircle, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Define the sale end date - eg: new Date('2024-12-31T23:59:59');
// Setting 9h 45m 24s from now for demo purposes

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function ExpirationBanner({ remainingDays }) {
  const { isOwner } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const endDate = useMemo(
    () => endOfDay(addDays(new Date(), Math.max(remainingDays - 1, 0))),
    [remainingDays]
  );

  const [isVisible, setIsVisible] = useState(false);
  const [alreadyCheckVisiblity, setAlreadyCheckVisibility] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const hideExpirationBanner = localStorage.getItem("hideExpirationBanner");
    if (!!hideExpirationBanner && +hideExpirationBanner <= remainingDays) {
      setIsVisible(false);
    }
    setAlreadyCheckVisibility(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    // Calculate immediately and then every second
    if (remainingDays > 0 && isVisible) {
      if (isVisible) {
        calculateTimeLeft();
      }
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  if (
    !isVisible ||
    timeLeft.isExpired ||
    remainingDays > 4 ||
    !alreadyCheckVisiblity ||
    pathname === "/subscription"
  )
    return null;

  const bg = {
    1: "bg-orange-600",
    2: "bg-yellow-600",
    3: "bg-blue-600",
  };

  return (
    <div
      className={`dark ${bg[remainingDays] || "bg-red-600"} px-4  sm:mr-6 sm:rounded-xl py-3 text-foreground mt-16 sm:mt-0 sm:mb-0 -mb-5`}
    >
      <div className="flex gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 max-md:mt-0.5"
            aria-hidden="true"
          >
            <AlertCircle className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {remainingDays <= 0
                  ? "Período de prueba finalizado"
                  : remainingDays === 1
                    ? "¡Mañana finaliza su período de prueba!"
                    : `¡En ${remainingDays} días finaliza su período de prueba!`}
              </p>
              <p className="text-xs font-extralight !-mt-[0.5px]">
                No posee suscripción en esta sucursal, contrate una
                <br /> para seguir utilizando Aquapp
              </p>
            </div>
            <div className="flex gap-3 max-md:flex-wrap">
              <div className="flex items-center text-gray-800 divide-x divide-primary-foreground rounded-lg bg-primary/15 text-sm tabular-nums bg-white">
                {timeLeft.days > 0 && (
                  <span className="flex h-8  items-center justify-center p-2">
                    {timeLeft.days}
                    <span className="text-muted-foreground font-extralight">
                      d
                    </span>
                  </span>
                )}
                <span className="flex h-8 items-center justify-center p-2">
                  {timeLeft.hours.toString().padStart(2, "0")}
                  <span className="text-muted-foreground font-extralight">
                    h
                  </span>
                </span>
                <span className="flex h-8 items-center justify-center p-2">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                  <span className="text-muted-foreground font-extralight">
                    m
                  </span>
                </span>
                <span className="flex h-8 items-center justify-center p-2">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                  <span className="text-muted-foreground font-extralight">
                    s
                  </span>
                </span>
              </div>
              {isOwner && (
                <Button
                  size="sm"
                  className="text-sm"
                  onClick={async () => {
                    router.push("/subscription");
                    await addEvent(
                      navigator.userAgent,
                      "aquapp",
                      `Click en "Contratar suscripción (banner)"`
                    );
                  }}
                >
                  Contratar
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => {
            setIsVisible(false);
            localStorage.setItem("hideExpirationBanner", remainingDays);
          }}
          aria-label="Close banner"
        >
          <X
            size={16}
            strokeWidth={2}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}
