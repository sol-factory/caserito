"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createQueryString, removeQueryString } from "@/helpers/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";
import SelectedMonth from "../entities/clients/SelectedMonth";
export const meses = {
  "1": "Enero",
  "2": "Febrero",
  "3": "Marzo",
  "4": "Abril",
  "5": "Mayo",
  "6": "Junio",
  "7": "Julio",
  "8": "Agosto",
  "9": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

export default function DropdownFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const month = searchParams.get("month");
  const handleMonthSelection = (m: string) => {
    if (month === m) {
      router.push(pathname);
      return;
    }

    router.push(
      `${pathname}?${createQueryString(searchParams, "month", m, pathname)}`
    );
  };

  useEffect(() => {
    const params = searchParams.toString();
    localStorage.setItem("/clients", params.toString());
  }, [searchParams]);
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="link"
            className="w-full px-2 outline-none !ring-0 h-6 text-md"
          >
            <SelectedMonth month={month} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64" side="bottom" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="">
              <span className="mr-1">🥳</span> Mes de cumpleaños
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-row">
              <div className="flex flex-col w-24">
                {Object.keys(meses)
                  .slice(0, 6)
                  .map((mes) => (
                    <DropdownMenuItem
                      className={`cursor-pointer ${
                        month === mes ? "bg-accent" : ""
                      }`}
                      key={mes}
                      onClick={() => handleMonthSelection(mes)}
                    >
                      {meses[mes]}
                    </DropdownMenuItem>
                  ))}
              </div>
              <div className="w-24">
                {Object.keys(meses)
                  .slice(6, 13)
                  .map((mes) => (
                    <DropdownMenuItem
                      className={`cursor-pointer ${
                        month === mes ? "bg-accent" : ""
                      }`}
                      key={mes}
                      onClick={() => handleMonthSelection(mes)}
                    >
                      {meses[mes]}
                    </DropdownMenuItem>
                  ))}
              </div>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
