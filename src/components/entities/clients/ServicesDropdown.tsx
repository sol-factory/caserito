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
import { useStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";

import api from "@/helpers/api";
import { Bell } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createQueryString } from "@/helpers/url";

export function ServicesDropdown({ openText }: { openText: string }) {
  const update = useStore((s) => s.update);
  const openMenu = useStore((s) => s.openMenu);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected_id = searchParams.get("service_id");
  const { data: services } = useQuery({
    queryKey: ["service"],
    queryFn: async () => {
      const data = await api({}, "service", "getItems");
      return data || [];
    },
  });

  const selected = services?.find((s) => s._id === selected_id);

  return (
    <DropdownMenu open={openMenu === "services"} modal={false}>
      <DropdownMenuTrigger asChild>
        <span
          onClick={(e) => {
            e.stopPropagation();
            update("openMenu", openMenu === "services" ? "" : "services");
          }}
          className=" ml-2 w-fit text-center font-light text-blue-600 hover:underline hover:cursor-pointer mr-2"
        >
          {!selected ? openText : selected.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" side="top">
        <DropdownMenuLabel className="text-center ">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" strokeWidth={1} />
            Elegir servicio
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {services?.map((s) => (
            <DropdownMenuItem
              className="flex flex-col items-start justify-between cursor-pointer"
              key={s._id}
              onClick={() => {
                router.push(
                  `/clients?${createQueryString(
                    searchParams,
                    ["service_id", "days_ago"],
                    [s._id, "30"],
                    pathname
                  )}`
                );
                update("openMenu", "");
              }}
            >
              <span>{s.name}</span>{" "}
              <span className="text-[10px] font-extralight text-muted-foreground -mt-1">
                {s.detail}
              </span>
            </DropdownMenuItem>
          ))}
          {services?.length === 0 && (
            <span className="block w-full text-center text-xs text-muted-foreground mt-5 mb-5">
              No hay servicios creados
            </span>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
