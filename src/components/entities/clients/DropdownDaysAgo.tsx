"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pluralize } from "@/helpers/text";

import { createQueryString } from "@/helpers/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DAYS_AGO = {
  "15": "15 días",
  "30": "30 días",
  "60": "60 días",
  "90": "90 días",
  "180": "180 días",
  "360": "360 días",
};

const QUOTES_DAYS_AGO = {
  "0": "0 días",
  "5": "5 días",
  "15": "15 días",
  "30": "30 días",
  "60": "60 días",
  "90": "90 días",
  "180": "180 días",
  "360": "360 días",
};

export default function DropdownDaysAgo({ screen = "clients" }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const days_ago = searchParams.get("days_ago");
  const handleMonthSelection = (da: string) => {
    router.push(
      `${pathname}?${createQueryString(searchParams, "days_ago", da, pathname)}`
    );
  };

  const FINAL_DAYS_AGO = screen === "quotes" ? QUOTES_DAYS_AGO : DAYS_AGO;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="text-blue-600 font-light hover:underline hover:cursor-pointer ml-2 mr-2">
            {days_ago} {pluralize("día", +days_ago)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 sm:w-fit"
          side="bottom"
          align="start"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="">
              <span className="mr-1">🗓️</span> Hace más de...
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-row">
              <div className="flex flex-col w-40">
                {Object.keys(FINAL_DAYS_AGO).map((da) => (
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      days_ago === da ? "bg-accent" : ""
                    }`}
                    key={da}
                    onClick={() => handleMonthSelection(da)}
                  >
                    {FINAL_DAYS_AGO[da]}
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
